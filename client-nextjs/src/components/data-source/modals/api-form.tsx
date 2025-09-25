"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDataSourceAPI } from "@/lib/data-source-client";
import toast from "react-hot-toast";

export function ApiForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    const tick = setInterval(() => setProgress((p) => (p >= 90 ? 90 : p + 10)), 150);
    try {
      await createDataSourceAPI({ type: "API", name, config: { endpoint, apiKey: key } });
      clearInterval(tick);
      setProgress(100);
      toast.success("API connection saved");
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
      <input required placeholder="https://api.example.com" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      <input required placeholder="API Key" value={key} onChange={(e) => setKey(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />

      {loading && (
        <div className="w-full bg-black/40 rounded h-2 overflow-hidden">
          <div className="bg-teal-400 h-2 transition-all duration-150" style={{ width: `${progress}%` }} />
          <p className="text-xs text-gray-300 mt-1">{progress}%</p>
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#2E7D7D] hover:bg-teal-600 disabled:opacity-50 px-4 py-2 font-medium">
        {loading ? "Testing & saving…" : "Save connection"}
      </button>
    </form>
  );
}