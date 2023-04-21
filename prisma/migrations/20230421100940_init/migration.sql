-- CreateTable
CREATE TABLE "Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "taskScript" TEXT NOT NULL,
    "scheduleDate" DATETIME NOT NULL,
    "runImmediately" BOOLEAN NOT NULL,
    "finished" BOOLEAN NOT NULL,
    "success" BOOLEAN NOT NULL,
    "result" TEXT NOT NULL,
    "callbackURL" TEXT NOT NULL,
    "data" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_name_key" ON "Job"("name");
