-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TRAINEE', 'PROVIDER', 'GOVERNMENT_ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "OutcomeType" AS ENUM ('FORMAL_EMPLOYMENT', 'INFORMAL_EMPLOYMENT', 'APPRENTICESHIP', 'SELF_EMPLOYED', 'UNEMPLOYED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('SELF', 'GUARDIAN', 'LOCAL_ANCHOR', 'EMPLOYER');

-- CreateEnum
CREATE TYPE "CascadeStage" AS ENUM ('PRIMARY_PENDING', 'GUARDIAN_PENDING', 'ANCHOR_PENDING', 'RESOLVED', 'UNREACHABLE');

-- CreateEnum
CREATE TYPE "FollowUpStage" AS ENUM ('AT_CERTIFICATION', 'DAY_30', 'MONTH_3', 'MONTH_6', 'MONTH_12', 'MONTH_24');

-- CreateEnum
CREATE TYPE "FollowUpChannel" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL', 'WEB', 'MOBILE_APP', 'ASSISTED_CALL');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'SENT', 'RESPONDED', 'ESCALATED', 'UNREACHABLE');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "RelevanceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('ACTIVE', 'LEFT', 'TERMINATED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AttritionReason" AS ENUM ('COMPANY_SHUTDOWN', 'MASS_LAYOFF', 'SKILL_MISMATCH', 'POOR_WORKING_CONDITIONS', 'LOW_SALARY', 'NO_CAREER_PROGRESSION', 'VOLUNTARY_BETTER_JOB', 'OTHER');

-- CreateEnum
CREATE TYPE "ReasonSource" AS ENUM ('AI_CLASSIFIED', 'SELF_REPORTED', 'EMPLOYER_REPORTED');

-- CreateEnum
CREATE TYPE "SustainabilityStatus" AS ENUM ('GROWING', 'STABLE', 'DECLINING', 'CLOSED');

-- CreateEnum
CREATE TYPE "AnomalyFlagType" AS ENUM ('PLACEMENT_VARIANCE', 'RESPONSE_RATE_OUTLIER', 'WAGE_CLUSTERING');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'DISMISSED', 'CONFIRMED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Maharashtra',
    "avgWageBaseline" DOUBLE PRECISION,
    "avgLayoffRateBaseline" DOUBLE PRECISION,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainee_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "qualification" TEXT,
    "district" TEXT,
    "dob" TIMESTAMP(3),
    "gender" "Gender",
    "districtId" TEXT,
    "aadhaarHash" TEXT,
    "aadhaarLast4" TEXT,
    "uanNumber" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "trainee_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "registrationNo" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "districtId" TEXT,

    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "department" TEXT,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_programs" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMonths" INTEGER,
    "certificationName" TEXT,
    "skills" TEXT[],
    "sector" TEXT,
    "skillCategory" TEXT,

    CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "attendancePct" DOUBLE PRECISION,
    "trainingNumber" TEXT,
    "batchNumber" TEXT,
    "enrollmentNumber" TEXT,
    "skillsAcquired" TEXT[],
    "isCertified" BOOLEAN NOT NULL DEFAULT false,
    "certificateId" TEXT,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT,
    "registrationNo" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "contactPhone" TEXT,
    "districtId" TEXT,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_outcomes" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "type" "OutcomeType" NOT NULL,
    "employerName" TEXT,
    "employerId" TEXT,
    "designation" TEXT,
    "monthlyWage" DOUBLE PRECISION,
    "retentionMonths" INTEGER,
    "joiningDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "districtId" TEXT,
    "trainingRelevance" "RelevanceLevel",
    "status" "PlacementStatus" NOT NULL DEFAULT 'ACTIVE',
    "napsNumber" TEXT,
    "udyamRegistrationNo" TEXT,
    "businessActivity" TEXT,
    "sustainability" "SustainabilityStatus",
    "skillGapIdentified" TEXT,
    "nonPlacementReason" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employment_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wage_records" (
    "id" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "recordedDate" TIMESTAMP(3) NOT NULL,
    "salaryAmount" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'self_reported',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validations" (
    "id" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "validationType" TEXT NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidenceUrl" TEXT,
    "validatedById" TEXT,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attrition_records" (
    "id" TEXT NOT NULL,
    "outcomeId" TEXT,
    "traineeId" TEXT NOT NULL,
    "exitDate" TIMESTAMP(3),
    "reasonCode" "AttritionReason" NOT NULL,
    "reasonSource" "ReasonSource" NOT NULL DEFAULT 'AI_CLASSIFIED',
    "confidenceScore" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attrition_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "contactType" "ContactType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" TEXT,
    "priorityOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT 'v1',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "stage" "FollowUpStage" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "channelUsed" "FollowUpChannel",
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "responseData" JSONB,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "conductedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traineePhone" TEXT,
    "providerPhone" TEXT,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cascade_logs" (
    "id" TEXT NOT NULL,
    "followUpId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "cascadeStage" "CascadeStage" NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseReceived" BOOLEAN NOT NULL DEFAULT false,
    "responseAt" TIMESTAMP(3),

    CONSTRAINT "cascade_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_ratings" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "ratingPeriodStart" TIMESTAMP(3) NOT NULL,
    "ratingPeriodEnd" TIMESTAMP(3) NOT NULL,
    "weightedPlacementScore" DOUBLE PRECISION,
    "relativeLayoffScore" DOUBLE PRECISION,
    "relevanceScore" DOUBLE PRECISION,
    "wageProgressionScore" DOUBLE PRECISION,
    "sampleSize" INTEGER NOT NULL,
    "confidenceDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_anomaly_flags" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "flagType" "AnomalyFlagType" NOT NULL,
    "zScore" DOUBLE PRECISION,
    "detail" TEXT,
    "status" "FlagStatus" NOT NULL DEFAULT 'OPEN',
    "flaggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "provider_anomaly_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_gap_reports" (
    "id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "districtId" TEXT,
    "demandScore" DOUBLE PRECISION,
    "supplyScore" DOUBLE PRECISION,
    "gapScore" DOUBLE PRECISION,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_gap_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "districts_name_state_key" ON "districts"("name", "state");

-- CreateIndex
CREATE UNIQUE INDEX "trainee_profiles_userId_key" ON "trainee_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "trainee_profiles_phone_key" ON "trainee_profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "trainee_profiles_aadhaarHash_key" ON "trainee_profiles"("aadhaarHash");

-- CreateIndex
CREATE UNIQUE INDEX "trainee_profiles_uanNumber_key" ON "trainee_profiles"("uanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_userId_key" ON "provider_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_phone_key" ON "provider_profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_registrationNo_key" ON "provider_profiles"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_userId_key" ON "admin_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employers_registrationNo_key" ON "employers"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "wage_records_outcomeId_recordedDate_key" ON "wage_records"("outcomeId", "recordedDate");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_traineeId_priorityOrder_key" ON "contacts"("traineeId", "priorityOrder");

-- CreateIndex
CREATE UNIQUE INDEX "follow_ups_traineeId_stage_key" ON "follow_ups"("traineeId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "course_ratings_programId_ratingPeriodStart_ratingPeriodEnd_key" ON "course_ratings"("programId", "ratingPeriodStart", "ratingPeriodEnd");

-- AddForeignKey
ALTER TABLE "trainee_profiles" ADD CONSTRAINT "trainee_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainee_profiles" ADD CONSTRAINT "trainee_profiles_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_outcomes" ADD CONSTRAINT "employment_outcomes_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_outcomes" ADD CONSTRAINT "employment_outcomes_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "employers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_outcomes" ADD CONSTRAINT "employment_outcomes_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wage_records" ADD CONSTRAINT "wage_records_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "employment_outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "employment_outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attrition_records" ADD CONSTRAINT "attrition_records_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "employment_outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attrition_records" ADD CONSTRAINT "attrition_records_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_traineePhone_fkey" FOREIGN KEY ("traineePhone") REFERENCES "trainee_profiles"("phone") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_providerPhone_fkey" FOREIGN KEY ("providerPhone") REFERENCES "provider_profiles"("phone") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cascade_logs" ADD CONSTRAINT "cascade_logs_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "follow_ups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cascade_logs" ADD CONSTRAINT "cascade_logs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_ratings" ADD CONSTRAINT "course_ratings_programId_fkey" FOREIGN KEY ("programId") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_anomaly_flags" ADD CONSTRAINT "provider_anomaly_flags_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_anomaly_flags" ADD CONSTRAINT "provider_anomaly_flags_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_gap_reports" ADD CONSTRAINT "skill_gap_reports_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

