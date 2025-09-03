import { NextResponse } from "next/server";
import { z } from "zod";
import { autoReply, notifyOwner } from "@/lib/email";
import { signIntakeToken } from "@/lib/token";

const Body = z.object({ email: z.string().email(), hp: z.string().optional() });

export async function POST(req: Request) {
  try {
    const { email, hp } = Body.parse(await req.json());
    if (hp && hp.trim() !== "") return NextResponse.json({ ok: true }); // honeypot
    const token = await signIntakeToken({ email });
    await Promise.all([notifyOwner(email), autoReply(email, token)]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
