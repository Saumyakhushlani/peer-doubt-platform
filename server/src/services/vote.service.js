import prisma from "../config/prisma.js";

export const createVote = async (data) => {
    if (data.questionId) {
        await prisma.vote.deleteMany({ where: { userId: data.authorId, questionId: data.questionId } });
    } else if (data.answerId) {
        await prisma.vote.deleteMany({ where: { userId: data.authorId, answerId: data.answerId } });
    }

    const vote = await prisma.vote.create({
        data: {
            type: data.type,
            userId: data.authorId,
            questionId: data.questionId,
            answerId: data.answerId,
        }
    });
    return vote;
};

export const deleteVote = async (data) => {
    if (data.questionId) {
        return await prisma.vote.deleteMany({
            where: {    
                userId: data.userId,
                questionId: data.questionId,
            }
        });
    }
    if (data.answerId) {
        return await prisma.vote.deleteMany({
            where: {    
                userId: data.userId,
                answerId: data.answerId,
            }
        });
    }
};

export const getMyVotes = async (userId) => {
    return await prisma.vote.findMany({
        where: { userId }
    });
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
    const votes = await prisma.vote.findMany({
        where: {
            questionId: questionId,
        }
    });
    return votes.map(vote => vote.type === 'UP' ? 1 : -1).reduce((acc, curr) => acc + curr, 0);
};

export const getVotesCountByAnswer = async (answerId) => {
    const votes = await prisma.vote.findMany({
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
        },
        
    });
    return votes;
};
