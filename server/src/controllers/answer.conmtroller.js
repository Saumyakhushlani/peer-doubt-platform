import { createAnswer, getAnswersByQuestion, getAnswerById, getAnswersByAuthor } from "../services/asnwer.serice.js";

export const createAnswerController = async (req, res) => {
    try {
        const { body, questionId, parentId } = req.body;
        const answer = await createAnswer({ body, questionId, parentId, authorId: req.userId });
        res.status(201).json({ answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnswersByQuestionController = async (req, res) => {
    try {
        const { questionId } = req.params;
        const answers = await getAnswersByQuestion(questionId);
        res.status(200).json({ answers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnswerByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const answer = await getAnswerById(id);
        res.status(200).json({ answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnswersByAuthorController = async (req, res) => {
    try {
        const { authorId } = req.params;
        const answers = await getAnswersByAuthor(authorId);
        res.status(200).json({ answers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

