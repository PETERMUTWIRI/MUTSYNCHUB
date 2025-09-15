"use client";

import { useState } from "react";
import { createDataSource } from "@/app/actions/data-source";
import { useRouter } from "next/navigation";

export function FileForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<"upload" | "s3" | "local">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [bucket, setBucket] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (provider === "upload" && !file) return alert("Please pick a CSV file");
    setLoading(true);

    let config: any = { provider };
    if (provider === "upload") {
      // convert file to base64 string (small CSV < 2 MB)
      const buffer = await file!.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      config.fileName = file!.name;
      config.csvBase64 = base64;
    } else if (provider === "s3") {
      config = { provider, bucket, region, accessKey, secretKey };
    } else {
      config = { provider, path: "C:\\POS\\DailySales" }; // local folder watch
    }

    const ok = await createDataSource({ type: "FILE_IMPORT", name, config });
    setLoading(false);
    if (ok) {
      onSuccess();
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input required placeholder="Connection name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />

      <select value={provider} onChange={(e) => setProvider(e.target.value as any)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
        <option value="upload">Upload CSV file</option>
        <option value="local">Watch local folder</option>
        <option value="s3">Amazon S3 (or compatible)</option>
      </select>

      {provider === "upload" && (
        <div>
          {/* hidden file picker restricted to .csv */}
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="csv-file"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2 text-sm font-medium"
          >
            📁 Choose CSV file
          </label>
          {file && <p className="text-sm text-gray-300 mt-1">Selected: {file.name}</p>}
        </div>
      )}

      {provider === "local" && (
        <input required placeholder="C:\\POS\\DailySales" value="C:\\POS\\DailySales" readOnly className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      )}

      {provider === "s3" && (
        <>
          <input required placeholder="Bucket name" value={bucket} onChange={(e) => setBucket(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <input required placeholder="Region" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <input required placeholder="Access Key" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
          <input required type="password" placeholder="Secret Key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </>
      )}

      <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#2E7D7D] hover:bg-teal-600 disabled:opacity-50 px-4 py-2 font-medium">
        {loading ? "Saving…" : "Save connection"}
      </button>
    </form>
  );
}
