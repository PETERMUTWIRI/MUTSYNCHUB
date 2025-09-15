"use client";

import { useState } from "react";
import { createDataSource } from "@/app/actions/data-source";
import { useRouter } from "next/navigation";

export function ApiForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await createDataSource({
      type: "API",
      name,
      config: { endpoint, apiKey: key },
    });
    setLoading(false);
    if (ok) {
      onSuccess();
      router.refresh(); // revalidate server component
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        required
        placeholder="Connection name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <input
        required
        placeholder="https://api.example.com"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <input
        required
        placeholder="API Key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#2E7D7D] hover:bg-teal-600 disabled:opacity-50 px-4 py-2 font-medium"
      >
        {loading ? "Testing & saving…" : "Save connection"}
      </button>
    </form>
  );
}
