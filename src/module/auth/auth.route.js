import { Router } from "express";
import { createUserSchema } from "../user/user.validation.js";
import {
  logoutController,
  logoutFromAllController,
  refreshTokenController,
  sendOtpController,
  sendSignUPOtpController,
  signinController,
  signupController,
  verifyOtpController,
  verifySignUpOtpController,
} from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = Router();

router.post("/signup", validate(createUserSchema), signupController);
router.post("/login", signinController);

router.post("/send-signup-otp", sendSignUPOtpController);
router.post("/verify-signup-otp", verifySignUpOtpController);

router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);

router.post("/refresh-token", refreshTokenController);

router.post("/logout", logoutController);
router.post("/logout-all", logoutFromAllController);

export default router;
