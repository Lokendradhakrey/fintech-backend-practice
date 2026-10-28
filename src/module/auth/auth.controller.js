import { handleSuccess } from "../../utils/responseHandler.js";
import { signup } from "./auth.service.js";

export const signupController = async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  const user = await signup({ fullName, email, password, phone });

  return handleSuccess(res, 201, "User signed up successfully", user);
};
