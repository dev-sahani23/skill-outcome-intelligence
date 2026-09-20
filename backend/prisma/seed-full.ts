import 'dotenv/config';
import {
  Role,
  OutcomeType,
  EnrollmentStatus,
  Gender,
  ContactType,
  CascadeStage,
  FollowUpStage,
  FollowUpChannel,
  FollowUpStatus,
  ValidationStatus,
  RelevanceLevel,
  PlacementStatus,
  AttritionReason,
  ReasonSource,
  SustainabilityStatus,
  AnomalyFlagType,
  FlagStatus,
  SkillAssessmentStatus
} from '@prisma/client';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/utils/password';
import { faker } from '@faker-js/faker';

async function main() {

  console.log("Seeding database with 200 complex entities...");
  const defaultPassword = await hashPassword("password123");

  const runId = Date.now().toString().slice(-6);
  
  // 1. Create Districts
  const districtNames = ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Thane", "Amravati", "Solapur", "Kolhapur", "Jalgaon"];
  const districts = [];
  for (const name of districtNames) {
    const d = await prisma.district.upsert({
      where: { name_state: { name, state: "Maharashtra" } },
      update: {},
      create: { 
        name, 
        state: "Maharashtra", 
        avgWageBaseline: faker.number.int({ min: 15000, max: 40000 }),
        avgLayoffRateBaseline: faker.number.float({ min: 1, max: 10, fractionDigits: 2 })
      }
    });
    districts.push(d);
  }
  
  // 2. Create Government Admin
  const admin = await prisma.user.upsert({
    where: { email: `admin_${runId}@maharashtra.gov.in` },
    update: {},
    create: {
      email: `admin_${runId}@maharashtra.gov.in`,
      passwordHash: defaultPassword,
      role: Role.GOVERNMENT_ADMIN,
      adminProfile: {
        create: {
          fullName: "System Admin Seed",
          department: "Department of Skills",
        }
      }
    }
  });

  // 3. Create Employers (20)
  const employers = [];
  for (let i = 0; i < 20; i++) {
    const name = faker.company.name();
    const e = await prisma.employer.create({
      data: {
        name: name,
        normalizedName: name.toLowerCase() + "_" + runId + "_" + i,
        sector: faker.helpers.arrayElement(["IT", "Manufacturing", "Retail", "Healthcare", "Agriculture"]),
        registrationNo: `REG-${runId}-${i}`,
        isVerified: faker.datatype.boolean(),
        contactPhone: faker.phone.number({ style: 'national' }),
        districtId: faker.helpers.arrayElement(districts).id
      }
    });
    employers.push(e);
  }

  // 4. Create Providers & Programs
  const providers = [];
  const programs = [];
  for (let i = 0; i < 15; i++) {
    const providerUser = await prisma.user.create({
      data: {
        email: `provider_${runId}_${i}@example.com`,
        passwordHash: defaultPassword,
        role: Role.PROVIDER,
        providerProfile: {
          create: {
            instituteName: faker.company.name() + " Institute",
            contactPerson: faker.person.fullName(),
            phone: faker.phone.number({ style: 'national' }) + i, // ensure unique
            registrationNo: `PROV-${runId}-${i}`,
            isVerified: true,
            districtId: faker.helpers.arrayElement(districts).id
          }
        }
      },
      include: { providerProfile: true }
    });
    providers.push(providerUser);

    // Create 2-4 programs per provider
    const numPrograms = faker.number.int({ min: 2, max: 4 });
    for (let j = 0; j < numPrograms; j++) {
      const prog = await prisma.trainingProgram.create({
        data: {
          providerId: providerUser.providerProfile!.id,
          name: faker.person.jobArea() + " Training",
          description: faker.lorem.paragraph(),
          durationMonths: faker.number.int({ min: 1, max: 12 }),
          certificationName: faker.person.jobTitle() + " Certified",
          skills: [faker.word.noun(), faker.word.noun(), faker.word.noun()],
          sector: faker.helpers.arrayElement(["IT", "Manufacturing", "Retail"]),
          skillCategory: "Technical"
        }
      });
      programs.push(prog);

      // Add CourseRating
      await prisma.courseRating.create({
        data: {
          programId: prog.id,
          ratingPeriodStart: faker.date.past({ years: 1 }),
          ratingPeriodEnd: new Date(),
          weightedPlacementScore: faker.number.float({ min: 40, max: 95, fractionDigits: 1 }),
          relativeLayoffScore: faker.number.float({ min: 40, max: 95, fractionDigits: 1 }),
          relevanceScore: faker.number.float({ min: 40, max: 95, fractionDigits: 1 }),
          wageProgressionScore: faker.number.float({ min: 40, max: 95, fractionDigits: 1 }),
          sampleSize: faker.number.int({ min: 20, max: 200 }),
          finalScore: faker.number.float({ min: 40, max: 95, fractionDigits: 1 }),
        }
      });
    }

    // Add Provider Anomaly Flags
    if (faker.datatype.boolean()) {
      await prisma.providerAnomalyFlag.create({
        data: {
          providerId: providerUser.providerProfile!.id,
          flagType: faker.helpers.arrayElement([AnomalyFlagType.PLACEMENT_VARIANCE, AnomalyFlagType.RESPONSE_RATE_OUTLIER, AnomalyFlagType.WAGE_CLUSTERING]),
          zScore: faker.number.float({ min: 2.0, max: 4.5, fractionDigits: 2 }),
          detail: faker.lorem.sentence(),
          status: faker.helpers.arrayElement([FlagStatus.OPEN, FlagStatus.UNDER_REVIEW]),
        }
      });
    }
  }

  // 5. Create Skill Gap Reports
  for (let i = 0; i < 10; i++) {
    await prisma.skillGapReport.create({
      data: {
        sector: faker.helpers.arrayElement(["IT", "Manufacturing", "Retail", "Healthcare"]),
        skillName: faker.person.jobType(),
        districtId: faker.helpers.arrayElement(districts).id,
        demandScore: faker.number.float({ min: 50, max: 100, fractionDigits: 1 }),
        supplyScore: faker.number.float({ min: 10, max: 80, fractionDigits: 1 }),
        gapScore: faker.number.float({ min: -20, max: 60, fractionDigits: 1 })
      }
    });
  }

  // 6. Create 200 Trainees
  const numTrainees = 200;
  console.log(`Creating ${numTrainees} trainees and related data...`);
  
  for (let i = 0; i < numTrainees; i++) {
    const district = faker.helpers.arrayElement(districts);
    const email = `trainee_${runId}_${i}@example.com`;
    
    const traineeUser = await prisma.user.create({
      data: {
        email,
        passwordHash: defaultPassword,
        role: Role.TRAINEE,
        traineeProfile: {
          create: {
            fullName: faker.person.fullName(),
            phone: `+91${faker.string.numeric(10)}_${i}`, // unique
            qualification: faker.helpers.arrayElement(["10th Pass", "12th Pass", "B.Tech", "B.Sc", "ITI"]),
            districtId: district.id,
            district: district.name,
            dob: faker.date.birthdate({ min: 18, max: 35, mode: 'age' }),
            gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
            aadhaarHash: `HASH-${runId}-${i}`,
            aadhaarLast4: faker.string.numeric(4),
            uanNumber: faker.datatype.boolean() ? `UAN-${runId}-${i}` : null,
            consentGiven: true
          }
        }
      },
      include: { traineeProfile: true }
    });

    const traineeId = traineeUser.traineeProfile!.id;

    // Contacts
    await prisma.contact.create({
      data: {
        traineeId,
        contactType: ContactType.SELF,
        name: traineeUser.traineeProfile!.fullName,
        phone: traineeUser.traineeProfile!.phone!,
        priorityOrder: 1
      }
    });

    // Consent Record
    await prisma.consentRecord.create({
      data: {
        traineeId,
        consentType: "data_sharing",
        consentVersion: "v1.1"
      }
    });

    // Skill Assessment
    if (faker.datatype.boolean()) {
      await prisma.skillAssessment.create({
        data: {
          traineeId,
          claimedSkills: [faker.word.noun(), faker.word.noun()],
          claimedCertifications: [],
          claimedProjects: [],
          claimedCourses: [],
          status: SkillAssessmentStatus.COMPLETED,
          skillGapScore: faker.number.float({ min: 10, max: 90 }),
          verificationConfidence: faker.number.float({ min: 0.5, max: 0.99 })
        }
      });
    }

    // Enrollment
    const program = faker.helpers.arrayElement(programs);
    const status = faker.helpers.arrayElement([EnrollmentStatus.COMPLETED, EnrollmentStatus.IN_PROGRESS, EnrollmentStatus.DROPPED]);
    
    const enrollment = await prisma.enrollment.create({
      data: {
        traineeId,
        programId: program.id,
        status: status,
        enrolledAt: faker.date.past({ years: 1 }),
        completedAt: status === EnrollmentStatus.COMPLETED ? faker.date.recent() : null,
        attendancePct: faker.number.float({ min: 40, max: 100 }),
        isCertified: status === EnrollmentStatus.COMPLETED
      }
    });

    // Certification
    if (enrollment.isCertified) {
      await prisma.certification.create({
        data: {
          enrollmentId: enrollment.id,
          certificateNumber: `CERT-${runId}-${i}`,
          issuingAuthority: "Govt of Maharashtra",
          issuedDate: enrollment.completedAt!,
          verificationHash: `VERIFY-${runId}-${i}`
        }
      });
    }

    // Outcomes
    if (status === EnrollmentStatus.COMPLETED) {
      const outcomeType = faker.helpers.arrayElement([
        OutcomeType.FORMAL_EMPLOYMENT, 
        OutcomeType.INFORMAL_EMPLOYMENT, 
        OutcomeType.SELF_EMPLOYED, 
        OutcomeType.UNEMPLOYED
      ]);

      let outcomeData: any = {
        traineeId,
        type: outcomeType,
        districtId: district.id,
        trainingRelevance: faker.helpers.arrayElement([RelevanceLevel.HIGH, RelevanceLevel.MEDIUM, RelevanceLevel.LOW]),
        reportedAt: faker.date.recent(),
        isVerified: faker.datatype.boolean()
      };

      if (outcomeType !== OutcomeType.UNEMPLOYED) {
        const employer = faker.helpers.arrayElement(employers);
        outcomeData = {
          ...outcomeData,
          employerId: employer.id,
          employerName: employer.name,
          designation: faker.person.jobTitle(),
          monthlyWage: faker.number.int({ min: 10000, max: 50000 }),
          retentionMonths: faker.number.int({ min: 1, max: 24 }),
          joiningDate: faker.date.past({ years: 1 }),
          status: faker.helpers.arrayElement([PlacementStatus.ACTIVE, PlacementStatus.LEFT])
        };
      }

      const outcome = await prisma.employmentOutcome.create({
        data: outcomeData
      });

      // Wage Records
      if (outcome.monthlyWage) {
        await prisma.wageRecord.create({
          data: {
            outcomeId: outcome.id,
            recordedDate: faker.date.recent(),
            salaryAmount: outcome.monthlyWage,
            source: "employer_verified"
          }
        });
      }

      // Validations
      if (outcome.isVerified) {
        await prisma.validation.create({
          data: {
            outcomeId: outcome.id,
            validationType: "employer_verification",
            status: ValidationStatus.VERIFIED,
            confidenceScore: faker.number.float({ min: 0.7, max: 1.0 }),
            validatedById: admin.id
          }
        });
      }

      // Attrition Record
      if (outcome.status === PlacementStatus.LEFT) {
        await prisma.attritionRecord.create({
          data: {
            outcomeId: outcome.id,
            traineeId,
            exitDate: faker.date.recent(),
            reasonCode: faker.helpers.arrayElement([AttritionReason.LOW_SALARY, AttritionReason.SKILL_MISMATCH, AttritionReason.VOLUNTARY_BETTER_JOB]),
            reasonSource: ReasonSource.AI_CLASSIFIED,
            confidenceScore: faker.number.float({ min: 0.5, max: 0.9 })
          }
        });
      }
    }

    // FollowUp & CascadeLog
    const followUp = await prisma.followUp.create({
      data: {
        traineeId,
        stage: FollowUpStage.MONTH_3,
        scheduledDate: faker.date.soon(),
        channelUsed: FollowUpChannel.WHATSAPP,
        status: FollowUpStatus.RESPONDED,
        completedAt: faker.date.recent(),
        responseData: { "employmentStatus": "employed" }
      }
    });

    const contact = await prisma.contact.findFirst({ where: { traineeId } });
    if (contact) {
      await prisma.cascadeLog.create({
        data: {
          followUpId: followUp.id,
          contactId: contact.id,
          attemptNumber: 1,
          cascadeStage: CascadeStage.RESOLVED,
          attemptedAt: faker.date.recent(),
          responseReceived: true,
          responseAt: faker.date.recent()
        }
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "CREATE",
        entityType: "TraineeProfile",
        entityId: traineeId,
        occurredAt: faker.date.recent()
      }
    });
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
