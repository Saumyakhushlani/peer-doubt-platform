import "dotenv/config";
import express from "express";
import cors from "cors";

import userRouter from "./routes/user.routes.js";
import questionRouter from "./routes/question.routes.js";
import answerRouter from "./routes/answer.route.js";
import voteRouter from "./routes/vote.route.js";
import bookmarkRouter from "./routes/bookmark.route.js";
import tagRouter from "./routes/tag.route.js";
import questionTagRouter from "./routes/questionTag.route.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/question", questionRouter);
app.use("/api/answer", answerRouter);
app.use("/api/vote", voteRouter);
app.use("/api/bookmark", bookmarkRouter);
app.use("/api/tag", tagRouter);
app.use("/api/question-tag", questionTagRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
