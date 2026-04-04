import express from "express";
import { verifyUserController } from "../controllers/verifyUser.controller.js";
import { getMeController, getUserByIdController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/verify", verifyUserController);
router.get("/me", authenticate, getMeController);
router.get("/:id", authenticate, getUserByIdController);

export default router;
