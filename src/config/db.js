import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error connecting mongodb", error);
  }
};
