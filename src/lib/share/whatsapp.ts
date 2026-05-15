export type WhatsAppShareKind = "patrol_plan" | "alert" | "review_request" | "report_summary";

export function buildWhatsAppShareText(kind: WhatsAppShareKind, body: string) {
  const labels: Record<WhatsAppShareKind, string> = {
    patrol_plan: "NaLI patrol plan",
    alert: "NaLI field alert",
    review_request: "NaLI review request",
    report_summary: "NaLI conservation report",
  };

  return `${labels[kind]}\n\n${body}`.trim();
}

export function buildWhatsAppShareUrl(kind: WhatsAppShareKind, body: string, preferApp = false) {
  const text = encodeURIComponent(buildWhatsAppShareText(kind, body));
  return preferApp ? `whatsapp://send?text=${text}` : `https://wa.me/?text=${text}`;
}
