import prisma from "../config/prisma.js";

export const createAnswer = async (data) => {
    const answer = await prisma.answer.create({
        data: {
            body: data.body,
            authorId: data.authorId,
            questionId: data.questionId,
            parentId: data.parentId,
        }
    });
    return answer;
};

export const getAnswersByQuestion = async (questionId) => {
    const answers = await prisma.answer.findMany({
        where: {
            questionId: questionId,
        }
    });
    return answers;
};

export const getAnswerById = async (id) => {
    const answer = await prisma.answer.findUnique({
        where: {
            id: id,
        }
    });
    return answer;
};

export const getAnswersByAuthor = async (authorId) => {
    const answers = await prisma.answer.findMany({
        where: {
            authorId: authorId,
        }
    });
    return answers;
};
