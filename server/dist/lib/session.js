import { randomBytes, randomUUID } from "crypto";
import prisma from "./prisma.js";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_COOKIE_NAME = "auth_session";
function getBaseCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? "none" : "lax"),
        path: "/",
    };
}
export function getSessionTokenFromRequest(req) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return null;
    }
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    for (const cookie of cookies) {
        if (!cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
            continue;
        }
        return decodeURIComponent(cookie.slice(SESSION_COOKIE_NAME.length + 1));
    }
    return null;
}
export async function createSession(input) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await prisma.session.create({
        data: {
            id: randomUUID(),
            token,
            expiresAt,
            userId: input.userId,
            ipAddress: input.ipAddress ?? null,
            userAgent: input.userAgent ?? null,
        },
    });
    return session;
}
export async function getSessionFromRequest(req) {
    const token = getSessionTokenFromRequest(req);
    if (!token) {
        return null;
    }
    const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
    });
    if (!session) {
        return null;
    }
    if (session.expiresAt <= new Date()) {
        await prisma.session.delete({ where: { token } }).catch(() => null);
        return null;
    }
    return session;
}
export function setSessionCookie(res, token, expiresAt) {
    res.cookie(SESSION_COOKIE_NAME, token, {
        ...getBaseCookieOptions(),
        expires: expiresAt,
    });
}
export function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE_NAME, getBaseCookieOptions());
}
export async function revokeSession(token) {
    if (!token) {
        return;
    }
    await prisma.session.delete({ where: { token } }).catch(() => null);
}
