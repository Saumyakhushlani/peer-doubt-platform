import prisma from "../config/prisma.js";

export const createQuestion = async (data) => {
    const { title, body, authorId, tags } = data;

    const question = await prisma.question.create({
        data: {
            title,
            body,
            authorId,
        },
    });

    if (!Array.isArray(tags) || tags.length === 0) {
        return question;
    }

    const tagInputs = tags;

    await prisma.$transaction(async (tx) => {
        for (const input of tagInputs) {
            if (typeof input === "string") {
                const name = input.trim();
                if (!name) continue;
                const tag = await tx.tag.upsert({
                    where: { name },
                    create: { name },
                    update: {},
                });
                await tx.questionTag.upsert({
                    where: {
                        questionId_tagId: { questionId: question.id, tagId: tag.id },
                    },
                    create: { questionId: question.id, tagId: tag.id },
                    update: {},
                });
                continue;
            }
        }
    });

    const questionWithTags = await prisma.question.findUnique({
        where: { id: question.id },
        include: { tags: { include: { tag: true } } },
    });

    if (!questionWithTags) return question;

    return {
        ...questionWithTags,
        tags: questionWithTags?.tags?.map((qt) => qt.tag) ?? [],
    };
};

export const getQuestionsByAuthor = async (id) => {
    const questions = await prisma.question.findMany({
        where: {
            authorId: id,
        }
    });
    return questions;
};

export const getQuestionById = async (id) => {
    const question = await prisma.question.findUnique({
        where: {
            id: id,
        }
    });
    return question;
};

export const getQuestionsByTag = async (tag) => {
    const questions = await prisma.question.findMany({
        where: {
            tags: {
                some: {
                    tag: { name: tag },
                },
            },
        },
    });
    return questions;
};
