import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import courseRoutes from "./modules/course/course.routes";
import outcomeRoutes from "./modules/outcome/outcome.routes";
import enrollmentRoutes from "./modules/enrollment/enrollment.routes";
import traineeRoutes from "./modules/trainee/trainee.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Allow frontend URL
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/outcomes", outcomeRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/trainees", traineeRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Enforce production security check for Mock SMS and Twilio configs
if (process.env.NODE_ENV === "production") {
  if (process.env.MOCK_EMAIL === "true") {
    console.error("CRITICAL ERROR: Refusing to boot. MOCK_EMAIL is set to true in a production environment!");
    process.exit(1);
  }

  const required = ["GMAIL_USER", "GMAIL_APP_PASSWORD"];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`CRITICAL ERROR: Refusing to boot. Missing env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

app.listen(env.PORT, () => {
  console.log(`Server is running on port http://localhost:${env.PORT}`);
});
