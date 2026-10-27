import express from "express";
import morgan from "morgan";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.send("Backend is working.....");
});
