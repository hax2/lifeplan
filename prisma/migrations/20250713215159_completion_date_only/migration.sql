-- AlterTable
ALTER TABLE "WeeklyTaskCompletion" ALTER COLUMN "completedAt" DROP DEFAULT,
ALTER COLUMN "completedAt" SET DATA TYPE DATE;
