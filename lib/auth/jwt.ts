import { type JWTPayload, jwtVerify, SignJWT } from "jose";
import { env } from "@/env";

const encodedKey = new TextEncoder().encode(env.SESSION_SECRET);

export const SESSION_COOKIE_NAME = "session";

export type SessionPayload = {
  userId: string;
};

export function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    if (typeof payload.userId !== "string") {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}
