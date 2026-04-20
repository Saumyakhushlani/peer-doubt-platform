import express from "express";
import {
  adminLoginController,
  deleteQuestionByAdminController,
  getAdminQuestionsController,
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/login", adminLoginController);
router.get("/questions", authenticateAdmin, getAdminQuestionsController);
router.delete("/questions/:id", authenticateAdmin, deleteQuestionByAdminController);

export default router;
