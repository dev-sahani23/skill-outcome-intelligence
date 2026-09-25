import * as dotenv from 'dotenv';
dotenv.config();

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
      await prisma.user.delete({ where: { id: user.id } });
    }
  }

  await prisma.district.deleteMany({
    where: { name: { in: ["Pune Demo", "Nagpur Demo", "Aurangabad Demo", "Mumbai Demo", "Nashik Demo", "Thane Demo"] } }
  });

  await prisma.skillGapReport.deleteMany({
    where: { sector: "IT (Demo)" }
  });
}

async function main() {
  console.log("Seeding realistic demo data deterministically...");

  if (isResetOnly) {
    await cleanDemoData();
    console.log("Reset complete. Exiting.");
    return;
  }

  const defaultPassword = await hashPassword("Demo@1234");

  // --- 1. ADMINS ---
  const admins = [];
  for (let i = 1; i <= 10; i++) {
    const admin = await prisma.user.upsert({
      where: { email: `admin${i}@skillportal.com` },
      update: {},
      create: {
        email: `admin${i}@skillportal.com`,
        passwordHash: defaultPassword,
        role: Role.GOVERNMENT_ADMIN,
        adminProfile: {
          create: {
            fullName: `Admin Demo ${i}`,
            department: "Skills Department",
          }
        }
      }
    });
    admins.push(admin);
  }

  // --- 2. DISTRICTS ---
  const upsertDistrict = async (name: string) => 
    prisma.district.upsert({ 
      where: { name_state: { name, state: "Maharashtra" } }, 
      update: {}, 
      create: { name, state: "Maharashtra" } 
    });

  const pune = await upsertDistrict("Pune Demo");
  const nagpur = await upsertDistrict("Nagpur Demo");
  const aurangabad = await upsertDistrict("Aurangabad Demo");
  const mumbai = await upsertDistrict("Mumbai Demo");
  const nashik = await upsertDistrict("Nashik Demo");
  const thane = await upsertDistrict("Thane Demo");
  const demoDistricts = [pune, nagpur, aurangabad, mumbai, nashik, thane];

  // --- 3. PROVIDERS & COURSES ---
  const providers = [];
  const programs = [];
  for (let i = 1; i <= 10; i++) {
    const district = demoDistricts[i % demoDistricts.length];
    const provider = await prisma.user.upsert({
      where: { email: `provider${i}@skillportal.com` },
      update: {},
      create: {
        email: `provider${i}@skillportal.com`,
        passwordHash: defaultPassword,
        role: Role.PROVIDER,
        providerProfile: {
          create: {
            instituteName: `Provider ${i} Academy`,
            contactPerson: `Contact Person ${i}`,
            phone: `98765432${i.toString().padStart(2, '0')}`,
            districtId: district.id,
            isVerified: true
          }
        }
      },
      include: { providerProfile: true }
    });
    providers.push(provider);

    let prog1 = await prisma.trainingProgram.findFirst({
      where: { providerId: provider.providerProfile!.id, name: `Course A for Provider ${i}` }
    });
    if (!prog1) {
      prog1 = await prisma.trainingProgram.create({
        data: {
          providerId: provider.providerProfile!.id,
          name: `Course A for Provider ${i}`,
          durationMonths: 3,
          sector: "IT (Demo)",
          certificationName: `Cert A${i}`
        }
      });
    }
    programs.push(prog1);
  }

  // Anomalies for Provider 2 (just to have some anomalies in the system)
  await prisma.providerAnomalyFlag.deleteMany({ where: { providerId: providers[1].providerProfile!.id } });
  await prisma.providerAnomalyFlag.createMany({
    data: [
      {
        providerId: providers[1].providerProfile!.id,
        flagType: AnomalyFlagType.PLACEMENT_VARIANCE,
        zScore: 3.4,
        detail: "Suspiciously high identical placements reported for same employer but low retention.",
        status: FlagStatus.OPEN
      },
      {
        providerId: providers[1].providerProfile!.id,
        flagType: AnomalyFlagType.WAGE_CLUSTERING,
        zScore: 2.9,
        detail: "Exact same wage reported for 40 trainees on the same date.",
        status: FlagStatus.CONFIRMED,
        reviewedById: admins[0].id,
        reviewedAt: new Date()
      }
    ]
  });

  // --- 4. TRAINEES & OUTCOMES ---
  for (let i = 1; i <= 10; i++) {
    const email = `trainee${i}@skillportal.com`;
    const district = demoDistricts[i % demoDistricts.length];
    const program = programs[i % programs.length];
    const hash = uuidv4();

    const trainee = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: defaultPassword,
        role: Role.TRAINEE,
        traineeProfile: {
          create: {
            fullName: `Trainee Demo ${i}`,
            phone: `999111${i.toString().padStart(4, '0')}`,
            districtId: district.id,
            district: district.name,
            contacts: {
              create: [
                { contactType: "SELF", name: `Trainee Demo ${i}`, phone: `999111${i.toString().padStart(4, '0')}`, priorityOrder: 1 }
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

    let status: EnrollmentStatus = EnrollmentStatus.COMPLETED;
    if (i % 4 === 0) status = EnrollmentStatus.IN_PROGRESS; // 25%
    else if (i % 6 === 0) status = EnrollmentStatus.DROPPED; // ~16%

    let enrollment = await prisma.enrollment.findFirst({
      where: { traineeId: trainee.traineeProfile!.id, programId: program.id }
    });

    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: {
          traineeId: trainee.traineeProfile!.id,
          programId: program.id,
          status,
          enrolledAt: enrolledDate,
          completedAt: status === EnrollmentStatus.COMPLETED ? completedDate : null,
          isCertified: status === EnrollmentStatus.COMPLETED,
          certificateId: status === EnrollmentStatus.COMPLETED ? hash : null
        }
      });
    }

    // Outcome
    const existingOutcome = await prisma.employmentOutcome.findFirst({
      where: { traineeId: trainee.traineeProfile!.id }
    });
    
    if (!existingOutcome) {
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

        await prisma.wageRecord.createMany({
          data: [
            { outcomeId: outcome.id, recordedDate: completedDate, salaryAmount: 20000 + (i * 1000) },
            { outcomeId: outcome.id, recordedDate: new Date(), salaryAmount: 22000 + (i * 1000) }
          ]
        });

        if (i % 2 === 0) {
          await prisma.followUp.upsert({
            where: { traineeId_stage: { traineeId: trainee.traineeProfile!.id, stage: "DAY_30" } },
            update: {},
            create: {
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
    }

    if (i <= 3 && status === EnrollmentStatus.COMPLETED) {
      const existingAssessment = await prisma.skillAssessment.findFirst({ where: { enrollmentId: enrollment.id } });
      if (!existingAssessment) {
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
  }

  // --- 5. SKILL GAPS ---
  await prisma.skillGapReport.deleteMany({ where: { sector: "IT (Demo)" } });
  await prisma.skillGapReport.createMany({
    data: [
      { sector: "IT (Demo)", skillName: "Cloud Computing", districtId: pune.id, demandScore: 90, supplyScore: 40, gapScore: 50 },
      { sector: "IT (Demo)", skillName: "Cybersecurity", districtId: nagpur.id, demandScore: 85, supplyScore: 20, gapScore: 65 },
      { sector: "IT (Demo)", skillName: "React Development", districtId: aurangabad.id, demandScore: 70, supplyScore: 60, gapScore: 10 }
    ]
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
