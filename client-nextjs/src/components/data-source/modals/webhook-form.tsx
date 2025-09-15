"use client";

import { useState } from "react";
import { createDataSource } from "@/app/actions/data-source";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";

export function WebhookForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const webhookPath = uuid(); // random path

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await createDataSource({
      type: "API",
      name,
      config: { webhook: true, path: webhookPath },
    });
    setLoading(false);
    if (ok) {
      onSuccess();
      router.refresh();
    }
  }

  const fullUrl = `${window?.location?.origin}/api/webhook/${webhookPath}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input required placeholder="Connection name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      <div className="rounded-lg bg-black/60 p-3 break-all text-sm text-gray-300">
        POST to: <span className="text-teal-300">{fullUrl}</span>
      </div>
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#2E7D7D] hover:bg-teal-600 disabled:opacity-50 px-4 py-2 font-medium">
        {loading ? "Creating inbox…" : "Create webhook inbox"}
      </button>
    </form>
  );
}
