import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendError } from "../utils/apiResponse";

export const validate = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Map Zod errors to field-specific key-value pairs
        const formattedErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          // If the path starts with 'body', we take the key after 'body'
          const key = String(issue.path[1] || issue.path[0]);
          if (key) {
            formattedErrors[key] = issue.message;
          }
        });
        sendError(res, "Validation failed", 400, formattedErrors);
        return;
      }
      sendError(res, "Internal validation error", 500, error);
    }
  };
};
