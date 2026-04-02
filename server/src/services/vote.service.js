import prisma from "../config/prisma";

export const createVote = async (data) => {
    const vote = await prisma.vote.create({
        data: {
            type: data.type,
            authorId: data.authorId,
            questionId: data.questionId,
            answerId: data.answerId,
        }
    });
    return vote;
};

export const getVotesByQuestion = async (questionId) => {
    const votes = await prisma.vote.findMany({
        where: {
            questionId: questionId,
        }
    });
    return votes;
};

export const getVotesByAnswer = async (answerId) => {
    const votes = await prisma.vote.findMany({
        where: {
            answerId: answerId,
        }
    });
    return votes;
};

export const getVotesCountByQuestion = async (questionId) => {
    const votes = await prisma.vote.count({
        where: {

            questionId: questionId,
        }
    });
    return votes.map(vote => vote.type === 'UP' ? 1 : -1).reduce((acc, curr) => acc + curr, 0);
};

export const getVotesCountByAnswer = async (answerId) => {
    const votes = await prisma.vote.count({
        where: {
            answerId: answerId,
        }
    });
    return votes.map(vote => vote.type === 'UP' ? 1 : -1).reduce((acc, curr) => acc + curr, 0);
};

export const getVotesByUser = async (userId) => {
    const votes = await prisma.vote.findMany({
        where: {
            userId: userId,
        }
    });
    return votes;
};
