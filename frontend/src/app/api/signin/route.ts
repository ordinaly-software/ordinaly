import { NextResponse } from "next/server";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

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

  const emailOrUsername = requestBody.emailOrUsername;
  const password = requestBody.password;
  if (typeof emailOrUsername !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    console.error("[signin route] NEXT_PUBLIC_API_URL is not configured");
    return NextResponse.json({ error: "API URL is not configured" }, { status: 500 });
  }

  const url = `${apiBaseUrl}/api/users/signin/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrUsername,
        password,
      }),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error(`[signin route] Failed to reach backend at ${url}:`, err);
    return NextResponse.json(
      { error: "Could not reach the backend. Please check that the server is running." },
      { status: 502 },
    );
  }
}
