import { app } from "./src/app.js";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";

dotenv.config();

const PORT = process.env.PORT || 6500;

const serverStart = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server is running on port:${PORT}`);
    });
  } catch (error) {
    console.log("Failed to connect server: ", error.massage || error);
  }
};

serverStart();
