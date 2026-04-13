import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
export async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH));
    return `${salt}:${derivedKey.toString("hex")}`;
}
export async function verifyPassword(password, storedPassword) {
    if (!storedPassword) {
        return false;
    }
    const [salt, storedHash] = storedPassword.split(":");
    if (!salt || !storedHash) {
        return false;
    }
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH));
    const storedHashBuffer = Buffer.from(storedHash, "hex");
    if (storedHashBuffer.length !== derivedKey.length) {
        return false;
    }
    return timingSafeEqual(storedHashBuffer, derivedKey);
}
