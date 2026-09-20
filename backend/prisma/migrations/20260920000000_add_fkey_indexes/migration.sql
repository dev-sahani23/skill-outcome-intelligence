-- CreateIndex
CREATE INDEX "training_programs_providerId_idx" ON "training_programs"("providerId");

-- CreateIndex
CREATE INDEX "enrollments_traineeId_idx" ON "enrollments"("traineeId");

-- CreateIndex
CREATE INDEX "enrollments_programId_idx" ON "enrollments"("programId");

-- CreateIndex
CREATE INDEX "employment_outcomes_traineeId_idx" ON "employment_outcomes"("traineeId");

-- CreateIndex
CREATE INDEX "employment_outcomes_employerId_idx" ON "employment_outcomes"("employerId");

-- CreateIndex
CREATE INDEX "employment_outcomes_districtId_idx" ON "employment_outcomes"("districtId");
