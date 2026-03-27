import { verifyUser } from "../services/verifyUser.service.js";

export const verifyUserController = async (req, res) => {
  try {
    const { scholar, password } = req.body;
    if (!scholar || !password) {
      return res.status(400).json({ error: "scholar and password are required" });
    }

    const user = await verifyUser({ scholar, password });

    res.status(200).json({
      message: "Verified successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
