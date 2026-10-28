import mongoose from "mongoose";
import { ROLES } from "../../constant/enum";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      minlength: [2, "Full name must contain at least 2 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian mobile number",
      ],
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must contain at least 8 characters"],
      maxlength: [128, "Password cannot exceed 128 characters"],
      match: [
        /^[A-Z](?=.*\d)(?=.*[^A-Za-z0-9\s])\S*$/,
        "Password must start with a capital letter and contain a number and special character",
      ],
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
