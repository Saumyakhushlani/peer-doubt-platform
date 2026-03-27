import express from "express";
import cors from "cors";

import verifyRouter from "./routes/verify.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/verify", verifyRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
