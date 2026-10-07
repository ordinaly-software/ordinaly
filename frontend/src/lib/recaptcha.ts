"use server";

type RecaptchaSiteVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  "error-codes"?: string[];
};

const MIN_SCORE = (() => {
  const raw = Number(process.env.RECAPTCHA_MIN_SCORE);
  return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : 0.5;
})();

export async function verifyRecaptchaToken(
  token: unknown,
  allowedActions?: readonly string[],
): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
}> {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const isDev = process.env.NODE_ENV === "development";

  if (!recaptchaSecret) {
    // Only local development may skip verification; anywhere else a missing
    // secret must not leave the forms unprotected.
    if (isDev) {
      console.warn("[recaptcha] RECAPTCHA_SECRET_KEY is not set — skipping verification in development.");
      return { ok: true };
    }
    console.error("[recaptcha] RECAPTCHA_SECRET_KEY is not set — rejecting request. Set it in the server runtime environment.");
    return { ok: false, status: 503, error: "reCAPTCHA is not configured" };
  }

  if (typeof token !== "string" || !token.trim()) {
    console.warn("[recaptcha] request arrived without a token");
    return { ok: false, status: 400, error: "Missing reCAPTCHA token" };
  }

  let result: RecaptchaSiteVerifyResponse | null = null;
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: recaptchaSecret, response: token }),
    });
    result = (await response.json().catch(() => null)) as RecaptchaSiteVerifyResponse | null;
    if (isDev) {
      console.info("[recaptcha] siteverify raw response:", result);
    }
  } catch (err) {
    console.error("[recaptcha] siteverify request failed:", err);
    // In dev, don't block local testing when Google is unreachable.
    if (isDev) return { ok: true };
    return { ok: false, status: 500, error: "reCAPTCHA verification service unavailable" };
  }

  const success = result?.success === true;
  const score = typeof result?.score === "number" ? result.score : undefined;
  const lowScore = typeof score === "number" && score < MIN_SCORE;
  // A token minted for another form (e.g. the login) must not be replayed here.
  const wrongAction = Boolean(allowedActions) && !allowedActions!.includes(result?.action ?? "");

  if (!success || lowScore || wrongAction) {
    console.warn("[recaptcha] verification rejected", {
      success,
      score,
      minScore: MIN_SCORE,
      wrongAction,
      action: result?.action,
      hostname: result?.hostname,
      errorCodes: result?.["error-codes"],
    });
    // Dev: log the reason but let the submission through so local work isn't blocked.
    if (isDev) return { ok: true };
    return { ok: false, status: 400, error: "reCAPTCHA failed" };
  }

  if (isDev) {
    console.info("[recaptcha] verification passed", { score, action: result?.action, hostname: result?.hostname });
  }
  return { ok: true };
}
