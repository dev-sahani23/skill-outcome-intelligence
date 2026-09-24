import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { z } from "zod";

const MAHARASHTRA_DISTRICTS = [
  { name: "Pune", minLat: 17.9, maxLat: 18.9, minLng: 73.4, maxLng: 74.5 },
  { name: "Mumbai", minLat: 18.8, maxLat: 19.3, minLng: 72.7, maxLng: 73.1 },
  { name: "Nagpur", minLat: 20.9, maxLat: 21.4, minLng: 78.8, maxLng: 79.3 },
  { name: "Aurangabad", minLat: 19.6, maxLat: 20.1, minLng: 75.1, maxLng: 75.6 },
  { name: "Nashik", minLat: 19.8, maxLat: 20.3, minLng: 73.6, maxLng: 74.1 },
  { name: "Thane", minLat: 19.1, maxLat: 19.4, minLng: 72.9, maxLng: 73.3 },
];

const findDistrict = (lat: number, lng: number): string | null => {
  const match = MAHARASHTRA_DISTRICTS.find(d =>
    lat >= d.minLat && lat <= d.maxLat &&
    lng >= d.minLng && lng <= d.maxLng
  );
  return match?.name ?? null;
};

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  capturedAt: z.string().datetime().optional()
});

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: req.user?.id } });
    if (!traineeProfile) return res.status(404).json({ error: "Profile not found" });

    const parsed = locationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid coordinates provided", details: parsed.error.issues });
    }

    const { latitude, longitude, accuracy, capturedAt } = parsed.data;

    // 1. Store raw coordinates in separate table
    await prisma.traineeLocation.create({
      data: {
        traineeId: traineeProfile.id,
        latitude,
        longitude,
        accuracy,
        capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
      }
    });

    // 2. Reverse geocode to find district
    const districtName = findDistrict(latitude, longitude);
    let districtUpdated = false;

    if (districtName) {
      let district = await prisma.district.findFirst({
        where: { name: districtName }
      });
      
      if (!district) {
        district = await prisma.district.create({
          data: { name: districtName, state: "Maharashtra" }
        });
      }

      await prisma.traineeProfile.update({
        where: { id: traineeProfile.id },
        data: { districtId: district.id, district: districtName }
      });
      
      // Log audit
      await prisma.auditLog.create({
        data: {
          actorUserId: req.user?.id,
          action: "location_updated",
          entityType: "TraineeProfile",
          entityId: traineeProfile.id
        }
      });
      
      districtUpdated = true;
    }

    return res.status(200).json({
      districtDetected: districtName,
      districtUpdated,
      message: "Location successfully recorded"
    });
  } catch (error: any) {
    console.error("Error in updateLocation:", error.message);
    return res.status(500).json({ error: "Internal server error updating location" });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: req.user?.id } });
    if (!traineeProfile) return res.status(404).json({ error: "Profile not found" });

    await prisma.traineeLocation.deleteMany({
      where: { traineeId: traineeProfile.id }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: req.user?.id,
        action: "location_deleted",
        entityType: "TraineeProfile",
        entityId: traineeProfile.id
      }
    });

    return res.status(200).json({ message: "Location data deleted" });
  } catch (error: any) {
    console.error("Error in deleteLocation:", error.message);
    return res.status(500).json({ error: "Internal server error deleting location" });
  }
};
