import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/apiResponse";

const DEFAULT_RBAC = {
  '/dashboard':    ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  '/vehicles':     ['FLEET_MANAGER'],
  '/drivers':      ['SAFETY_OFFICER'],
  '/trips':        ['DRIVER'],
  '/maintenance':  ['FLEET_MANAGER'],
  '/fuel-expenses':['FINANCIAL_ANALYST'],
  '/analytics':    ['FINANCIAL_ANALYST'],
  '/settings':     ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
};

// GET /api/settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "global",
          depotName: "Gandhinagar Depot 024",
          currency: "INR (₹)",
          distanceUnit: "Kilometers",
          rbac: DEFAULT_RBAC
        }
      });
    } else if (!settings.rbac) {
      settings = await prisma.settings.update({
        where: { id: "global" },
        data: { rbac: DEFAULT_RBAC }
      });
    }

    sendSuccess(res, settings, "Settings fetched successfully");
  } catch (error) {
    sendError(res, "Failed to fetch settings", 500, error);
  }
};

// PUT /api/settings
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { depotName, currency, distanceUnit, rbac } = req.body;

    const dataToUpdate: any = { depotName, currency, distanceUnit };
    if (rbac) dataToUpdate.rbac = rbac;

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: dataToUpdate,
      create: { id: "global", depotName, currency, distanceUnit, rbac: rbac || DEFAULT_RBAC }
    });

    sendSuccess(res, settings, "Settings updated successfully");
  } catch (error) {
    sendError(res, "Failed to update settings", 500, error);
  }
};
