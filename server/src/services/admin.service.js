import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const ADMIN_TOKEN_EXPIRY = "12h";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set in environment`);
  }
  return value;
}

export async function adminLogin(password) {
  const adminPassword = requireEnv("ADMIN_PASSWORD");
  const jwtSecret = requireEnv("JWT_SECRET");

  if (password !== adminPassword) {
    throw new Error("Invalid admin password");
  }

  const token = jwt.sign({ role: "admin" }, jwtSecret, {
    expiresIn: ADMIN_TOKEN_EXPIRY,
    algorithm: "HS256",
  });

  return { token };
}

export async function getAdminQuestions({ isAnonymous }) {
  const where =
    typeof isAnonymous === "boolean" ? { isAnonymous } : undefined;

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          scholar_no: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          answers: true,
          votes: true,
          bookmarks: true,
        },
      },
    },
  });

  return questions;
}

export async function deleteQuestionByAdmin(questionId) {
  const existing = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Question not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.vote.deleteMany({
      where: {
        OR: [{ questionId }, { answer: { questionId } }],
      },
    });
    await tx.bookmark.deleteMany({ where: { questionId } });
    await tx.answer.deleteMany({ where: { questionId } });
    await tx.questionTag.deleteMany({ where: { questionId } });
    await tx.question.delete({ where: { id: questionId } });
  });
}
