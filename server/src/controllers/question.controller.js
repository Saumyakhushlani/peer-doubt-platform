import { createQuestion, getQuestionsByAuthor, getQuestionById, getQuestionsByTag } from "../services/question.service";

export const createQuestionController = async (req, res) => {
    try {
        const { title, body, tags } = req.body;
        const question = await createQuestion({ title, body, tags, authorId: req.userId });
        res.status(201).json({ question });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getQuestionsByAuthorController = async (req, res) => {
    try {
        const { id } = req.params;
        const questions = await getQuestionsByAuthor(id);
        res.status(200).json({ questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getQuestionByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await getQuestionById(id);
        res.status(200).json({ question });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getQuestionsByTagController = async (req, res) => {
    try {
        const { tag } = req.params;
        const questions = await getQuestionsByTag(tag);
        res.status(200).json({ questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

