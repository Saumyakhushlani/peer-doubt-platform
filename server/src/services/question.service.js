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

    const uniqueNames = [
        ...new Set(
            tags
                .filter((t) => typeof t === "string")
                .map((t) => t.trim())
                .filter(Boolean)
        ),
    ];

    if (uniqueNames.length === 0) {
        return question;
    }

    await prisma.$transaction(
        async (tx) => {
            await Promise.all(
                uniqueNames.map(async (name) => {
                    const tag = await tx.tag.upsert({
                        where: { name },
                        create: { name },
                        update: {},
                    });
                    await tx.questionTag.upsert({
                        where: {
                            questionId_tagId: {
                                questionId: question.id,
                                tagId: tag.id,
                            },
                        },
                        create: { questionId: question.id, tagId: tag.id },
                        update: {},
                    });
                })
            );
        },
        { maxWait: 10_000, timeout: 30_000 }
    );

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

export const getQuestions = async (cursor, limit=15) => {
    const questions = await prisma.question.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
    });
    return questions;
};