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

export async function verifyRecaptchaToken(token: unknown): Promise<{
  ok: boolean;
  status?: number;
  error?: string;
}> {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const isDev = process.env.NODE_ENV === "development";

  if (!recaptchaSecret) {
    // Fail open, but make it impossible to miss in logs — this is the #1 reason
    // "reCAPTCHA does nothing and shows no error" in a deployed environment.
    const message =
      "[recaptcha] RECAPTCHA_SECRET_KEY is not set — skipping verification. " +
      "Forms are NOT protected. Set it in the server runtime environment.";
    if (isDev) {
      console.warn(message);
    } else {
      console.error(message);
    }
    return { ok: true };
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

  if (!success || lowScore) {
    console.warn("[recaptcha] verification rejected", {
      success,
      score,
      minScore: MIN_SCORE,
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
