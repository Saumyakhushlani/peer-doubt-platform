import {
  adminLogin,
  deleteQuestionByAdmin,
  getAdminQuestions,
} from "../services/admin.service.js";

function parseIsAnonymous(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export async function adminLoginController(req, res) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "password is required" });
    }

    const { token } = await adminLogin(password);
    return res.status(200).json({ token });
  } catch (error) {
    const message = error?.message ?? "Admin login failed";
    if (message.includes("environment")) {
      return res.status(500).json({ error: "Server configuration error" });
    }
    return res.status(401).json({ error: message });
  }
}

export async function getAdminQuestionsController(req, res) {
  try {
    const isAnonymous = parseIsAnonymous(req.query.isAnonymous);
    const questions = await getAdminQuestions({ isAnonymous });
    return res.status(200).json({ questions });
  } catch (error) {
    return res.status(500).json({ error: error?.message ?? "Request failed" });
  }
}

export async function deleteQuestionByAdminController(req, res) {
  try {
    const { id } = req.params;
    await deleteQuestionByAdmin(id);
    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    const message = error?.message ?? "Delete failed";
    if (message === "Question not found") {
      return res.status(404).json({ error: message });
    }
    return res.status(500).json({ error: message });
  }
}
