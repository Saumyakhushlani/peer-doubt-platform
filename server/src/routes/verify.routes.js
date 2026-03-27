import express from "express";
import { verifyUserController } from "../controllers/verifyUser.controller.js";

const router = express.Router();

router.post("/", verifyUserController);

export default router;
