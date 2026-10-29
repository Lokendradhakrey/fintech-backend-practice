import mongoose from "mongoose";
import { ROLES } from "../../constant/enum.js";
import { boolean } from "zod";

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
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ROLES,
      default: "USER",
    },

    isOtpVerified: {
      type: boolean,
      default: false,
    },

    isDeleted: {
      type: boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
