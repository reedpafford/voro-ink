export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { z } from "zod";
import { autoReply, notifyOwner } from "@/lib/email";
import { signIntakeToken } from "@/lib/token";

// ---- minimal rate limit (per Vercel instance) ----
const hits = new Map<string, { n: number; t: number }>(); // ip -> {count, since}
function allow(ip: string) {
  const now = Date.now();
  const WINDOW_MS = 60_000; // 1 minute
  const MAX_REQS = 12;      // 12 req/min
  const cur = hits.get(ip);
  if (!cur || now - cur.t > WINDOW_MS) {
    hits.set(ip, { n: 1, t: now });
    return true;
  }
  if (cur.n >= MAX_REQS) return false;
  cur.n++;
  return true;
}
// ---------------------------------------------------

const Body = z.object({
  email: z.string().email(),
  hp: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, hp } = Body.parse(body);

    // bot honeypot: ignore but report success
    if (hp && hp.trim() !== "") return NextResponse.json({ ok: true });

    // basic per-IP throttle
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
      "unknown";
    if (!allow(ip)) return NextResponse.json({ ok: true });

    const token = await signIntakeToken({ email });

    // Build correct site origin from the incoming request
    const origin = new URL(req.url).origin;

    // Send mailbox notification + auto-reply with brief link (in parallel)
    await Promise.all([notifyOwner(email), autoReply(email, token, origin)]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("inquiry POST error:", e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
