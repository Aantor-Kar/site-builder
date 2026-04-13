import { clearSessionCookie, getSessionFromRequest } from "../lib/session.js";
export const protect = async (req, res, next) => {
    try {
        const session = await getSessionFromRequest(req);
        if (!session?.user) {
            clearSessionCookie(res);
            return res.status(401).json({ message: "Unauthorized User" });
        }
        req.userId = session.user.id;
        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
        };
        next();
    }
    catch (error) {
        console.log(error.code || error.message);
        clearSessionCookie(res);
        return res.status(401).json({ message: "Unauthorized User" });
    }
};
