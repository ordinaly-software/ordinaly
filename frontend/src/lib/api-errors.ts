// The backend always answers in English (internal convention). Whenever the UI shows a
// message that came from the API, run it through localizeApiError so users see it in their
// language. Unknown messages are returned untouched.

type Translate = (key: string, values?: Record<string, string | number>) => string;

// English backend message (lower-cased) -> key in the "apiErrors" namespace of messages/*.json.
const KNOWN_MESSAGES: Record<string, string> = {
  "invalid code": "invalidCode",
  "incorrect code": "incorrectCode",
  "the code has expired": "codeExpired",
  "too many attempts": "tooManyAttempts",
  "account already verified": "accountAlreadyVerified",
  "your account is not verified yet.": "accountNotVerified",
  "this email is already in use": "emailInUse",
  "if the account exists, a new code will be sent": "resendGeneric",
  "if the account exists, a new code has been sent": "resendGeneric",
  "if the account exists, an email has been sent": "emailGeneric",
  "email verified successfully": "emailVerified",
  "email updated. check your inbox for the new code.": "emailUpdated",
  "email sent": "emailSent",
  "could not send the verification email": "verificationEmailFailed",
  "could not send the confirmation email": "confirmationEmailFailed",
  "email and password are required": "emailPasswordRequired",
  "email/username and password are required": "emailPasswordRequired",
  "invalid credentials": "invalidCredentials",
  "token required": "tokenRequired",
  "invalid token": "invalidToken",
  "token expired": "tokenExpired",
  "token and new password are required": "tokenPasswordRequired",
  "password must be at least 8 characters long": "passwordTooShort",
  "password updated successfully": "passwordUpdated",
  "account deleted": "accountDeleted",
  "you cannot cancel the enrollment because the course has already ended.": "cancelCourseEnded",
  "you cannot cancel the enrollment because the course has already started.": "cancelCourseStarted",
  "you cannot cancel the enrollment within the 24 hours before the course starts.": "cancelWithin24h",
  "invalid url: only http, https or internal paths are allowed.": "invalidUrl",
};

const COOLDOWN_PATTERN = /^you must wait (\d+) seconds before resending the code$/i;

export function localizeApiError(message: unknown, t: Translate): string {
  if (typeof message !== "string") return "";
  const normalized = message.trim().toLowerCase();

  const key = KNOWN_MESSAGES[normalized];
  if (key) return t(key);

  const cooldown = normalized.match(COOLDOWN_PATTERN);
  if (cooldown) return t("resendCooldown", { seconds: Number(cooldown[1]) });

  return message;
}
