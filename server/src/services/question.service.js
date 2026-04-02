import prisma from "../config/prisma";

export const createQuestion = async (data) => {
    const question = await prisma.question.create({
        data: {
            title: data.title,
            body: data.body,
            authorId: data.authorId,
            tags: data.tags,
        }
    });
    return question;
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
                    name: tag,
                }
            }
        }
    });
    return questions;
};
