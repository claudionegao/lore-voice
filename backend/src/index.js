import express from "express";
import dotenv from "dotenv";
import { startListener } from "./listener.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor do Upstash Listener rodando 🚀");
});

app.listen(process.env.PORT || 3000, async () => {
  console.log("🚀 Servidor rodando na porta 3000");
  await startListener();
});
