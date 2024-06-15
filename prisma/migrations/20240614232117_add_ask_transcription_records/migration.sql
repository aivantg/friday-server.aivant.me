-- CreateTable
CREATE TABLE "TranscriptionRecord" (
    "id" SERIAL NOT NULL,
    "fileHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "transcription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRequestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AskRecord" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "askJson" TEXT NOT NULL,
    "responseJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AskRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptionRecord_fileHash_key" ON "TranscriptionRecord"("fileHash");

