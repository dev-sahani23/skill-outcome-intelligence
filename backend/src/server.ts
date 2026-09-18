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
import publicRoutes from "./modules/public/public.routes";
import { prisma } from "./lib/prisma";
import { responseQueue } from "./queues/responseQueue";
import { followUpQueue } from "./queues/followUpQueue";
import { normalizePhoneNumber } from "./services/whatsappService";

import "./workers/followUpWorker";
import "./workers/responseWorker";
import { startWhatsappPoller } from "./jobs/whatsappPoller";

startWhatsappPoller();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Allow frontend URL
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/webhook/whatsapp', (req: any, res: any) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('META WEBHOOK VERIFICATION HIT:', { mode, token, challenge });

  if (mode === 'subscribe' && token === 'skillportal_webhook_secret_2007') {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

app.post('/webhook/whatsapp', async (req: any, res: any) => {
  // IMPORTANT: return 200 immediately
  res.status(200).send('EVENT_RECEIVED');

  try {
    const { entry } = req.body;
    if (!entry || !entry[0] || !entry[0].changes || !entry[0].changes[0]) return;

    const value = entry[0].changes[0].value;
    if (!value.messages || !value.messages[0] || value.messages[0].type !== 'text') {
      console.log('Webhook event ignored (not a text message)');
      return;
    }

    const message = value.messages[0];
    const senderPhone = '+' + message.from;
    const rawText = message.text.body;
    // Meta sends timestamp as unix timestamp in seconds
    const receivedAt = new Date(parseInt(message.timestamp) * 1000).toISOString();

    const normalizedSender = normalizePhoneNumber(senderPhone);

    const contact = await prisma.contact.findFirst({
      where: { phone: normalizedSender },
      include: { trainee: true }
    });

    if (!contact) {
      console.log(`Unsolicited message from ${senderPhone}`);
      return;
    }

    const followUp = await prisma.followUp.findFirst({
      where: {
        traineeId: contact.traineeId,
        status: "SENT",
      },
      orderBy: { scheduledDate: "desc" },
    });

    if (!followUp) {
      console.log(`Unsolicited message from ${senderPhone} (No SENT follow-ups)`);
      return;
    }

    await responseQueue.add("process-response", {
      followUpId: followUp.id,
      traineeId: contact.traineeId,
      rawText,
      senderPhone,
      receivedAt,
    });
  } catch (error) {
    console.error("Webhook processing error", error);
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/outcomes", outcomeRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/trainees", traineeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);

// Test route for manual trigger
app.post('/api/test/trigger-followup', async (req: any, res: any) => {
  try {
    const { traineeId, stage } = req.body;
    if (!traineeId || !stage) return res.status(400).json({ error: "Missing traineeId or stage" });

    const trainee = await prisma.traineeProfile.findUnique({ where: { id: traineeId } });
    if (!trainee) return res.status(404).json({ error: "Trainee not found" });

    const contact = await prisma.contact.findFirst({
      where: { traineeId, isActive: true },
      orderBy: { priorityOrder: 'asc' }
    });

    if (!contact) return res.status(400).json({ error: "No active contact found for trainee" });

    let followUp = await prisma.followUp.findUnique({
      where: {
        traineeId_stage: { traineeId, stage }
      }
    });

    if (!followUp) {
      followUp = await prisma.followUp.create({
        data: {
          traineeId,
          stage: stage,
          scheduledDate: new Date(),
          status: "PENDING",
        }
      });
    }

    await followUpQueue.add("send-follow-up", {
      followUpId: followUp.id,
      traineeId,
      stage: stage,
      primaryPhone: contact.phone,
      traineeFirstName: trainee.fullName.split(' ')[0],
      attemptNumber: 1,
      contactId: contact.id,
    }, { delay: 0, jobId: `manual-followup-${Date.now()}` });

    res.status(200).json({ message: "Follow-up triggered successfully", followUp });
  } catch (error: any) {
    console.error("Manual trigger error", error);
    res.status(500).json({ error: error.message });
  }
});

// Public Verification API for QR Code
app.get("/api/public/verify/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    
    // Find enrollment by certificateId
    const enrollment = await prisma.enrollment.findFirst({
      where: { certificateId: hash, isCertified: true },
      include: {
        trainee: true,
        program: {
          include: { provider: true }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Invalid or unfound certificate hash" });
    }

    return res.status(200).json({
      traineeName: enrollment.trainee.fullName,
      courseName: enrollment.program.name,
      issuer: enrollment.program.provider.instituteName,
      issuedDate: enrollment.completedAt || enrollment.enrolledAt,
      status: "valid"
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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

  if (process.env.MOCK_WHATSAPP === "true") {
    console.error("CRITICAL ERROR: Refusing to boot. MOCK_WHATSAPP is set to true in a production environment!");
    process.exit(1);
  }

  const whatsappRequired = ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"];
  const whatsappMissing = whatsappRequired.filter(k => !process.env[k]);
  if (whatsappMissing.length) {
    console.error(`CRITICAL ERROR: Refusing to boot. Missing env vars: ${whatsappMissing.join(", ")}`);
    process.exit(1);
  }
}

const startServer = async () => {
  try {
    // Explicitly connect to the database to ensure it's up before serving requests
    await prisma.$connect();
    console.log("🚀 Connected to the PostgreSQL database successfully.");

    app.listen(env.PORT, () => {
      console.log(`Server is running on port http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database. Make sure your Docker container is running.");
    console.error(error);
    process.exit(1);
  }
};

startServer();
