import prisma from "../config/prisma.js";

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          questions: true,
          answers: true,
          votes: true,
        },
      },
    },
  });
  if (!user) return null;
  const { password: _, ...safe } = user;
  return safe;
}
