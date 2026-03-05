export const EMAIL_RESEND_COOLDOWN_SECONDS = 120;
export const VERIFY_EMAIL_COOLDOWN_KEY = "verify_email_last_sent_at";
export const DELETE_ACCOUNT_COOLDOWN_KEY = "delete_account_email_last_sent_at";

export function getEmailCooldownRemaining(
  storageKey: string,
  cooldownSeconds = EMAIL_RESEND_COOLDOWN_SECONDS
) {
  if (typeof window === "undefined") {
    return 0;
  }

  const storedValue = window.localStorage.getItem(storageKey);
  if (!storedValue) {
    return 0;
  }

  const sentAt = Number(storedValue);
  if (!Number.isFinite(sentAt) || sentAt <= 0) {
    window.localStorage.removeItem(storageKey);
    return 0;
  }

  const elapsedSeconds = (Date.now() - sentAt) / 1000;
  const remainingSeconds = Math.ceil(cooldownSeconds - elapsedSeconds);

  if (remainingSeconds <= 0) {
    window.localStorage.removeItem(storageKey);
    return 0;
  }

  return remainingSeconds;
}

export function setEmailCooldown(
  storageKey: string,
  remainingSeconds = EMAIL_RESEND_COOLDOWN_SECONDS,
  cooldownSeconds = EMAIL_RESEND_COOLDOWN_SECONDS
) {
  if (typeof window === "undefined") {
    return;
  }

  const clampedRemaining = Math.max(
    0,
    Math.min(remainingSeconds, cooldownSeconds)
  );

  if (clampedRemaining === 0) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  const elapsedSeconds = cooldownSeconds - clampedRemaining;
  const sentAt = Date.now() - elapsedSeconds * 1000;
  window.localStorage.setItem(storageKey, String(sentAt));
}

export function clearEmailCooldown(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}

export function parseCooldownSeconds(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.ceil(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.toLowerCase();
  const match = normalizedValue.match(
    /(\d+)\s*(?:s|sec|secs|second|seconds|segundo|segundos)\b/
  );
  if (!match) {
    return null;
  }

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}
