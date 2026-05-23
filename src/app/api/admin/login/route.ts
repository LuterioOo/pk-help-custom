import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_NAME,
  createAdminToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { username, password } = schema.parse(await req.json());

    let valid = false;

    try {
      const user = await prisma.adminUser.findUnique({ where: { username } });
      if (user) valid = await verifyPassword(password, user.passwordHash);
    } catch {
      /* fallback env auth */
    }

    const adminUsername = process.env.ADMIN_USERNAME?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const allowEnvAuth =
      Boolean(adminUsername && adminPassword) ||
      process.env.NODE_ENV !== "production";

    if (
      !valid &&
      allowEnvAuth &&
      username === (adminUsername ?? "admin") &&
      password === (adminPassword ?? "admin")
    ) {
      valid = true;
      try {
        const existing = await prisma.adminUser.findUnique({ where: { username } });
        if (!existing) {
          await prisma.adminUser.create({
            data: {
              username,
              passwordHash: await hashPassword(password),
            },
          });
        }
      } catch {
        /* db optional */
      }
    }

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createAdminToken(username);
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
