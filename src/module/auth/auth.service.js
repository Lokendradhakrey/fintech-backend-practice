import { redis } from "../../config/redis.js";
import { generateOtp } from "../../function/constant.function.js";
import { AppError } from "../../utils/appError.js";
import SessionModel from "../session/Session.model.js";
import {
  createUser,
  findByEmail,
  findByPhone,
} from "../user/user.repository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const OTP_TTL_SECONDS = 300;
const OTP_COOLDOWN_SECONDS = 60;
const JWT_SECRET =
  process.env.JWT_ACCESS_SECRET || "djfkrekksdjkfk3453343k43jkejrk5j3kj54334";

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

export const signin = async (payload) => {
  const { email, phone, password, ip, userAgent } = payload;

  if (!password || (!email && !phone)) {
    throw new AppError("Email or phone and password are required", 400);
  }

  // Reject ambiguous requests containing both identifiers.
  if (email && phone) {
    throw new AppError("Provide either email or phone, not both", 400);
  }

  const user = email
    ? await findByEmail(email, "+password")
    : await findByPhone(phone, "+password");

  if (!user.isOtpVerified) {
    throw new AppError("No user account found! Create an account first.", 404);
  }

  if (!user || user.isDeleted) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email, phone or password");
  }
  if (!JWT_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  const refreshToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  const session = await SessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip,
    userAgent,
  });

  const accessToken = jwt.sign(
    {
      userId: user._id,
      sessionId: session._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

export const sendSignUpOtp = async (phone) => {
  const otpKey = `otp:signup:${phone}`;
  const cooldownKey = `otp:cooldown:${phone}`;

  const cooldownClaimed = await redis.set(
    cooldownKey,
    "1",
    "EX",
    OTP_COOLDOWN_SECONDS,
    "NX",
  );

  if (!cooldownClaimed) {
    throw new AppError("Please wait before requesting another OTP", 429);
  }
  const otp = generateOtp();
  console.log(`Otp sent to phone:${phone}`, otp);

  try {
    await redis.set(otpKey, otp, "EX", OTP_TTL_SECONDS);
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

export const sendOtp = async (phone) => {
  const otpKey = `otp:${phone}`;
  const cooldownKey = `otp:cooldown:${phone}`;

  const cooldownClaimed = await redis.set(
    cooldownKey,
    "1",
    "EX",
    OTP_COOLDOWN_SECONDS,
    "NX",
  );

  if (!cooldownClaimed) {
    throw new AppError("Please wait before requesting another OTP", 429);
  }
  const otp = generateOtp();
  console.log(`Otp sent to phone:${phone}`, otp);

  try {
    await redis.set(otpKey, otp, "EX", OTP_TTL_SECONDS);
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
  const otpKey = `otp:${phone}`;

  const result = await redis.eval(VERIFY_OTP_SCRIPT, 1, otpKey, otp);

  if (result === -1) {
    throw new AppError("OTP expired or not found", 400);
  }

  if (result === 0) {
    throw new AppError("Incorrect OTP", 400);
  }

  return {
    verified: true,
  };
};

export const verifySignUpOtp = async (phone, otp, ip, userAgent) => {
  const otpKey = `otp:signup:${phone}`;

  const result = await redis.eval(VERIFY_OTP_SCRIPT, 1, otpKey, otp);

  if (result === -1) {
    throw new AppError("OTP expired or not found", 400);
  }

  if (result === 0) {
    throw new AppError("Incorrect OTP", 400);
  }

  const user = await findByPhone(phone);

  if (!user) {
    throw new AppError("User not found", 404);
  }
  // Update verification status if needed.
  if (!user.isOtpVerified) {
    user.isOtpVerified = true;
    await user.save();
  }

  if (!JWT_SECRET) {
    throw new AppError("JWT secret is not configured", 500);
  }

  const refreshToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  const session = await SessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip,
    userAgent,
  });

  const accessToken = jwt.sign(
    {
      userId: user._id,
      sessionId: session._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return {
    accessToken,
    user: user,
    message: "Otp verified",
    refreshToken,
  };
};

export const refreshToken = async (token) => {
  if (!token) {
    throw new AppError("Unauthenticated user, login first", 401);
  }

  const decoded = jwt.verify(token, JWT_SECRET);

  const session = await SessionModel.findOne({
    user: decoded.userId,
    revoked: false,
  });

  if (!session) {
    throw new AppError("Invalid token", 400);
  }

  const accessToken = jwt.sign(
    { userId: decoded.userId, role: decoded.role },
    JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: decoded.userId, role: decoded.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  const newRefreshTokenHash = await bcrypt.hash(refreshToken, 12);
  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

export const logout = async (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);

  const session = await SessionModel.findOne({
    user: decoded.userId,
    revoked: false,
  });

  if (!session) {
    throw new AppError("Invalid token", 400);
  }

  await bcrypt.compare(token, session.refreshTokenHash);

  session.revoked = true;
  await session.save();
};

export const logoutFromAll = async (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);

  await SessionModel.updateMany(
    {
      user: decoded.userId,
      revoked: false,
    },
    {
      revoked: true,
    },
  );
};
