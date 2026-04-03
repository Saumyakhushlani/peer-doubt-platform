import {
  getAllTags,
  getTagById,
  createTag,
  deleteTag,
} from "../services/tag.service.js";

export const getAllTagsController = async (req, res) => {
  try {
    const tags = await getAllTags();
    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTagByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await getTagById(id);
    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }
    res.status(200).json({ tag });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTagController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Tag name is required" });
    }
    const tag = await createTag({ name: name.trim() });
    res.status(201).json({ tag });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A tag with this name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteTagController = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await deleteTag(id);
    res.status(200).json({ tag });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tag not found" });
    }
    res.status(500).json({ error: error.message });
  }
};
