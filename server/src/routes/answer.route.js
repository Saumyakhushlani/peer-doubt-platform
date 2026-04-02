import express from "express";
import { createAnswerController, getAnswersByQuestionController, getAnswerByIdController, getAnswersByAuthorController } from "../controllers/answer.conmtroller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createAnswerController);
router.get("/question/:id", authenticate, getAnswersByQuestionController);
router.get("/:id", authenticate, getAnswerByIdController);
router.get("/author/:id", authenticate, getAnswersByAuthorController);

export default router;
