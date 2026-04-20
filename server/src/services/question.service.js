import prisma from "../config/prisma.js";

const ANONYMOUS_AUTHOR_NAME = "Anonymous Question";

const maskAnonymousQuestionAuthor = (question, { viewerId, revealForOwner = false } = {}) => {
    const isOwner = viewerId && question.authorId === viewerId;
    if (!question.isAnonymous || (revealForOwner && isOwner)) return question;

    const {
        authorId,
        author,
        ...rest
    } = question;

    return {
        ...rest,
        author: {
            name: ANONYMOUS_AUTHOR_NAME,
        },
    };
};

export const createQuestion = async (data) => {
    const { title, body, authorId, tags, isAnonymous = false } = data;

    const question = await prisma.question.create({
        data: {
            title,
            body,
            authorId,
            isAnonymous: Boolean(isAnonymous),
        },
    });

    if (!Array.isArray(tags) || tags.length === 0) {
        return question;
    }

    const uniqueNames = [
        ...new Set(
            tags
                .filter((t) => typeof t === "string")
                .map((t) => t.trim())
                .filter(Boolean)
        ),
    ];

    if (uniqueNames.length === 0) {
        return question;
    }

    await prisma.$transaction(
        async (tx) => {
            await Promise.all(
                uniqueNames.map(async (name) => {
                    const tag = await tx.tag.upsert({
                        where: { name },
                        create: { name },
                        update: {},
                    });
                    await tx.questionTag.upsert({
                        where: {
                            questionId_tagId: {
                                questionId: question.id,
                                tagId: tag.id,
                            },
                        },
                        create: { questionId: question.id, tagId: tag.id },
                        update: {},
                    });
                })
            );
        },
        { maxWait: 10_000, timeout: 30_000 }
    );

    const questionWithTags = await prisma.question.findUnique({
        where: { id: question.id },
        include: { tags: { include: { tag: true } } },
    });

    if (!questionWithTags) return question;

    return {
        ...questionWithTags,
        tags: questionWithTags?.tags?.map((qt) => qt.tag) ?? [],
    };
};

export const getQuestionsByAuthor = async (id, viewerId) => {
    const questions = await prisma.question.findMany({
        where: {
            authorId: id,
        },
        include: {
            author: {
                select: {
                    name: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            _count: {
                select: {
                    answers: true,
                    votes: true,
                    bookmarks: true,
                },
            },
        },
    });
    return questions.map((question) =>
        maskAnonymousQuestionAuthor(question, { viewerId, revealForOwner: true })
    );
};

export const getQuestionById = async (id, viewerId) => {
    const question = await prisma.question.findUnique({
        where: {
            id: id,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    department: true,
                    year: true,
                    scholar_no: true,
                    createdAt: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            answers: {
                orderBy: { votes: { _count: "desc" } },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            department: true,
                            year: true,
                            scholar_no: true,
                            createdAt: true,
                        },
                    },
                    _count: {
                        select: {
                            votes: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    answers: true,
                    bookmarks: true,
                },
            },
            votes: {
                select: { type: true }
            }
        },
    });

    if (!question) return null;

    const netVotes = question.votes ? question.votes.reduce((acc, v) => acc + (v.type === 'UP' ? 1 : -1), 0) : 0;
    delete question.votes;
    
    const transformedQuestion = {
        ...question,
        _count: {
            ...question._count,
            votes: netVotes
        },
        tags: question?.tags?.map((qt) => qt.tag) ?? [],
    };

    return maskAnonymousQuestionAuthor(transformedQuestion, { viewerId });
};

export const getQuestionsByTag = async (tag) => {
    const questions = await prisma.question.findMany({
        where: {
            tags: {
                some: {
                    tag: { name: tag },
                },
            },
        },
    });
    return questions;
};

export const getQuestions = async (cursor, viewerId, limit=15) => {
    const questions = await prisma.question.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    department: true,
                    year: true,
                    scholar_no: true,
                    createdAt: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            answers: {
                take: 1,
                orderBy: { createdAt: "desc" },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            department: true,
                            year: true,
                            scholar_no: true,
                            createdAt: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    answers: true,
                    bookmarks: true,
                },
            },
            votes: {
                select: { type: true }
            }
        },
    });
    
    const computedQuestions = questions.map(q => {
        const netVotes = q.votes ? q.votes.reduce((acc, v) => acc + (v.type === 'UP' ? 1 : -1), 0) : 0;
        delete q.votes;
        const transformedQuestion = {
            ...q,
            _count: {
                ...q._count,
                votes: netVotes
            }
        };

        return maskAnonymousQuestionAuthor(transformedQuestion, { viewerId });
    });

    return {
        questions: computedQuestions,
        hasMore: questions.length === limit,
    };
};