import express from "express";
import { createBookmarkController, getBookmarksByUserController } from "../controllers/bookmark.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createBookmarkController);
router.get("/user/:id", authenticate, getBookmarksByUserController);

export default router