import { FaRobot } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AIChatButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchChatbotStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chatbot/status');
      if (!res.ok) throw new Error('Failed to fetch chatbot status');
      const data = await res.json();
      setStatus(data.status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    await fetchChatbotStatus();
  };

  return (
    <button
      className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-teal-400 shadow-lg rounded-full p-4 text-white text-2xl hover:scale-105 transition-all z-50"
      onClick={handleClick}
      aria-label="Open AI Chatbot"
      disabled={loading}
    >
      <FaRobot />
      {loading && <span className="ml-2 text-xs">Loading...</span>}
      {status && <span className="ml-2 text-xs">{status}</span>}
      {error && <span className="ml-2 text-xs text-red-400">{error}</span>}
    </button>
  );
}
