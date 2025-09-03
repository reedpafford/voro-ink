import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.TOKEN_SECRET!);

type Payload = { email: string };
export async function signIntakeToken(payload: Payload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret);
}
export async function verifyIntakeToken(token: string): Promise<Payload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as Payload;
}
