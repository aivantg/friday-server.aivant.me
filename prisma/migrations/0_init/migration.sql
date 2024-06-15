-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "taskScript" TEXT NOT NULL,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "runImmediately" BOOLEAN NOT NULL,
    "finished" BOOLEAN NOT NULL,
    "success" BOOLEAN NOT NULL,
    "result" TEXT NOT NULL,
    "callbackURL" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_name_key" ON "Job"("name");

