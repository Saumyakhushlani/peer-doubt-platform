import { createVote, getVotesByQuestion, getVotesByAnswer, getVotesCountByQuestion, getVotesCountByAnswer, getVotesByUser } from "../services/vote.service.js";

export const createVoteController = async (req, res) => {
    try {
        const { type, questionId, answerId } = req.body;
        const vote = await createVote({ type, questionId, answerId, authorId: req.userId });
        res.status(201).json({ vote });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVotesByQuestionController = async (req, res) => {
    try {
        const { questionId } = req.params;
        const votes = await getVotesByQuestion(questionId);
        res.status(200).json({ votes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVotesByAnswerController = async (req, res) => {
    try {
        const { answerId } = req.params;
        const votes = await getVotesByAnswer(answerId);
        res.status(200).json({ votes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVotesCountByQuestionController = async (req, res) => {
    try {
        const { questionId } = req.params;
        const votesCount = await getVotesCountByQuestion(questionId);
        res.status(200).json({ votesCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVotesCountByAnswerController = async (req, res) => {
    try {
        const { answerId } = req.params;
        const votesCount = await getVotesCountByAnswer(answerId);
        res.status(200).json({ votesCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVotesByUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await getVotesByUser(id);
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};