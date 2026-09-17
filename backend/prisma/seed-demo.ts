import { Role, OutcomeType, EnrollmentStatus, AnomalyFlagType, FlagStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/utils/password';
import { v4 as uuidv4 } from 'uuid';

const isResetOnly = process.argv.includes('--reset');

async function cleanDemoData() {
  console.log("Cleaning existing demo data...");
  const demoDomains = ["@skillportal.gov.in", "@skillcorp.in", "@badprovider.in", "@skillportal.com"];
  
  for (const domain of demoDomains) {
    const users = await prisma.user.findMany({ where: { email: { endsWith: domain } } });
    for (const user of users) {
      // Due to cascade deletes, this will delete trainee profiles, provider profiles, etc.
      await prisma.user.delete({ where: { id: user.id } });
    }
  }

  // Also clean up any districts created by demo to avoid duplicates
  await prisma.district.deleteMany({
    where: { name: { in: ["Pune Demo", "Nagpur Demo", "Aurangabad Demo"] } }
  });

  // Clean skill gaps that might not be attached to users
  await prisma.skillGapReport.deleteMany({
    where: { sector: "IT (Demo)" }
  });
}

async function main() {
  await cleanDemoData();

  if (isResetOnly) {
    console.log("Reset complete. Exiting.");
    return;
  }

  console.log("Seeding realistic demo data...");

  const defaultPassword = await hashPassword("Demo@1234");

  // --- 1. ADMIN ---
  const admin = await prisma.user.create({
    data: {
      email: "admin@skillportal.gov.in",
      passwordHash: defaultPassword,
      role: Role.GOVERNMENT_ADMIN,
      adminProfile: {
        create: {
          fullName: "Govt Admin (Demo)",
          department: "Skills Department",
        }
      }
    }
  });

  // --- 2. DISTRICTS ---
  const pune = await prisma.district.create({ data: { name: "Pune Demo", state: "Maharashtra" } });
  const nagpur = await prisma.district.create({ data: { name: "Nagpur Demo", state: "Maharashtra" } });
  const aurangabad = await prisma.district.create({ data: { name: "Aurangabad Demo", state: "Maharashtra" } });
  const demoDistricts = [pune, nagpur, aurangabad];

  // --- 3. PROVIDERS & COURSES ---
  
  // Provider A (Good Rating)
  const providerA = await prisma.user.create({
    data: {
      email: "providerA@skillcorp.in",
      passwordHash: defaultPassword,
      role: Role.PROVIDER,
      providerProfile: {
        create: {
          instituteName: "Excel Skills Academy",
          contactPerson: "Aditi Sharma",
          phone: "9876543210",
          districtId: pune.id,
          isVerified: true
        }
      }
    },
    include: { providerProfile: true }
  });

  const progA1 = await prisma.trainingProgram.create({
    data: {
      providerId: providerA.providerProfile!.id,
      name: "Full Stack Web Development",
      durationMonths: 6,
      sector: "IT (Demo)",
      certificationName: "FSWD Level 1"
    }
  });

  const progA2 = await prisma.trainingProgram.create({
    data: {
      providerId: providerA.providerProfile!.id,
      name: "Cloud Solutions Architect",
      durationMonths: 4,
      sector: "IT (Demo)",
      certificationName: "CSA Basics"
    }
  });

  await prisma.courseRating.create({
    data: {
      programId: progA1.id,
      ratingPeriodStart: new Date("2025-01-01"),
      ratingPeriodEnd: new Date("2026-01-01"),
      weightedPlacementScore: 88,
      relativeLayoffScore: 92,
      relevanceScore: 85,
      wageProgressionScore: 80,
      sampleSize: 120,
      finalScore: 82.5 // Good Score
    }
  });

  // Provider B (Bad Rating + Anomaly)
  const providerB = await prisma.user.create({
    data: {
      email: "providerB@badprovider.in",
      passwordHash: defaultPassword,
      role: Role.PROVIDER,
      providerProfile: {
        create: {
          instituteName: "QuickFix Training Center",
          contactPerson: "Ravi Kumar",
          phone: "9876543211",
          districtId: nagpur.id,
          isVerified: true
        }
      }
    },
    include: { providerProfile: true }
  });

  const progB1 = await prisma.trainingProgram.create({
    data: {
      providerId: providerB.providerProfile!.id,
      name: "Basic Data Entry",
      durationMonths: 2,
      sector: "IT (Demo)",
      certificationName: "Data Entry Operator"
    }
  });

  const progB2 = await prisma.trainingProgram.create({
    data: {
      providerId: providerB.providerProfile!.id,
      name: "Digital Marketing FastTrack",
      durationMonths: 1,
      sector: "IT (Demo)",
      certificationName: "DM Level 1"
    }
  });

  await prisma.courseRating.create({
    data: {
      programId: progB1.id,
      ratingPeriodStart: new Date("2025-01-01"),
      ratingPeriodEnd: new Date("2026-01-01"),
      weightedPlacementScore: 45,
      relativeLayoffScore: 60,
      relevanceScore: 50,
      wageProgressionScore: 48,
      sampleSize: 80,
      finalScore: 51.2 // Bad Score
    }
  });

  // Anomaly Flags
  await prisma.providerAnomalyFlag.create({
    data: {
      providerId: providerB.providerProfile!.id,
      flagType: AnomalyFlagType.PLACEMENT_VARIANCE,
      zScore: 3.4,
      detail: "Suspiciously high identical placements reported for same employer but low retention.",
      status: FlagStatus.OPEN
    }
  });

  await prisma.providerAnomalyFlag.create({
    data: {
      providerId: providerB.providerProfile!.id,
      flagType: AnomalyFlagType.WAGE_CLUSTERING,
      zScore: 2.9,
      detail: "Exact same wage reported for 40 trainees on the same date.",
      status: FlagStatus.CONFIRMED,
      reviewedById: admin.id,
      reviewedAt: new Date()
    }
  });

  // --- 4. TRAINEES & OUTCOMES ---
  const programs = [progA1, progA2, progB1, progB2];
  
  for (let i = 1; i <= 15; i++) {
    const isMainTrainee = i === 1;
    const email = isMainTrainee ? "trainee1@skillportal.com" : `trainee${i}@skillportal.com`;
    const district = demoDistricts[i % demoDistricts.length];
    const program = programs[i % programs.length];
    const hash = uuidv4();

    const trainee = await prisma.user.create({
      data: {
        email,
        passwordHash: defaultPassword,
        role: Role.TRAINEE,
        traineeProfile: {
          create: {
            fullName: isMainTrainee ? "Ramesh Demo" : `Trainee Demo ${i}`,
            phone: `999000${i.toString().padStart(4, '0')}`,
            districtId: district.id,
            district: district.name,
            contacts: {
              create: [
                { contactType: "SELF", name: isMainTrainee ? "Ramesh Demo" : `Trainee Demo ${i}`, phone: `999000${i.toString().padStart(4, '0')}`, priorityOrder: 1 }
              ]
            }
          }
        }
      },
      include: { traineeProfile: true }
    });

    const enrolledDate = new Date();
    enrolledDate.setMonth(enrolledDate.getMonth() - 8);
    const completedDate = new Date();
    completedDate.setMonth(completedDate.getMonth() - 2);

    const enrollment = await prisma.enrollment.create({
      data: {
        traineeId: trainee.traineeProfile!.id,
        programId: program.id,
        status: EnrollmentStatus.COMPLETED,
        enrolledAt: enrolledDate,
        completedAt: completedDate,
        isCertified: true,
        certificateId: hash
      }
    });

    if (i % 3 !== 0) { // Placed
      const outcome = await prisma.employmentOutcome.create({
        data: {
          traineeId: trainee.traineeProfile!.id,
          type: OutcomeType.FORMAL_EMPLOYMENT,
          employerName: `Tech Corp ${district.name}`,
          designation: "Developer",
          monthlyWage: 20000 + (i * 1000),
          districtId: district.id,
          isVerified: true
        }
      });

      // Wage Records
      await prisma.wageRecord.createMany({
        data: [
          { outcomeId: outcome.id, recordedDate: completedDate, salaryAmount: 20000 + (i * 1000) },
          { outcomeId: outcome.id, recordedDate: new Date(), salaryAmount: 22000 + (i * 1000) }
        ]
      });

      // Follow Up RESPONDED
      if (i % 2 === 0 || isMainTrainee) {
        await prisma.followUp.create({
          data: {
            traineeId: trainee.traineeProfile!.id,
            stage: "DAY_30",
            scheduledDate: completedDate,
            status: "RESPONDED",
            channelUsed: "WHATSAPP",
            responseData: {
              employmentStatus: "employed",
              salary: 22000 + (i * 1000),
              sentimentSignal: "positive",
              jobRole: "Developer"
            },
            completedAt: new Date()
          }
        });
      }
    } else { // Unemployed
      await prisma.employmentOutcome.create({
        data: {
          traineeId: trainee.traineeProfile!.id,
          type: OutcomeType.UNEMPLOYED,
          nonPlacementReason: "Preparing for govt exams",
          skillGapIdentified: "Communication"
        }
      });
    }

    // Skill Assessments for a few
    if (i <= 3) {
      await prisma.skillAssessment.create({
        data: {
          traineeId: trainee.traineeProfile!.id,
          enrollmentId: enrollment.id,
          status: "COMPLETED",
          claimedSkills: ["React", "Node.js"],
          claimedCertifications: [],
          claimedProjects: [],
          claimedCourses: [],
          skillGapScore: 25 + i * 10,
          verificationConfidence: 0.9,
          analysisResult: {
            verifiedSkills: ["React"],
            skillGaps: [{ skill: "Node.js", reason: "Could not answer basic backend architecture questions" }],
            overallAssessment: "Strong frontend, needs backend work"
          },
          completedAt: new Date()
        }
      });
    }
  }

  // --- 5. SKILL GAPS ---
  await prisma.skillGapReport.create({
    data: { sector: "IT (Demo)", skillName: "Cloud Computing", districtId: pune.id, demandScore: 90, supplyScore: 40, gapScore: 50 }
  });
  await prisma.skillGapReport.create({
    data: { sector: "IT (Demo)", skillName: "Cybersecurity", districtId: nagpur.id, demandScore: 85, supplyScore: 20, gapScore: 65 }
  });
  await prisma.skillGapReport.create({
    data: { sector: "IT (Demo)", skillName: "React Development", districtId: aurangabad.id, demandScore: 70, supplyScore: 60, gapScore: 10 }
  });

  console.log("Demo seed complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
