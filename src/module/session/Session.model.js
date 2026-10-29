import { model, Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserId is required"],
    },
    refreshTokenHash: {
      type: String,
      required: [true, "refreshToken is required"],
    },
    ip: {
      type: String,
      required: [true, "ip is required"],
    },
    userAgent: {
      type: String,
      required: [true, "user agent is required"],
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const SessionModel = model("Session", sessionSchema);

export default SessionModel;
