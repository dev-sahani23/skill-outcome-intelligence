import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: req.user?.id } });
    if (!traineeProfile) return res.status(404).json({ error: "Profile not found" });

    const { latitude, longitude, accuracy } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: "Invalid coordinates provided" });
    }

    // Reverse geocode to find state and district
    // We use Nominatim OpenStreetMap API for free reverse geocoding
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
      headers: {
        'User-Agent': 'SkillOutcomeIntelligenceApp/1.0'
      }
    });

    if (!response.ok) {
      console.warn("Reverse geocoding failed", response.status);
      return res.status(502).json({ error: "Failed to resolve location" });
    }

    const data = await response.json();
    const address = data.address || {};
    
    // Fallbacks for district/state mapping from OSM
    const districtName = address.state_district || address.county || address.city || "Unknown";
    const stateName = address.state || "Unknown";

    // 1. We look up or create the District in our database to normalize it.
    // In a real production app, we might fuzzy match against a known list of districts.
    // For this implementation, we upsert to keep it simple and preserve referential integrity.
    let district = await prisma.district.findFirst({
      where: {
        name: { equals: districtName, mode: 'insensitive' },
        state: { equals: stateName, mode: 'insensitive' }
      }
    });

    if (!district) {
      district = await prisma.district.create({
        data: {
          name: districtName,
          state: stateName
        }
      });
    }

    // Update the trainee profile with the district reference.
    // We intentionally DO NOT store precise lat/long to respect data minimization principles.
    await prisma.traineeProfile.update({
      where: { id: traineeProfile.id },
      data: {
        districtId: district.id,
        district: districtName // Fallback for backward compatibility in schema
      }
    });

    return res.status(200).json({
      message: "Location successfully recorded",
      location: { district: districtName, state: stateName }
    });

  } catch (error: any) {
    console.error("Error in updateLocation:", error.message);
    return res.status(500).json({ error: "Internal server error updating location" });
  }
};
