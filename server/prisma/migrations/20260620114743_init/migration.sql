-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BROKER', 'ADMIN', 'VIEWER');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('CEDANT', 'REINSURER', 'BROKER', 'MGA');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('MEETING', 'CONFERENCE', 'CALL', 'SITE_VISIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "regulatoryFramework" TEXT,
    "regulatorName" TEXT,
    "regulatorWebsite" TEXT,
    "regulatorEmail" TEXT,
    "regulatorPhone" TEXT,
    "regulatorAddress" TEXT,
    "mandatoryCessions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "type" "CompanyType" NOT NULL,
    "amBestRating" TEXT,
    "website" TEXT,
    "headquarters" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingReport" (
    "id" TEXT NOT NULL,
    "type" "MeetingType" NOT NULL,
    "countryId" TEXT NOT NULL,
    "companyId" TEXT,
    "authorId" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "attendees" JSONB,
    "rawNotes" TEXT,
    "summaryBullets" JSONB,
    "actionItems" JSONB,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrichment" (
    "id" TEXT NOT NULL,
    "countryId" TEXT,
    "companyId" TEXT,
    "source" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrichment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE INDEX "Company_countryId_idx" ON "Company"("countryId");

-- CreateIndex
CREATE INDEX "Company_type_idx" ON "Company"("type");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "MeetingReport_countryId_idx" ON "MeetingReport"("countryId");

-- CreateIndex
CREATE INDEX "MeetingReport_companyId_idx" ON "MeetingReport"("companyId");

-- CreateIndex
CREATE INDEX "MeetingReport_authorId_idx" ON "MeetingReport"("authorId");

-- CreateIndex
CREATE INDEX "MeetingReport_type_idx" ON "MeetingReport"("type");

-- CreateIndex
CREATE INDEX "MeetingReport_meetingDate_idx" ON "MeetingReport"("meetingDate");

-- CreateIndex
CREATE INDEX "Enrichment_countryId_idx" ON "Enrichment"("countryId");

-- CreateIndex
CREATE INDEX "Enrichment_companyId_idx" ON "Enrichment"("companyId");

-- CreateIndex
CREATE INDEX "Enrichment_source_idx" ON "Enrichment"("source");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrichment" ADD CONSTRAINT "Enrichment_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrichment" ADD CONSTRAINT "Enrichment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

