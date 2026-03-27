import prisma from "../config/prisma.js";

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}
