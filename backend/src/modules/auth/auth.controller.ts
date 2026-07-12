import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      sendError(res, "Email already in use", 409, { email: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        failedAttempts: 0,
        lockedUntil: null,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    sendSuccess(res, { user, token }, "Registered successfully", 201);
  } catch (error) {
    sendError(res, "Registration failed", 500, error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendError(res, "Invalid credentials", 401, { email: "Invalid credentials" });
      return;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      sendError(
        res,
        `Account locked. Try again in ${remainingTime} minutes.`,
        403,
        { email: `Account locked after 5 failed attempts. Locked for ${remainingTime}m.` }
      );
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    const isRoleValid = user.role === role;

    if (!isPasswordValid || !isRoleValid) {
      // Increment failed attempts
      const newFailedAttempts = user.failedAttempts + 1;
      let lockedUntil: Date | null = null;
      let errorMessage = "Invalid credentials";
      let errorFields: Record<string, string> = { password: "Invalid credentials" };

      if (newFailedAttempts >= 5) {
        // Lock account for 15 minutes
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        errorMessage = "Invalid credentials. Account locked after 5 failed attempts.";
        errorFields = { email: "Invalid credentials. Account locked after 5 failed attempts." };
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0, // Reset counter upon locking
            lockedUntil,
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: newFailedAttempts,
          },
        });
      }

      sendError(res, errorMessage, 401, errorFields);
      return;
    }

    // Successful login: reset lockout fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const { password: _, failedAttempts: __, lockedUntil: ___, ...userWithoutSecrets } = user;

    sendSuccess(res, { user: userWithoutSecrets, token }, "Login successful");
  } catch (error) {
    sendError(res, "Login failed", 500, error);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }
    sendSuccess(res, user);
  } catch (error) {
    sendError(res, "Failed to get user", 500, error);
  }
};
