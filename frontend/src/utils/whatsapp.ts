export function getWhatsAppUrl(message: string, phoneNumber?: string) {
  const rawNumber = phoneNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
  if (!rawNumber) return null;

  const digits = rawNumber.replace(/[^\d]/g, "");
  const normalizedDigits = digits.replace(/^0+/, "");
  if (!normalizedDigits) return null;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedDigits}?text=${encodedMessage}`;
}
