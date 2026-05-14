"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function ReviewActionForm({ observationId }: { observationId: string }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");

  async function submit(action: "verify" | "request_clarification" | "reject") {
    setStatus(t("reviewQueue.saving"));
    const response = await fetch("/api/review/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observationId, action, reason }),
    });
    const body = await response.json();
    setStatus(response.ok ? t("reviewQueue.saved") : body.error || t("reviewQueue.failed"));
  }

  return (
    <div className="mt-4 rounded-sm border border-stone-200 bg-white p-3">
      <label
        className="text-forest-600 text-xs font-semibold tracking-[0.08em] uppercase"
        htmlFor={`reason-${observationId}`}
      >
        {t("reviewQueue.reasonLabel")}
      </label>
      <textarea
        className="mt-2 min-h-20 w-full resize-none rounded-sm border border-stone-300 p-3 text-sm outline-none focus:border-olive-700"
        id={`reason-${observationId}`}
        onChange={(event) => setReason(event.target.value)}
        value={reason}
      />
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <button
          className="bg-forest-900 rounded-sm px-3 py-2 text-sm font-semibold text-white"
          onClick={() => submit("verify")}
          type="button"
        >
          {t("reviewQueue.verify")}
        </button>
        <button
          className="text-forest-900 rounded-sm border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-semibold"
          onClick={() => submit("request_clarification")}
          type="button"
        >
          {t("reviewQueue.clarify")}
        </button>
        <button
          className="border-rare-red/40 bg-rare-red/10 text-forest-900 rounded-sm border px-3 py-2 text-sm font-semibold"
          onClick={() => submit("reject")}
          type="button"
        >
          {t("reviewQueue.reject")}
        </button>
      </div>
      {status ? <p className="text-forest-700 mt-3 text-sm">{status}</p> : null}
    </div>
  );
}
