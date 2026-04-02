import { createBookmark, getBookmarksByUser } from "../services/bookmark.service.js";

export const createBookmarkController = async (req, res) => {
    try {
        const { questionId } = req.params;
        const bookmark = await createBookmark({ userId: req.userId, questionId });
        res.status(201).json({ bookmark });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookmarksByUserController = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User id is required" });
        }
        const bookmarks = await getBookmarksByUser(userId);
        res.status(200).json({ bookmarks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }