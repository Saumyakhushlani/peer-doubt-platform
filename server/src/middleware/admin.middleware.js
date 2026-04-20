import { verifyAccessToken } from "../utils/jwt.js";

export function authenticateAdmin(req, res, next) {
  const header = req.headers.authorization;
  const token =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7).trim()
      : null;

  if (!token) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.admin = { role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
}
