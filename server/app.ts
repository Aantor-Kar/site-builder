import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

function parseOrigins(raw: string | undefined) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

function escapeRegex(value: string) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function matchesOriginPattern(origin: string, pattern: string) {
  if (pattern === "*") {
    return true;
  }

  if (origin === pattern) {
    return true;
  }

  if (!pattern.includes("*")) {
    return false;
  }

  const escapedPattern = pattern
    .split("*")
    .map((segment) => escapeRegex(segment))
    .join(".*");

  const regex = new RegExp(`^${escapedPattern}$`, "i");

  return regex.test(origin);
}

function isAllowedOrigin(origin: string) {
  const allowedOrigins = parseOrigins(process.env.TRUSTED_ORIGINS);
  
  // If no TRUSTED_ORIGINS are configured, allow all origins in development
  if (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") {
    return true;
  }

  return allowedOrigins.some((pattern) => matchesOriginPattern(origin, pattern));
}

const app = express();

app.set("trust proxy", 1);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = isAllowedOrigin(origin);
    if (!isAllowed && process.env.NODE_ENV === "production") {
      return callback(new Error("Not allowed by CORS"));
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is Live!");
});

export default app;
