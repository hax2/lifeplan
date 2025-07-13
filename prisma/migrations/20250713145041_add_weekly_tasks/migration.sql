-- CreateTable
CREATE TABLE "WeeklyTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WeeklyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyTaskCompletion" (
    "id" TEXT NOT NULL,
    "weeklyTaskId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyTaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTaskCompletion_weeklyTaskId_completedAt_key" ON "WeeklyTaskCompletion"("weeklyTaskId", "completedAt");

-- AddForeignKey
ALTER TABLE "WeeklyTask" ADD CONSTRAINT "WeeklyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyTaskCompletion" ADD CONSTRAINT "WeeklyTaskCompletion_weeklyTaskId_fkey" FOREIGN KEY ("weeklyTaskId") REFERENCES "WeeklyTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
