import { cookies } from "next/headers";
import { signSessionToken, verifySessionToken } from "./jwt";

export async function encrypt(payload: Record<string, unknown>) {
  return signSessionToken(payload, "7d");
}

export async function decrypt(session: string | undefined = "") {
  if (!session) return null;
  return verifySessionToken(session);
}

export async function createSession(userId: string, role: string, email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, email, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  const payload = await decrypt(session);
  if (!payload) return null;
  return payload as { userId: string; role: string; email: string; name?: string };
}
