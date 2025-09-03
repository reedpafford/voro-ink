export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { autoReply, notifyOwner } from "@/lib/email";
import { signIntakeToken } from "@/lib/token";

const Body = z.object({
  email: z.string().email(),
  hp: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, hp } = Body.parse(body);

    // Simple bot trap
    if (hp && hp.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    // Create a signed token for the intake link
    const token = await signIntakeToken({ email });

    // Build the correct origin from the incoming request
    // e.g. https://voro-ink.vercel.app or https://voro.ink
    const origin = new URL(req.url).origin;

    // Fire emails in parallel
    await Promise.all([
      notifyOwner(email),
      autoReply(email, token, origin),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
