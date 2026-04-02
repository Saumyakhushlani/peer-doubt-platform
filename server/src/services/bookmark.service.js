import prisma from "../config/prisma";

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
        }
    });
    return bookmarks;
};