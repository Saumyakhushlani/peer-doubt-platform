import express from "express";
import { verifyUserController } from "../controllers/verifyUser.controller.js";
import { getUserByIdController } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/verify", verifyUserController);
router.get("/:id", getUserByIdController);

export default router;
