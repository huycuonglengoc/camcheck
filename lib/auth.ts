import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "camcheck-dev-secret-change-in-production"
);

const COOKIE_NAME = "camcheck_admin_token";

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET);
}

export async function verifyToken(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function validateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";
  return username === adminUser && password === adminPass;
}

export { COOKIE_NAME };
