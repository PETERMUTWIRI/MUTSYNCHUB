import React, { useState } from "react";
import { MessageCircle, Send, User, X } from "lucide-react";

const accent = "#1de9b6";
const gradient = "bg-gradient-to-br from-[#1de9b6] via-[#1dc6e9] to-[#1d7fe9]";

const AIFloatingWidget: React.FC = () => {
  const [aiOpen, setAiOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Placeholder for backend AI agent call
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setTimeout(() => {
      setResponse("[AI Agentic Response Placeholder] This is where your AI-powered support answer will appear, based on your query and intent.");
      setLoading(false);
    }, 1200);
  };

  return (
    <>
      {!aiOpen && (
        <button
          className={`fixed bottom-8 right-8 z-[200] ${gradient} text-white rounded-full shadow-lg p-4 flex items-center justify-center animate-bounce`}
          style={{ boxShadow: `0 4px 24px 0 ${accent}33` }}
          onClick={() => setAiOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}
      {aiOpen && (
        <div className="fixed inset-0 z-[300] flex items-end justify-end">
          <div className={`bg-white dark:bg-zinc-900 border-2 border-[var(--accent-teal,#1de9b6)] rounded-2xl shadow-2xl p-6 m-8 max-w-md w-full animate-fade-in-up relative`}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={() => setAiOpen(false)} aria-label="Close AI Assistant">
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="h-8 w-8 text-[var(--accent-teal,#1de9b6)]" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">MutSyncHub AI Assistant</span>
            </div>
            <div className="mb-4 text-gray-700 dark:text-gray-200">
              <b>Welcome!</b> How may we be of help today? Ask anything about MutSyncHub, our features, integrations, or troubleshooting.
            </div>
            <form onSubmit={handleSend} className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full px-4 py-2 shadow border border-gray-100 dark:border-zinc-800">
              <User className="h-6 w-6 text-gray-400" />
              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white text-base px-2"
                placeholder="Type your question for our AI agent..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={loading}
                required
              />
              <button type="submit" disabled={loading || !query.trim()} className="rounded-full p-2 bg-[var(--accent-teal,#1de9b6)] hover:bg-emerald-400 transition-colors text-white">
                <Send className="h-5 w-5" />
              </button>
            </form>
            {loading && <div className="text-center text-gray-500 mt-2">Thinking...</div>}
            {response && <div className="mt-4 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 text-gray-800 dark:text-gray-100 shadow-sm">{response}</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default AIFloatingWidget;
