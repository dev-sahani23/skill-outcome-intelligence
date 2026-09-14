-- CreateEnum
CREATE TYPE "SkillAssessmentStatus" AS ENUM ('INTAKE_SUBMITTED', 'QUESTIONS_GENERATED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "skill_assessments" (
    "id" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "claimedSkills" TEXT[],
    "claimedCertifications" JSONB NOT NULL,
    "claimedProjects" JSONB NOT NULL,
    "claimedCourses" JSONB NOT NULL,
    "generatedQuestions" JSONB,
    "answers" JSONB,
    "analysisResult" JSONB,
    "skillGapScore" DOUBLE PRECISION,
    "verificationConfidence" DOUBLE PRECISION,
    "retentionRiskSignal" DOUBLE PRECISION,
    "status" "SkillAssessmentStatus" NOT NULL DEFAULT 'INTAKE_SUBMITTED',
    "groqModel" TEXT NOT NULL DEFAULT 'openai/gpt-oss-120b',
    "rawGroqResponseQuestions" JSONB,
    "rawGroqResponseAnalysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "skill_assessments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "trainee_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
