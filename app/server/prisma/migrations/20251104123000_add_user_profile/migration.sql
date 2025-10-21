-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "timezone" TEXT,
    "className" TEXT,
    "learningLanguages" TEXT[] DEFAULT '{}'::TEXT[],
    "learningTopics" TEXT[] DEFAULT '{}'::TEXT[],
    "learningPace" TEXT,
    "linkedCoachId" TEXT,
    "subjectExpertise" TEXT[] DEFAULT '{}'::TEXT[],
    "profession" TEXT,
    "education" TEXT,
    "teacherSpecialties" TEXT[] DEFAULT '{}'::TEXT[],
    "coachingSchedule" TEXT,
    "coachingStrengths" TEXT[] DEFAULT '{}'::TEXT[],
    "assignedStudents" TEXT[] DEFAULT '{}'::TEXT[],
    "organizationName" TEXT,
    "sector" TEXT,
    "primaryContact" TEXT,
    "pledgedCredits" INTEGER,
    "notificationSettings" JSONB,
    "accessibilitySettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId"),
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserProfile_linkedCoachId_fkey" FOREIGN KEY ("linkedCoachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserProfile_linkedCoachId_idx" ON "UserProfile"("linkedCoachId");
