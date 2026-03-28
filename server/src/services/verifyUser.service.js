import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import axios from "axios";
import https from "https";
import jwt from "jsonwebtoken";

function parseYear(value) {
  if (value == null) return new Date().getFullYear();
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const s = String(value);
  const n = parseInt(s.slice(0, 4), 10);
  return Number.isNaN(n) ? new Date().getFullYear() : n;
}

/** Avatar URL from name (first initial) via https://ui-avatars.com */
function avatarUrlFromName(name) {
  const display = (name && String(name).trim()) || "?";
  const params = new URLSearchParams({
    name: display,
    size: "128",
    background: "random",
    color: "fff",
    bold: "true",
    format: "png",
    length: "1",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

export const verifyUser = async ({ scholar, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { scholar_no: scholar },
  });

  if (!existingUser) {
    // MANIT ERP often serves a chain Node cannot verify; skip verify only for this call.
    const skipTlsVerify =
      process.env.NODE_ENV !== "production" ||
      process.env.ERP_TLS_SKIP_VERIFY === "1";

    const httpsAgent = skipTlsVerify
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

    const { data } = await axios.post(
      "https://erpapi.manit.ac.in/api/login",
      { username: scholar, password },
      { httpsAgent }
    );

    const student = data?.userInfo?.studentInfo?.[0];
    if (!student) {
      throw new Error("Invalid credentials");
    }

    const displayName = student.full_name ?? "Student";
    const imageUrl =
      (typeof student.photo_url === "string" && student.photo_url.trim()) ||
      avatarUrlFromName(displayName);

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        scholar_no: scholar,
        name: displayName,
        department: student.program_name ?? "",
        year: parseYear(student.start_session),
        gender: student.gender ?? "",
        image: imageUrl,
        password: hashedPassword,
      },
    });

    const { password: __, ...safeUser } = created;
    const token = jwt.sign(
      { sub: created.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
    );
    return { user: safeUser, token };
  }

  const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid password");
  }

  const { password: _, ...safeUser } = existingUser;
  if (!safeUser.image) {
    safeUser.image = avatarUrlFromName(safeUser.name);
  }
  const token = jwt.sign(
    { sub: existingUser.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d", algorithm: "HS256" }
  );
  return { user: safeUser, token };
};
