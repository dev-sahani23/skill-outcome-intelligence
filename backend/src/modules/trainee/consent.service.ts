import { prisma } from "../../lib/prisma";

/**
 * Grants consent for a trainee and logs the consent record.
 */
export const grantConsent = async (traineeId: string, consentType: string, version: string = "v1") => {
  // Update the boolean flag
  const trainee = await prisma.traineeProfile.update({
    where: { id: traineeId },
    data: { consentGiven: true }
  });

  // Log the comprehensive consent record
  const consentRecord = await prisma.consentRecord.create({
    data: {
      traineeId,
      consentType,
      consentVersion: version
    }
  });

  return { trainee, consentRecord };
};

/**
 * Revokes consent for a trainee. 
 * Finds the most recent active consent record of that type, marks revokedAt,
 * and updates the boolean flag based on remaining active consents.
 */
export const revokeConsent = async (traineeId: string, consentType: string) => {
  // Find active consent
  const activeConsent = await prisma.consentRecord.findFirst({
    where: {
      traineeId,
      consentType,
      revokedAt: null
    },
    orderBy: { grantedAt: "desc" }
  });

  if (activeConsent) {
    await prisma.consentRecord.update({
      where: { id: activeConsent.id },
      data: { revokedAt: new Date() }
    });
  }

  // Check if any other consents remain active
  const remainingConsents = await prisma.consentRecord.count({
    where: {
      traineeId,
      revokedAt: null
    }
  });

  const trainee = await prisma.traineeProfile.update({
    where: { id: traineeId },
    data: { consentGiven: remainingConsents > 0 }
  });

  return { trainee };
};
