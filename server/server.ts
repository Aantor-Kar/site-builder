import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors'; 
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from './routes/userRoutes'
import projectRouter from './routes/projectRoutes'

const app = express();
const authHandler = toNodeHandler(auth);

function parseOrigins(raw: string | undefined) {
    return (raw ?? "")
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
}

function isDevLocalhostOrigin(origin: string) {
    return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin);
}

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Non-browser requests (curl, server-to-server) won't send Origin.
        if (!origin) return callback(null, true);

        const allowed = parseOrigins(process.env.TRUSTED_ORIGINS);
        const isExplicitAllow = allowed.includes(origin);
        const isWildcardLocalhostAllow =
            (allowed.includes("http://localhost:*") || allowed.includes("https://localhost:*") || allowed.includes("http://127.0.0.1:*") || allowed.includes("https://127.0.0.1:*")) &&
            isDevLocalhostOrigin(origin);

        return callback(null, isExplicitAllow || isWildcardLocalhostAllow);
    },
    credentials: true,
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json({limit: '50mb'}));

// Better Auth's handler can bypass/overwrite Express middleware headers in some setups.
// So we apply CORS headers explicitly for all `/api/auth/*` responses as well.
app.use("/api/auth", (req, res) => {
    const origin = req.headers.origin as string | undefined;
    const allowed = parseOrigins(process.env.TRUSTED_ORIGINS);
    const allowOrigin =
        !origin
            ? undefined
            : allowed.includes(origin) ||
              ((allowed.includes("http://localhost:*") ||
                  allowed.includes("https://localhost:*") ||
                  allowed.includes("http://127.0.0.1:*") ||
                  allowed.includes("https://127.0.0.1:*")) &&
                  isDevLocalhostOrigin(origin))
            ? origin
            : undefined;

    if (allowOrigin) {
        res.setHeader("Access-Control-Allow-Origin", allowOrigin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
        const reqHeaders = req.headers["access-control-request-headers"];
        if (reqHeaders) {
            res.setHeader("Access-Control-Allow-Headers", reqHeaders);
            res.setHeader("Vary", "Origin, Access-Control-Request-Headers");
        }
        return res.status(204).end();
    }

    return authHandler(req, res);
});

const port = process.env.PORT || 3000;
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);
app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});