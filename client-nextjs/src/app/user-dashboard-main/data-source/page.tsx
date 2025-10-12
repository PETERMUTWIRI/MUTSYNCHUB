"use client";

import { useEffect, useState } from "react";
import { ConnectionCards } from "@/components/data-source/connections";
import { PosCard }          from "@/components/data-source/pos-card";
import { TransferHistory }  from "@/components/data-source/history";
import { LiveIndicator }    from "@/components/data-source/live-indicator";
import { io, Socket }       from "socket.io-client";

/* ----------  helpers  ---------- */
async function getOrgProfile() {
  const res = await fetch('/api/org-profile');
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

async function createDataSource(orgId: string, type: string, config = {}) {
  const res = await fetch("/api/v1/datasources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, sourceId: `${orgId}-${type}`, type, config }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ----------  main page  ---------- */
export default function DataSourcesPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [live, setLive]     = useState(false);
  const [orgId, setOrgId]   = useState("");
  const [source, setSource] = useState<any>(null);

  useEffect(() => {
  getOrgProfile()
    .then(async (u) => {
      setOrgId(u.orgId);
      const info = await createDataSource(u.orgId, "supermarket");
      setSource(info);
    })
    .catch(() => console.error("No org profile"));

  const token = document.cookie.match(/stack-session=([^;]+)/)?.[1] || "";
  const s = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`, {
    auth: { token },
    query: { orgId },
  });
  s.on("connect", () => setLive(true));
  s.on("disconnect", () => setLive(false));
  setSocket(s);

  return () => {
    s.close();          // 🔥  call, don’t return socket
  };
  }, [orgId]);

  return (
    <div className="min-h-screen bg-[#1E2A44] text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <p className="text-sm text-gray-300">Connect anything – APIs, databases, files or our POS plug-in.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ConnectionCards />
      </section>

      {/*  NEW – real source info  */}
      {source && (
        <section className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Connected source</h3>
          <p className="text-sm text-gray-300">
            Industry: <span className="text-teal-400">{source.industry}</span> |
            Confidence: <span className="text-teal-400">{(source.confidence * 100).toFixed(0)} %</span> |
            Status: <span className="text-green-400">{source.status}</span>
          </p>

          {source.recentRows.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">Waiting for first transactions…</p>
          ) : (
            <div className="mt-2 text-xs">
              <p className="text-gray-400">Last 3 rows:</p>
              <pre className="bg-black/30 p-2 rounded overflow-auto">{JSON.stringify(source.recentRows, null, 2)}</pre>
            </div>
          )}
        </section>
      )}

      <section className="mt-10"><PosCard /></section>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Real-time activity</h2>
          <LiveIndicator live={live} />
        </div>
        <TransferHistory socket={socket} />
      </section>
    </div>
  );
}