import axios from 'axios';

function normalizeApiBaseURL(raw: string | undefined) {
    const baseURL = (raw ?? "").trim().replace(/\/+$/, "");

    if (baseURL) {
        return baseURL;
    }

    if (typeof window === "undefined") {
        return "http://localhost:3000";
    }

    const { protocol, hostname, origin } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${protocol}//${hostname}:3000`;
    }

    return origin;
}

const api = axios.create({
    baseURL: normalizeApiBaseURL(import.meta.env.VITE_BASEURL),
    withCredentials: true
})

export default api;
