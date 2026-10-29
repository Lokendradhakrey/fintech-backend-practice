import { AppError } from "../../utils/appError.js";
import { handleSuccess } from "../../utils/responseHandler.js";
import {
  refreshToken,
  sendOtp,
  signin,
  signup,
  verifyOtp,
  verifySignUpOtp,
  sendSignUpOtp,
  logout,
  logoutFromAll,
} from "./auth.service.js";

export const signupController = async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  const user = await signup({ fullName, email, password, phone });

  return handleSuccess(res, 201, "User signed up successfully", user);
};

export const signinController = async (req, res) => {
  const { email, password, phone } = req.body;
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];

  const response = await signin({ email, password, phone, ip, userAgent });

  res.cookie("refreshToken", response.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return handleSuccess(res, 200, "User logged in successfully", {
    accessToken: response.accessToken,
  });
};

export const sendOtpController = async (req, res) => {
  const { phone } = req.body;

  const response = await sendOtp(phone);

  return handleSuccess(res, 201, "Otp sent successfully", response);
};

export const verifyOtpController = async (req, res) => {
  const { phone, otp } = req.body;

  const response = await verifyOtp(phone, otp);

  return handleSuccess(res, 200, "Otp verified successfully", response);
};

export const sendSignUPOtpController = async (req, res) => {
  const { phone } = req.body;

  const response = await sendSignUpOtp(phone);

  return handleSuccess(res, 201, "Otp sent successfully", response);
};

export const verifySignUpOtpController = async (req, res) => {
  const { phone, otp } = req.body;
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];
  const response = await verifySignUpOtp(phone, otp, ip, userAgent);

  res.cookie("refreshToken", response.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return handleSuccess(res, 200, "Otp verified successfully", {
    accessToken: response.accessToken,
    user: response.user,
  });
};

export const refreshTokenController = async (req, res) => {
  const token = req.cookies.refreshToken;

  const response = await refreshToken(token);

  res.cookie("refreshToken", response.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return handleSuccess(res, 200, "Otp verified successfully", {
    accessToken: response.accessToken,
  });
};

export const logoutController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("User already logged out", 400);
  }

  await logout(refreshToken);

  res.clearCookie("refreshToken");
  return handleSuccess(res, 200, "User logged out successfully");
};

export const logoutFromAllController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("User already logged out from all devices", 400);
  }

  await logoutFromAll(refreshToken);

  res.clearCookie("refreshToken");
  return handleSuccess(
    res,
    200,
    "User logged out successfully from all devices",
  );
};
