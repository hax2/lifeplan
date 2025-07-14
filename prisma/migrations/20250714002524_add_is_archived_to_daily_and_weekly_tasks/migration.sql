-- AlterTable
ALTER TABLE "DailyTaskTemplate" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WeeklyTask" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
