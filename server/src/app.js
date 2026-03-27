import express from "express";
import cors from "cors";

import userRouter from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
