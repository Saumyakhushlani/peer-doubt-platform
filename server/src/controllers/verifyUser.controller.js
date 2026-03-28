import { verifyUser } from "../services/verifyUser.service.js";

export const verifyUserController = async (req, res) => {
  try {
    const { scholar, password } = req.body;
    if (!scholar || !password) {
      return res.status(400).json({ error: "scholar and password are required" });
    }

    const { user, token } = await verifyUser({ scholar, password });

    res.status(200).json({
      message: "Verified successfully",
      user,
      token,
    });
  } catch (error) {
    const msg = error?.message ?? "Verification failed";
    if (msg.includes("JWT_SECRET")) {
      return res.status(500).json({ error: "Server configuration error" });
    }
    res.status(400).json({ error: msg });
  }
};
