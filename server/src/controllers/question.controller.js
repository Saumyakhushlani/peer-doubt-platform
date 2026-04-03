import { createQuestion, getQuestionsByAuthor, getQuestionById, getQuestionsByTag, getQuestions } from "../services/question.service.js";

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

export const getQuestionsController = async (req, res) => {
    try {
        const { cursor } = req.query;
        const questions = await getQuestions(cursor);
        res.status(200).json({ questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};