import prisma from "../config/prisma.js";

export const getTagsForQuestion = async (questionId) => {
  const rows = await prisma.questionTag.findMany({
    where: { questionId },
    include: { tag: true },
    orderBy: { tag: { name: "asc" } },
  });
  return rows.map((row) => row.tag);
};

export const addTagToQuestion = async ({ questionId, tagId }) => {
  const link = await prisma.questionTag.upsert({
    where: {
      questionId_tagId: { questionId, tagId },
    },
    create: { questionId, tagId },
    update: {},
    include: { tag: true },
  });
  return link;
};

export const addTagToQuestionByName = async ({ questionId, name }) => {
  const tag = await prisma.tag.upsert({
    where: { name },
    create: { name },
    update: {},
  });
  return addTagToQuestion({ questionId, tagId: tag.id });
};

export const removeTagFromQuestion = async ({ questionId, tagId }) => {
  const link = await prisma.questionTag.delete({
    where: {
      questionId_tagId: { questionId, tagId },
    },
  });
  return link;
};
