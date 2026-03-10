import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import prisma from "./prisma.js";

const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // In current Better Auth versions, account deletion is configured under `user.deleteUser`.
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  trustedOrigins,
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  advanced: {
    cookies: {
      session_token: {
        name: "auth_session",
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
        },
      },
    },
  },
});
