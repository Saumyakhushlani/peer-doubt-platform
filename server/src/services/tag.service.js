import prisma from "../config/prisma.js";

export const getAllTags = async () => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });
  return tags;
};

export const getTagById = async (id) => {
  const tag = await prisma.tag.findUnique({
    where: { id },
  });
  return tag;
};

export const getTagByName = async (name) => {
  const tag = await prisma.tag.findUnique({
    where: { name },
  });
  return tag;
};

export const createTag = async (data) => {
  const tag = await prisma.tag.create({
    data: { name: data.name },
  });
  return tag;
};

export const deleteTag = async (id) => {
  const tag = await prisma.tag.delete({
    where: { id },
  });
  return tag;
};
