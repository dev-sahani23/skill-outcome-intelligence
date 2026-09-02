import { Role, OutcomeType, EnrollmentStatus } from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/utils/password';

const districts = ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Thane"];

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data (optional, but good for idempotency)
  await prisma.user.deleteMany();

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

  // 5. Create Trainees, Enrollments, and Outcomes
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
          type: OutcomeType.PLACED,
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
