import { redis } from "../../config/redis.js";
import { AppError } from "../../utils/appError.js";
import User from "../user/User.model.js";
import {
  createUser,
  findByEmail,
  findByPhone,
} from "../user/user.repository.js";
import bcrypt from "bcryptjs";

const OTP_TTL_SECONDS = 300;
const OTP_COOLDOWN_SECONDS = 60;

export const signup = async (payload) => {
  const { fullName, email, phone, password } = payload;

  // Check required fields after request validation.
  if (!fullName || !email || !phone || !password) {
    throw new AppError("Required fields are missing", 400);
  }

  const [userByEmail, userByPhone] = await Promise.all([
    findByEmail(email),
    findByPhone(phone),
  ]);

  if (userByEmail?.isOtpVerified) {
    throw new AppError("Email already exists", 409);
  }

  if (userByPhone?.isOtpVerified) {
    throw new AppError("Phone number already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({
    fullName,
    email,
    phone,
    password: passwordHash,
    isOtpVerified: false,
  });
  return user;
};

export const sendOtp = async (phone) => {
  const otpKey = `otp:signup:${phone}`;
  const cooldownKey = `otp:cooldown:${phone}`;

  const cooldownClaimed = await redis.set(cooldownKey, "1", {
    NX: true,
    EX: OTP_COOLDOWN_SECONDS,
  });

  if (!cooldownClaimed) {
    throw new AppError("Please wait before requesting another OTP", 429);
  }

  try {
    await redis.set(otpKey, otp, {
      EX: OTP_TTL_SECONDS,
    });
  } catch (error) {
    await redis.del(otpKey).catch(() => {});
    await redis.del(cooldownKey).catch(() => {});
    throw error;
  }
  return {
    message: "OTP sent successfully",
    expiresIn: OTP_TTL_SECONDS,
  };
};

const VERIFY_OTP_SCRIPT = `
  local storedOtp = redis.call("GET", KEYS[1])

  if not storedOtp then
    return -1
  end

  if storedOtp ~= ARGV[1] then
    return 0
  end

  redis.call("DEL", KEYS[1])
  return 1
`;

export const verifyOtp = async (phone, otp) => {
  const key = `otp:signup:${phone}`;

  const result = await redis.eval(VERIFY_OTP_SCRIPT, {
    keys: [key],
    arguments: [otp],
  });

  if (result === -1) {
    throw new AppError("OTP expired or not found", 400);
  }

  if (result === 0) {
    throw new AppError("Incorrect OTP", 400);
  }

  const user = await findByPhone(phone);

  if (user) {
    const user = await User.findByIdAndUpdate(
      user._id,
      {
        isOtpVarified: true,
      },
      { upsert: true },
    );
  }

  return {
    verified: true,
  };
};
