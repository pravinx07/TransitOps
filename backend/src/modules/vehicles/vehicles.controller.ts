import { Request as Req, Response as Res } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sendSuccess = (res: Res, data: any, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res: Res, message: string, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

export const getVehicles = async (req: Req, res: Res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
    return sendSuccess(res, vehicles, 'Vehicles retrieved successfully');
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return sendError(res, 'Failed to retrieve vehicles');
  }
};

export const getAvailableVehicles = async (req: Req, res: Res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, vehicles, 'Available vehicles retrieved successfully');
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    return sendError(res, 'Failed to retrieve available vehicles');
  }
};
