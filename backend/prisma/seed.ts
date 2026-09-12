import { Role, OutcomeType, EnrollmentStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/utils/password';

const districts = ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Thane"];

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data (optional, but good for idempotency)
  await prisma.user.deleteMany();
  await prisma.district.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.skillGapReport.deleteMany();

  const defaultPassword = await hashPassword("password123");

  // 2. Create Government Admin
  const admin = await prisma.user.create({
    data: {
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
  console.log(`Created Admin: ${admin.email}`);

  // 3. Create a Training Provider
  const provider = await prisma.user.create({
    data: {
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
  console.log(`Created Provider: ${provider.email}`);

  // 4. Create Training Programs
  const program1 = await prisma.trainingProgram.create({
    data: {
      providerId: provider.providerProfile!.id,
      name: "Advanced Web Development",
      durationMonths: 6,
      description: "Full stack MERN development course."
    }
  });

  const program2 = await prisma.trainingProgram.create({
    data: {
      providerId: provider.providerProfile!.id,
      name: "Cloud Computing AWS",
      durationMonths: 4,
      description: "AWS Solutions Architect training."
    }
  });
  console.log("Created Training Programs");

  // 4a. Create a District
  const puneDistrict = await prisma.district.create({
    data: {
      name: "Pune",
      state: "Maharashtra",
      avgWageBaseline: 30000,
      avgLayoffRateBaseline: 2.5
    }
  });

  // 5. Create Default Test Trainee
  const demoTrainee = await prisma.user.create({
    data: {
      email: "trainee@example.com",
      passwordHash: defaultPassword,
      role: Role.TRAINEE,
      traineeProfile: {
        create: {
          fullName: "Aarav Sharma",
          phone: "9876500001",
          districtId: puneDistrict.id,
          district: "Pune", // fallback
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

  await prisma.enrollment.create({
    data: {
      traineeId: demoTrainee.traineeProfile!.id,
      programId: program1.id,
      status: EnrollmentStatus.COMPLETED,
      enrolledAt: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      completedAt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    }
  });

  const employer = await prisma.employer.create({
    data: {
      name: "Tata Consultancy Services",
      sector: "IT",
      isVerified: true,
      districtId: puneDistrict.id
    }
  });

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

  // WageRecord history
  await prisma.wageRecord.createMany({
    data: [
      { outcomeId: outcome.id, recordedDate: new Date(new Date().setMonth(new Date().getMonth() - 5)), salaryAmount: 30000 },
      { outcomeId: outcome.id, recordedDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), salaryAmount: 36000 }
    ]
  });

  // CourseRating
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
    const district = districts[i % districts.length];
    const isPlaced = i % 3 !== 0; // 66% placement rate roughly

    const traineeUser = await prisma.user.create({
      data: {
        email: `trainee${i}@example.com`,
        passwordHash: defaultPassword,
        role: Role.TRAINEE,
        traineeProfile: {
          create: {
            fullName: `Trainee Name ${i}`,
            phone: `999000${i.toString().padStart(4, '0')}`,
            district: district,
            qualification: "B.Tech",
            consentGiven: true
          }
        }
      },
      include: { traineeProfile: true }
    });

    // Enroll in a program
    const programId = i % 2 === 0 ? program1.id : program2.id;
    await prisma.enrollment.create({
      data: {
        traineeId: traineeUser.traineeProfile!.id,
        programId: programId,
        status: EnrollmentStatus.COMPLETED,
        enrolledAt: new Date(new Date().setMonth(new Date().getMonth() - 8)),
        completedAt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
      }
    });

    // Add Employment Outcome if placed
    if (isPlaced) {
      await prisma.employmentOutcome.create({
        data: {
          traineeId: traineeUser.traineeProfile!.id,
          type: OutcomeType.FORMAL_EMPLOYMENT,
          employerName: `Tech Corp ${district}`,
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

  console.log(`Created ${numTrainees} Trainees with Enrollments and Outcomes.`);
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
