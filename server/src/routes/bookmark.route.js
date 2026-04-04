import express from "express";
import {
    createBookmarkController,
    getBookmarksByUserController,
    removeBookmarkController,
} from "../controllers/bookmark.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createBookmarkController);
router.delete("/question/:questionId", authenticate, removeBookmarkController);
router.get("/user/:id", authenticate, getBookmarksByUserController);

export default router;