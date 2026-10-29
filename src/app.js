import express from "express";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware.js";
import { commonRoutes } from "./index.route.js";
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.send("Backend is working.....");
});

commonRoutes(app);

app.use(errorHandler);
