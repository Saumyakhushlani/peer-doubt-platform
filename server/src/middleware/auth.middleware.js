import { verifyAccessToken } from "../utils/jwt.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = verifyAccessToken(token);
    const userId = payload.sub;
    if (!userId || typeof userId !== "string") {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
