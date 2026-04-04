import {
    createBookmark,
    getBookmarksByUser,
    removeBookmark,
} from "../services/bookmark.service.js";

export const createBookmarkController = async (req, res) => {
    try {
        const { questionId } = req.body;
        if (!questionId || typeof questionId !== "string") {
            return res.status(400).json({ error: "questionId is required" });
        }
        const bookmark = await createBookmark({
            userId: req.userId,
            questionId,
        });
        res.status(201).json({ bookmark });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const removeBookmarkController = async (req, res) => {
    try {
        const { questionId } = req.params;
        if (!questionId) {
            return res.status(400).json({ error: "questionId is required" });
        }
        await removeBookmark({ userId: req.userId, questionId });
        res.status(200).json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookmarksByUserController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "User id is required" });
        }
        if (req.userId !== id) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const bookmarks = await getBookmarksByUser(id);
        res.status(200).json({ bookmarks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};