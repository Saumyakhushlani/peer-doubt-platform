import express from "express";
import cors from "cors";

import userRouter from "./routes/user.routes.js";
import questionRouter from "./routes/question.routes.js";
import answerRouter from "./routes/answer.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/question", questionRouter);
app.use("/api/answer", answerRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
