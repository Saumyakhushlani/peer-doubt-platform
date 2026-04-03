import express from "express";
import {
  getAllTagsController,
  getTagByIdController,
  createTagController,
  deleteTagController,
} from "../controllers/tag.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getAllTagsController);
router.get("/:id", authenticate, getTagByIdController);
router.post("/", authenticate, createTagController);
router.delete("/:id", authenticate, deleteTagController);

export default router;
