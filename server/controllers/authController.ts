import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import {
  clearSessionCookie,
  createSession,
  getSessionFromRequest,
  getSessionTokenFromRequest,
  revokeSession,
  setSessionCookie,
} from "../lib/session.js";
import { hashPassword, verifyPassword } from "../lib/password.js";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  image: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}

async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });
}

export const getSession = async (req: Request, res: Response) => {
  try {
    const session = await getSessionFromRequest(req);

    if (!session) {
      clearSessionCookie(res);
      return res.json({ session: null });
    }

    return res.json({
      session: {
        user: sanitizeUser(session.user),
      },
    });
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: "Unable to fetch session" });
  }
};

export const signUp = async (req: Request, res: Response) => {
  try {
    const name = req.body?.name?.trim();
    const rawEmail = req.body?.email;
    const password = req.body?.password;

    if (!name || !rawEmail || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const email = normalizeEmail(rawEmail);
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
      },
    });

    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: email,
        providerId: "credentials",
        userId: user.id,
        password: await hashPassword(password),
      },
    });

    const session = await createSession({
      userId: user.id,
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    setSessionCookie(res, session.token, session.expiresAt);

    return res.status(201).json({
      message: "Account created successfully",
      session: {
        user: sanitizeUser(user),
      },
    });
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: "Unable to create account" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const rawEmail = req.body?.email;
    const password = req.body?.password;

    if (!rawEmail || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const email = normalizeEmail(rawEmail);
    const account = await prisma.account.findFirst({
      where: {
        providerId: "credentials",
        user: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      },
      include: {
        user: true,
      },
    });

    if (!account || !(await verifyPassword(password, account.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const previousToken = getSessionTokenFromRequest(req);
    await revokeSession(previousToken);

    const session = await createSession({
      userId: account.userId,
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    setSessionCookie(res, session.token, session.expiresAt);

    return res.json({
      message: "Signed in successfully",
      session: {
        user: sanitizeUser(account.user),
      },
    });
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: "Unable to sign in" });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    const token = getSessionTokenFromRequest(req);
    await revokeSession(token);
    clearSessionCookie(res);

    return res.json({ message: "Signed out successfully" });
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: "Unable to sign out" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const name = req.body?.name?.trim();
    const rawEmail = req.body?.email?.trim();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name || !rawEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const email = normalizeEmail(rawEmail);
    const existingUser = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
    });

    await prisma.account.updateMany({
      where: {
        userId,
        providerId: "credentials",
      },
      data: {
        accountId: email,
      },
    });

    return res.json({
      message: "Profile updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: "Unable to update profile" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const currentPassword = req.body?.currentPassword;
    const newPassword = req.body?.newPassword;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long" });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "credentials",
      },
    });

    if (!account || !(await verifyPassword(currentPassword, account.password))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    await prisma.account.update({
      where: { id: account.id },
      data: {
        password: await hashPassword(newPassword),
      },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: "Unable to change password" });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const password = req.body?.password;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to delete your account" });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "credentials",
      },
    });

    if (!account || !(await verifyPassword(password, account.password))) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.websiteProject.deleteMany({
        where: { userId },
      });
      await tx.transaction.deleteMany({
        where: { userId },
      });
      await tx.session.deleteMany({
        where: { userId },
      });
      await tx.account.deleteMany({
        where: { userId },
      });
      await tx.user.delete({
        where: { id: userId },
      });
    });

    clearSessionCookie(res);

    return res.json({ message: "Account deleted successfully" });
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: "Unable to delete account" });
  }
};
