"use client";

import { useEffect, useState } from "react";
import { ConnectionCards } from "@/components/data-source/connections";
import { PosCard }          from "@/components/data-source/pos-card";
import { TransferHistory }  from "@/components/data-source/history";
import { LiveIndicator }    from "@/components/data-source/live-indicator";
import { io, Socket }       from "socket.io-client";

/* ----------  NEW: tiny helper to hit the working route  ---------- */
async function getOrgProfile() {
  const res = await fetch('/api/org-profile');
  if (!res.ok) throw new Error('Unauthorized');
  return res.json(); // { orgId, firstName, ... }
}
/* ------------------------------------------------------------------ */

export default function DataSourcesPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [live, setLive]     = useState(false);
  const [orgId, setOrgId]   = useState<string>("");

  useEffect(() => {
    /* 1.  grab orgId from the WORKING route -------------------- */
    getOrgProfile()
      .then((u) => setOrgId(u.orgId))
      .catch(() => console.error('No org profile'));

    /* 2.  connect socket -------------------------------------- */
    const token = document.cookie.match(/stack-session=([^;]+)/)?.[1] || "";
    const s = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`, {
      auth: { token },
      query: { orgId }, // will be empty on first run, then reconnects below
    });
    s.on("connect", () => setLive(true));
    s.on("disconnect", () => setLive(false));
    setSocket(s);

    /* 3.  CORRECT cleanup (function, not socket) -------------- */
    return () => {
      s.close();
    };
  }, [orgId]); // re-connects when orgId changes

  return (
    <div className="min-h-screen bg-[#1E2A44] text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <p className="text-sm text-gray-300">Connect anything – APIs, databases, files or our POS plug-in.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ConnectionCards />
      </section>

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