-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "host" BOOLEAN NOT NULL DEFAULT false,
    "agoraId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
