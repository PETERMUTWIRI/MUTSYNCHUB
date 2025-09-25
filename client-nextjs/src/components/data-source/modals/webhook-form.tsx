"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { createDataSourceAPI } from "@/lib/data-source-client";
import toast from "react-hot-toast";

export function WebhookForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const webhookPath = uuid();
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/api/webhook/${webhookPath}` : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setProgress(0);
    const tick = setInterval(() => setProgress((p) => (p >= 90 ? 90 : p + 10)), 150);
    try {
      await createDataSourceAPI({ type: "API", name, config: { webhook: true, path: webhookPath } });
      clearInterval(tick);
      setProgress(100);
      toast.success("Webhook inbox created");
      onSuccess();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input required placeholder="Connection name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      <div className="rounded-lg bg-black/60 p-3 break-all text-sm text-gray-300">
        POST to: <span className="text-teal-300">{fullUrl}</span>
      </div>

      {loading && (
        <div className="w-full bg-black/40 rounded h-2 overflow-hidden">
          <div className="bg-teal-400 h-2 transition-all duration-150" style={{ width: `${progress}%` }} />
          <p className="text-xs text-gray-300 mt-1">{progress}%</p>
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#2E7D7D] hover:bg-teal-600 disabled:opacity-50 px-4 py-2 font-medium">
        {loading ? "Creating inbox…" : "Create webhook inbox"}
      </button>
    </form>
  );
}