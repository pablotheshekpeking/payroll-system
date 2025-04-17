-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NGN', 'GHS', 'ZAR', 'USD');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "transferCode" TEXT,
ADD COLUMN     "transferRef" TEXT,
ADD COLUMN     "transferStatus" "TransferStatus";

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "recipientCode" TEXT,
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_employeeId_key" ON "BankAccount"("employeeId");

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
