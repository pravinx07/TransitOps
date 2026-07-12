import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all maintenance records
export const getMaintenanceRecords = async (req: Request, res: Response) => {
  try {
    const records = await prisma.maintenance.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(records);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a maintenance record
export const createMaintenanceRecord = async (req: Request, res: Response) => {
  const { vehicleId, serviceType, cost, date } = req.body;

  try {
    // Basic validation
    if (!vehicleId || !serviceType || cost === undefined || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Wrap in transaction
    const [maintenance, vehicle] = await prisma.$transaction([
      prisma.maintenance.create({
        data: {
          vehicleId,
          serviceType,
          cost: Number(cost),
          date: new Date(date),
          status: 'ACTIVE',
        },
        include: {
          vehicle: true,
        }
      }),
      prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'IN_MAINTENANCE' },
      }),
    ]);

    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update maintenance status
export const completeMaintenance = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await prisma.maintenance.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    if (existing.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Maintenance record is already completed' });
    }

    // Transaction to update maintenance status and vehicle status
    const [maintenance, vehicle] = await prisma.$transaction([
      prisma.maintenance.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: { vehicle: true },
      }),
      prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    res.json(maintenance);
  } catch (error) {
    console.error('Error completing maintenance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
