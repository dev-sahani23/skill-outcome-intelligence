import { Role, OutcomeType, EnrollmentStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/utils/password';

const districts = ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Thane"];

async function main() {
  if (process.env.DATABASE_URL?.includes("prod") || !process.env.DATABASE_URL?.includes("localhost")) {
    console.warn("Safety check failed. Refusing to run seed against a non-local or production database.");
    return;
  }

  console.log("Seeding database deterministically...");

  const defaultPassword = await hashPassword("password123");

  // 2. Create Government Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@maharashtra.gov.in" },
    update: {},
    create: {
      email: "admin@maharashtra.gov.in",
      passwordHash: defaultPassword,
      role: Role.GOVERNMENT_ADMIN,
      adminProfile: {
        create: {
          fullName: "System Admin",
          department: "Department of Skills, Employment",
        }
      }
    }
  });
  console.log(`Created/Ensured Admin: ${admin.email}`);

  // 4a. Create Districts First
  const upsertDistrict = async (name: string) => 
    prisma.district.upsert({ 
      where: { name_state: { name, state: "Maharashtra" } }, 
      update: {}, 
      create: { name, state: "Maharashtra", avgWageBaseline: 30000, avgLayoffRateBaseline: 2.5 } 
    });

  const puneDistrict = await upsertDistrict("Pune");
  for (const d of districts) {
    if (d !== "Pune") await upsertDistrict(d);
  }

  // 3. Create a Training Provider
  const provider = await prisma.user.upsert({
    where: { email: "provider@example.com" },
    update: {},
    create: {
      email: "provider@example.com",
      passwordHash: defaultPassword,
      role: Role.PROVIDER,
      providerProfile: {
        create: {
          instituteName: "Maharashtra Tech Skills Institute",
          contactPerson: "Rajesh Kumar",
          phone: "9876543210",
        }
      }
    },
    include: { providerProfile: true }
  });
  console.log(`Created/Ensured Provider: ${provider.email}`);

  // 4. Create Training Programs
  let program1 = await prisma.trainingProgram.findFirst({
    where: { providerId: provider.providerProfile!.id, name: "Advanced Web Development" }
  });
  if (!program1) {
    program1 = await prisma.trainingProgram.create({
      data: {
        providerId: provider.providerProfile!.id,
        name: "Advanced Web Development",
        durationMonths: 6,
        description: "Full stack MERN development course.",
        certificationName: ""
      }
    });
  }

  let program2 = await prisma.trainingProgram.findFirst({
    where: { providerId: provider.providerProfile!.id, name: "Cloud Computing AWS" }
  });
  if (!program2) {
    program2 = await prisma.trainingProgram.create({
      data: {
        providerId: provider.providerProfile!.id,
        name: "Cloud Computing AWS",
        durationMonths: 4,
        description: "AWS Solutions Architect training.",
        certificationName: ""
      }
    });
  }
  console.log("Created/Ensured Training Programs");

  // 5. Create Default Test Trainee
  const demoTrainee = await prisma.user.upsert({
    where: { email: "trainee@example.com" },
    update: {},
    create: {
      email: "trainee@example.com",
      passwordHash: defaultPassword,
      role: Role.TRAINEE,
      traineeProfile: {
        create: {
          fullName: "Aarav Sharma",
          phone: "9876500001",
          districtId: puneDistrict.id,
          district: "Pune",
          qualification: "B.Tech Computer Science",
          consentGiven: true,
          contacts: {
            create: [
              { contactType: "SELF", name: "Aarav Sharma", phone: "9876500001", priorityOrder: 1 },
              { contactType: "GUARDIAN", name: "Ramesh Sharma", phone: "9876500002", relationship: "Father", priorityOrder: 2 },
              { contactType: "LOCAL_ANCHOR", name: "Pune Tech Hub", phone: "9876500003", relationship: "Community Center", priorityOrder: 3 }
            ]
          },
          consentRecords: {
            create: [
              { consentType: "data_sharing", consentVersion: "v1" }
            ]
          }
        }
      }
    },
    include: { traineeProfile: true }
  });

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: { traineeId: demoTrainee.traineeProfile!.id, programId: program1.id }
  });

  if (!existingEnrollment) {
    await prisma.enrollment.create({
      data: {
        traineeId: demoTrainee.traineeProfile!.id,
        programId: program1.id,
        status: EnrollmentStatus.COMPLETED,
        enrolledAt: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        completedAt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      }
    });
  }

  const employer = await prisma.employer.upsert({
    where: { normalizedName: "tata consultancy services" },
    update: {},
    create: {
      name: "Tata Consultancy Services",
      normalizedName: "tata consultancy services",
      sector: "IT",
      isVerified: true,
      districtId: puneDistrict.id
    }
  });

  const existingOutcome = await prisma.employmentOutcome.findFirst({
    where: { traineeId: demoTrainee.traineeProfile!.id }
  });

  if (!existingOutcome) {
    const outcome = await prisma.employmentOutcome.create({
      data: {
        traineeId: demoTrainee.traineeProfile!.id,
        type: OutcomeType.FORMAL_EMPLOYMENT,
        employerName: employer.name,
        employerId: employer.id,
        designation: "Junior Full Stack Developer",
        monthlyWage: 36000,
        retentionMonths: 5,
        isVerified: true,
        districtId: puneDistrict.id
      }
    });

    await prisma.wageRecord.createMany({
      data: [
        { outcomeId: outcome.id, recordedDate: new Date(new Date().setMonth(new Date().getMonth() - 5)), salaryAmount: 30000 },
        { outcomeId: outcome.id, recordedDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), salaryAmount: 36000 }
      ]
    });
  }

  await prisma.courseRating.deleteMany({ where: { programId: program1.id } });
  await prisma.courseRating.create({
    data: {
      programId: program1.id,
      ratingPeriodStart: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      ratingPeriodEnd: new Date(),
      weightedPlacementScore: 85.5,
      relativeLayoffScore: 90.0,
      relevanceScore: 88.0,
      wageProgressionScore: 92.5,
      sampleSize: 150,
      finalScore: 89.0
    }
  });

  console.log(`Created Default Demo Trainee: ${demoTrainee.email}`);

  // 6. Create Additional Trainees, Enrollments, and Outcomes
  const numTrainees = 20;
  for (let i = 1; i <= numTrainees; i++) {
    const districtName = districts[i % districts.length];
    const isPlaced = i % 3 !== 0; // 66% placement rate roughly
    const email = `trainee${i}@example.com`;

    const traineeUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email: email,
        passwordHash: defaultPassword,
        role: Role.TRAINEE,
        traineeProfile: {
          create: {
            fullName: `Trainee Name ${i}`,
            phone: `999000${i.toString().padStart(4, '0')}`,
            district: districtName,
            qualification: "B.Tech",
            consentGiven: true
          }
        }
      },
      include: { traineeProfile: true }
    });

    const programId = i % 2 === 0 ? program1.id : program2.id;
    const enroll = await prisma.enrollment.findFirst({
      where: { traineeId: traineeUser.traineeProfile!.id, programId }
    });

    if (!enroll) {
      await prisma.enrollment.create({
        data: {
          traineeId: traineeUser.traineeProfile!.id,
          programId: programId,
          status: EnrollmentStatus.COMPLETED,
          enrolledAt: new Date(new Date().setMonth(new Date().getMonth() - 8)),
          completedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        }
      });
    }

    const o = await prisma.employmentOutcome.findFirst({
      where: { traineeId: traineeUser.traineeProfile!.id }
    });

    if (!o) {
      if (isPlaced) {
        await prisma.employmentOutcome.create({
          data: {
            traineeId: traineeUser.traineeProfile!.id,
            type: OutcomeType.FORMAL_EMPLOYMENT,
            employerName: `Tech Corp ${districtName}`,
            designation: "Software Engineer",
            monthlyWage: 25000 + (Math.random() * 20000), // Random wage between 25k and 45k
            retentionMonths: Math.floor(Math.random() * 6) + 1,
            isVerified: true
          }
        });
      } else {
        await prisma.employmentOutcome.create({
          data: {
            traineeId: traineeUser.traineeProfile!.id,
            type: OutcomeType.UNEMPLOYED,
            nonPlacementReason: "Awaiting interview results",
            skillGapIdentified: "Communication Skills"
          }
        });
      }
    }
  }

  console.log(`Created/Ensured ${numTrainees} Trainees with Enrollments and Outcomes.`);
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

