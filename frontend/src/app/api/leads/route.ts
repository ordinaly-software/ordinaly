import { NextResponse } from "next/server";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const CAPTCHA_FAILURE_MESSAGE = "Captcha verification failed";
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

async function verifyRecaptcha(token?: string | null): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    return true;
  }
  if (!token) {
    return false;
  }

  const payload = new URLSearchParams();
  payload.append("secret", RECAPTCHA_SECRET_KEY);
  payload.append("response", token);

  try {
    const verifyResponse = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
    });
    if (!verifyResponse.ok) {
      return false;
    }
    const data = await verifyResponse.json().catch(() => null);
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const requestBody = body as Record<string, unknown>;
  const captchaToken = typeof requestBody.captchaToken === "string" ? requestBody.captchaToken : null;
  if (!(await verifyRecaptcha(captchaToken))) {
    return NextResponse.json({ error: CAPTCHA_FAILURE_MESSAGE }, { status: 400 });
  }

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
