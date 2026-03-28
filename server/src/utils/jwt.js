import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

function requireSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment");
  }
  return JWT_SECRET;
}

export function verifyAccessToken(token) {
  const secret = requireSecret();
  return jwt.verify(token, secret, { algorithms: ["HS256"] });
}
