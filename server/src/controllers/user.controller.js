import { getUserById } from "../services/user.services.js";

export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User id is required" });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...safeUser } = user;
    res.status(200).json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
