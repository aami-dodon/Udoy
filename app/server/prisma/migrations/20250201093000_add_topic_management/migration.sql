-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TopicContentFormat" AS ENUM ('JSON', 'HTML');

-- CreateEnum
CREATE TYPE "TopicTagKind" AS ENUM ('CLASSIFICATION', 'CURRICULUM', 'ACCESSIBILITY', 'SUBJECT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TopicCommentType" AS ENUM ('GENERAL', 'REVIEW', 'CHANGE_REQUEST');

-- CreateTable
CREATE TABLE "TopicTagDefinition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "kind" "TopicTagKind" NOT NULL DEFAULT 'CUSTOM',
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TopicTagDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" "TopicStatus" NOT NULL DEFAULT 'DRAFT',
    "content" JSONB,
    "contentFormat" "TopicContentFormat" NOT NULL DEFAULT 'JSON',
    "accessibility" JSONB,
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "authorId" TEXT NOT NULL,
    "validatorId" TEXT,
    "baseTopicId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicTag" (
    "topicId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    CONSTRAINT "TopicTag_pkey" PRIMARY KEY ("topicId", "tagId")
);

-- CreateTable
CREATE TABLE "TopicRevision" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "TopicStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "contentFormat" "TopicContentFormat" NOT NULL,
    "accessibility" JSONB,
    "metadata" JSONB,
    "changeNotes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TopicRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicWorkflowEvent" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "TopicStatus",
    "toStatus" "TopicStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TopicWorkflowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicComment" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "TopicCommentType" NOT NULL DEFAULT 'GENERAL',
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    CONSTRAINT "TopicComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TopicTagDefinition_slug_key" ON "TopicTagDefinition"("slug");

-- CreateIndex
CREATE INDEX "TopicTagDefinition_kind_idx" ON "TopicTagDefinition"("kind");

-- CreateIndex
CREATE INDEX "Topic_status_idx" ON "Topic"("status");

-- CreateIndex
CREATE INDEX "Topic_language_idx" ON "Topic"("language");

-- CreateIndex
CREATE INDEX "Topic_baseTopicId_idx" ON "Topic"("baseTopicId");

-- CreateIndex
CREATE INDEX "Topic_authorId_idx" ON "Topic"("authorId");

-- CreateIndex
CREATE INDEX "TopicTag_tagId_idx" ON "TopicTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicRevision_topicId_version_key" ON "TopicRevision"("topicId", "version");

-- CreateIndex
CREATE INDEX "TopicRevision_createdById_idx" ON "TopicRevision"("createdById");

-- CreateIndex
CREATE INDEX "TopicWorkflowEvent_topicId_idx" ON "TopicWorkflowEvent"("topicId");

-- CreateIndex
CREATE INDEX "TopicWorkflowEvent_actorId_idx" ON "TopicWorkflowEvent"("actorId");

-- CreateIndex
CREATE INDEX "TopicComment_topicId_idx" ON "TopicComment"("topicId");

-- CreateIndex
CREATE INDEX "TopicComment_authorId_idx" ON "TopicComment"("authorId");

-- AddForeignKey
ALTER TABLE "TopicTagDefinition" ADD CONSTRAINT "TopicTagDefinition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_baseTopicId_fkey" FOREIGN KEY ("baseTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTag" ADD CONSTRAINT "TopicTag_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTag" ADD CONSTRAINT "TopicTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "TopicTagDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTag" ADD CONSTRAINT "TopicTag_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicRevision" ADD CONSTRAINT "TopicRevision_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicRevision" ADD CONSTRAINT "TopicRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicWorkflowEvent" ADD CONSTRAINT "TopicWorkflowEvent_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicWorkflowEvent" ADD CONSTRAINT "TopicWorkflowEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicComment" ADD CONSTRAINT "TopicComment_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicComment" ADD CONSTRAINT "TopicComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicComment" ADD CONSTRAINT "TopicComment_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
