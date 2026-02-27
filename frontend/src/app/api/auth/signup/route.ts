import { NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

const ALLOWED_FIELDS = [
  "name",
  "surname",
  "username",
  "email",
  "company",
  "region",
  "city",
  "password",
  "allow_notifications",
] as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const requestBody = body as Record<string, unknown>;
  const recaptchaCheck = await verifyRecaptchaToken(requestBody.recaptchaToken);
  if (!recaptchaCheck.ok) {
    return NextResponse.json({ error: recaptchaCheck.error }, { status: recaptchaCheck.status });
  }

  const payload: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    const value = requestBody[key];
    if (value === undefined) continue;
    payload[key] = value;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    console.error("[signup route] NEXT_PUBLIC_API_URL is not configured");
    return NextResponse.json({ error: "API URL is not configured" }, { status: 500 });
  }

  const url = `${apiBaseUrl}/api/users/signup/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error(`[signup route] Failed to reach backend at ${url}:`, err);
    return NextResponse.json(
      { error: "Could not reach the backend. Please check that the server is running." },
      { status: 502 },
    );
  }
}
