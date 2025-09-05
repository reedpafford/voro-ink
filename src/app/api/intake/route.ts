export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyIntakeToken } from "@/lib/token";
import { sendIntakeToOwner } from "@/lib/email";

const Body = z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  goals: z.string().optional(),
  details: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const data = Body.parse(await req.json());

    // Resolve submitter email (token wins if present)
    let resolvedEmail = data.email || "";
    if (data.token) {
      const { email } = await verifyIntakeToken(data.token);
      resolvedEmail = email;
    }
    if (!resolvedEmail) {
      return NextResponse.json(
        { ok: false, error: "Missing email.", code: "missing_email" },
        { status: 400 }
      );
    }

    // Build intake object and send
    const intake = {
      email: resolvedEmail,
      fullName: data.fullName,
      company: data.company,
      website: data.website,
      budget: data.budget,
      timeline: data.timeline,
      goals: data.goals,
      details: data.details,
      ua: req.headers.get("user-agent") || "",
    };

    await sendIntakeToOwner(intake); // supports 1-arg form

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("intake POST error:", e?.code, e?.message);
    return NextResponse.json(
      { ok: false, error: "Server error.", code: "server_error" },
      { status: 500 }
    );
  }
}


