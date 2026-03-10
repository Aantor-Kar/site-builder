import { auth } from "../lib/auth";
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";

interface AuthRequest extends Request {
  userId?: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    req.userId = session.user.id;

    next();
  } catch (error: any) {
    console.log(error);
    res.status(401).json({ message: error.code || error.message });
  }
};