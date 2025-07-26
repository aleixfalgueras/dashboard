/*
  Warnings:

  - Added the required column `username` to the `InstagramProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InstagramProfile" ADD COLUMN     "username" TEXT NOT NULL;
