"use server";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const requestBody = body as Record<string, unknown>;
  const allowedKeys = ["name", "email", "phone", "company", "details"] as const;
  const lead: Record<string, string> = {};

  for (const key of allowedKeys) {
    const value = requestBody[key];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 });
    }
    lead[key] = value.trim();
  }

  const isValidEmail = (email: string) => {
    if (email.length > 254 || email.includes(" ")) return false;
    const atIndex = email.indexOf("@");
    if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;
    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (!local || !domain || domain.startsWith(".") || domain.endsWith(".")) {
      return false;
    }
    const domainLabels = domain.split(".");
    if (domainLabels.length < 2) return false;
    return domainLabels.every((label) => label.length > 0);
  };

  if (lead.email && !isValidEmail(lead.email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-token": process.env.N8N_WEBHOOK_TOKEN!,
    },
    body: JSON.stringify(lead),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
