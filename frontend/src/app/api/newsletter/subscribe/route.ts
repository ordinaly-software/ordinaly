import { NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, website, recaptchaToken } = body as Record<string, unknown>;
  if (typeof email !== "string" || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const recaptchaCheck = await verifyRecaptchaToken(recaptchaToken, ["newsletter_banner"]);
  if (!recaptchaCheck.ok) {
    return NextResponse.json({ error: recaptchaCheck.error }, { status: recaptchaCheck.status ?? 400 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    console.error("[newsletter route] NEXT_PUBLIC_API_URL is not configured");
    return NextResponse.json({ error: "API URL is not configured" }, { status: 500 });
  }

  const url = `${apiBaseUrl}/api/newsletter/subscribe/`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, website: typeof website === "string" ? website : "" }),
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error(`[newsletter route] Failed to reach backend at ${url}:`, err);
    return NextResponse.json({ error: "Could not reach the backend." }, { status: 502 });
  }
}
