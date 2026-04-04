import { getUserById } from "../services/user.services.js";

export const getMeController = async (req, res) => {
  res.status(200).json({ userId: req.userId });
};

export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User id is required" });
    }

    if (req.userId !== id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
