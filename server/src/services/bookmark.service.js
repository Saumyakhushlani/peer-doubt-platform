import prisma from "../config/prisma.js";

export const createBookmark = async (data) => {
    const bookmark = await prisma.bookmark.create({
        data: {
            userId: data.userId,
            questionId: data.questionId,
        },
    });
    return bookmark;
};

export const removeBookmark = async ({ userId, questionId }) => {
    const result = await prisma.bookmark.deleteMany({
        where: { userId, questionId },
    });
    return { deleted: result.count };
};

export const getBookmarksByUser = async (userId) => {
    const bookmarks = await prisma.bookmark.findMany({
        where: {
            userId: userId,
        },
        include: {
            question: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            department: true,
                            year: true,
                            scholar_no: true,
                            createdAt: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    _count: {
                        select: {
                            answers: true,
                            votes: true,
                            bookmarks: true,
                        },
                    },
                },
            },
        },
    });
    return bookmarks;
};