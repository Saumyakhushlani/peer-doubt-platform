import express from "express";
import { createQuestionController, getQuestionsByAuthorController, getQuestionByIdController, getQuestionsByTagController } from "../controllers/question.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createQuestionController);
router.get("/author/:id", authenticate, getQuestionsByAuthorController);
router.get("/tag/:tag", authenticate, getQuestionsByTagController);
router.get("/:id", authenticate, getQuestionByIdController);
router.get("/", authenticate, getQuestionsController);

export default router