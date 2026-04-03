import {
  getTagsForQuestion,
  addTagToQuestion,
  addTagToQuestionByName,
  removeTagFromQuestion,
} from "../services/questionTag.service.js";

export const getTagsForQuestionController = async (req, res) => {
  try {
    const { questionId } = req.params;
    const tags = await getTagsForQuestion(questionId);
    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addTagToQuestionController = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { tagId, name } = req.body ?? {};

    if (tagId && typeof tagId === "string") {
      const link = await addTagToQuestion({ questionId, tagId });
      return res.status(201).json({ questionTag: link });
    }

    if (name && typeof name === "string" && name.trim()) {
      const link = await addTagToQuestionByName({
        questionId,
        name: name.trim(),
      });
      return res.status(201).json({ questionTag: link });
    }

    return res.status(400).json({ error: "Provide tagId or name" });
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Invalid question or tag reference" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const removeTagFromQuestionController = async (req, res) => {
  try {
    const { questionId, tagId } = req.params;
    const questionTag = await removeTagFromQuestion({ questionId, tagId });
    res.status(200).json({ questionTag });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Question tag link not found" });
    }
    res.status(500).json({ error: error.message });
  }
};
