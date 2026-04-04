import prisma from "../config/prisma.js";

export const createBookmark = async (data) => {
    const bookmark = await prisma.bookmark.create({
        data: {
            userId: data.userId,
            questionId: data.questionId,
        }
    });
    return bookmark;
};

export const getBookmarksByUser = async (userId) => {
    const bookmarks = await prisma.bookmark.findMany({
        where: {
            userId: userId,
        },
        include: {
            question: {
                include: {
                    author: true,
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