-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('SELF_PACED', 'SCHEDULED', 'BATCH');

-- CreateEnum
CREATE TYPE "CourseDurationUnit" AS ENUM ('HOURS', 'DAYS', 'WEEKS', 'MONTHS');

-- CreateEnum
CREATE TYPE "CoursePaymentType" AS ENUM ('ONE_TIME', 'SUBSCRIPTION', 'INSTALLMENT');

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "instituteId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "type" "CourseType" NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "instructorName" TEXT,
    "paymentType" "CoursePaymentType",
    "paymentGateWay" TEXT,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courses_instituteId_idx" ON "courses"("instituteId");

-- CreateIndex
CREATE INDEX "courses_instituteId_isPublished_idx" ON "courses"("instituteId", "isPublished");

-- CreateIndex
CREATE INDEX "courses_createdAt_idx" ON "courses"("createdAt");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
