import { SignJWT, jwtVerify } from "jose";

const DEFAULT_DEV_SECRET = "super_secret_key_for_geraibumdes_development";

export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION: JWT_SECRET environment variable is missing in production. " +
        "Define JWT_SECRET with at least 32 random characters."
      );
    }
    return new TextEncoder().encode(DEFAULT_DEV_SECRET);
  }

  return new TextEncoder().encode(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const key = getJwtSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as { userId: string; role: string; email: string; name?: string };
  } catch {
    return null;
  }
}

export async function signSessionToken(payload: Record<string, unknown>, expiresIn: string = "7d") {
  const key = getJwtSecretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}
