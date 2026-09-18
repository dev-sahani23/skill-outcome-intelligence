-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "certificationName" TEXT,
    "issuingAuthority" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "verificationHash" TEXT NOT NULL,
    "certificatePublicId" TEXT,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certifications_enrollmentId_key" ON "certifications"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_certificateNumber_key" ON "certifications"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_verificationHash_key" ON "certifications"("verificationHash");

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

