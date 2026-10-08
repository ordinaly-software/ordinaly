"use server";

import { NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

const LEAD_RECAPTCHA_ACTIONS = [
  "contact_form",
  "home_contact_form",
  "faq_contact_form",
  "contact_page_form",
  "blog_contact_form",
] as const;

const MAX_LENGTHS = { name: 100, email: 254, phone: 20, company: 150, details: 5000, page: 500 } as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const requestBody = body as Record<string, unknown>;

  // Honeypot: real users never see this field. Answer as if it worked so bots don't adapt.
  if (typeof requestBody.website === "string" && requestBody.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (requestBody.privacyAccepted !== "true") {
    return NextResponse.json({ error: "Privacy policy must be accepted" }, { status: 400 });
  }

  const recaptchaCheck = await verifyRecaptchaToken(requestBody.recaptchaToken, LEAD_RECAPTCHA_ACTIONS);
  if (!recaptchaCheck.ok) {
    return NextResponse.json({ error: recaptchaCheck.error }, { status: recaptchaCheck.status ?? 400 });
  }

  const allowedKeys = ["name", "email", "phone", "company", "details", "page"] as const;
  const lead: Record<string, string> = {};

  for (const key of allowedKeys) {
    const value = requestBody[key];
    if (value === undefined || value === null || value === "") continue;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 });
    }
    if (value.length > MAX_LENGTHS[key]) {
      return NextResponse.json({ error: `${key} is too long` }, { status: 400 });
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

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookToken = process.env.N8N_WEBHOOK_TOKEN;
  if (!webhookUrl || !webhookToken) {
    console.error("[leads route] N8N_WEBHOOK_URL / N8N_WEBHOOK_TOKEN are not configured");
    return NextResponse.json({ error: "Lead service is not configured" }, { status: 503 });
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-token": webhookToken,
    },
    body: JSON.stringify(lead),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
