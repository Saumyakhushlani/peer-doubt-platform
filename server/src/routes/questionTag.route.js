import express from "express";
import {
  getTagsForQuestionController,
  addTagToQuestionController,
  removeTagFromQuestionController,
} from "../controllers/questionTag.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/question/:questionId", authenticate, getTagsForQuestionController);
router.post("/question/:questionId", authenticate, addTagToQuestionController);
router.delete(
  "/question/:questionId/tag/:tagId",
  authenticate,
  removeTagFromQuestionController
);

export default router;
