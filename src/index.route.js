import authRoutes from "./module/auth/auth.route.js";

export const commonRoutes = (app) => {
  app.use("/api/v1/auth", authRoutes);
};
