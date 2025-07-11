/*
  Warnings:

  - A unique constraint covering the columns `[supabaseId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_datasetId_fkey";

-- DropForeignKey
ALTER TABLE "AnalyticsReport" DROP CONSTRAINT "AnalyticsReport_orgId_fkey";

-- DropForeignKey
ALTER TABLE "AnalyticsSchedule" DROP CONSTRAINT "AnalyticsSchedule_orgId_fkey";

-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_orgId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_orgId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "DataSource" DROP CONSTRAINT "DataSource_orgId_fkey";

-- DropForeignKey
ALTER TABLE "DataStream" DROP CONSTRAINT "DataStream_dataSourceId_fkey";

-- DropForeignKey
ALTER TABLE "Dataset" DROP CONSTRAINT "Dataset_dataSourceId_fkey";

-- DropForeignKey
ALTER TABLE "Dataset" DROP CONSTRAINT "Dataset_orgId_fkey";

-- DropForeignKey
ALTER TABLE "MpesaCallback" DROP CONSTRAINT "MpesaCallback_checkoutRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_planId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentReconciliation" DROP CONSTRAINT "PaymentReconciliation_orgId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_orgId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "supabaseId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");
