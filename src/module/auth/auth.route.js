import { Router } from "express";
import { createUserSchema } from "../user/user.validation.js";
import { signupController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = Router();

router.post("/signup", validate(createUserSchema), signupController);

export default router;
