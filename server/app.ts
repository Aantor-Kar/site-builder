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
  if (origin === pattern) {
    return true;
  }

  if (!pattern.includes("*")) {
    return false;
  }

  const regex = new RegExp(
    `^${escapeRegex(pattern).replace(/\\\*/g, ".*")}$`,
    "i",
  );

  return regex.test(origin);
}

function isAllowedOrigin(origin: string) {
  const allowedOrigins = parseOrigins(process.env.TRUSTED_ORIGINS);

  return allowedOrigins.some((pattern) => matchesOriginPattern(origin, pattern));
}

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      return callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  }),
);

app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is Live!");
});

export default app;
