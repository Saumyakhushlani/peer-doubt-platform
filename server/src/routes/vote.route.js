import express from "express";
import { createVoteController, getVotesByQuestionController, getVotesByAnswerController, getVotesCountByQuestionController, getVotesCountByAnswerController, getVotesByUserController } from "../controllers/vote.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createVoteController);
router.get("/question/:id", authenticate, getVotesByQuestionController);
router.get("/answer/:id", authenticate, getVotesByAnswerController);
router.get("/question/:id/count", authenticate, getVotesCountByQuestionController);
router.get("/answer/:id/count", authenticate, getVotesCountByAnswerController);
router.get("/user/:id", authenticate, getVotesByUserController);

export default router;