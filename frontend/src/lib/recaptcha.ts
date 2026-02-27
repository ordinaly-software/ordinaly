"use server";

export async function verifyRecaptchaToken(token: unknown): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
}> {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const isDev = process.env.NODE_ENV === "development";

  if (!recaptchaSecret || isDev) {
    // reCAPTCHA not configured or dev environment — skip verification
    return { ok: true };
  }

  if (typeof token !== "string" || !token.trim()) {
    // Client couldn't load reCAPTCHA script (e.g. domain not registered, ad blocker) — allow through
    return { ok: true };
  }

  try {
    const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: token,
      }),
    });
    const recaptchaResult = (await recaptchaResponse.json().catch(() => null)) as
      | { success?: boolean; score?: number }
      | null;
    if (!recaptchaResult?.success || (typeof recaptchaResult.score === "number" && recaptchaResult.score < 0.5)) {
      return { ok: false, status: 400, error: "reCAPTCHA failed" };
    }
  } catch {
    return { ok: false, status: 500, error: "reCAPTCHA verification service unavailable" };
  }

  return { ok: true };
}
