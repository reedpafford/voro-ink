import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyIntakeToken } from "@/lib/token";
import { sendIntakeToOwner } from "@/lib/email";

const Body = z.object({
  token: z.string(),
  company: z.string().optional(),
  website: z.string().url().optional(),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  goals: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const data = Body.parse(await req.json());
    const { email } = await verifyIntakeToken(data.token);
    await sendIntakeToOwner(email, {
      Company: data.company,
      Website: data.website,
      "Project Type": data.projectType,
      Budget: data.budget,
      Timeline: data.timeline,
      Goals: data.goals,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
