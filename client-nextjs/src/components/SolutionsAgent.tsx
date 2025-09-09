'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { chatWrapper as agentChat, reqWrapper as gatherRequirements, bookWrapper as bookSlot } from '@/app/actions/agent';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import {
  HiOutlineChatBubbleLeftRight, HiOutlineMicrophone,  HiOutlineSpeakerWave, HiOutlineSpeakerXMark, HiOutlinePhone, HiOutlineEnvelope, HiOutlineCalendar
} from 'react-icons/hi2';
import { MdMicOff } from 'react-icons/md';
export default function SolutionsAgent({ solutions }: { solutions: any[] }) {
  const [thread, setThread] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [calendarOffer, setCalendarOffer] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [email, setEmail] = useState('');
  const { listen, reply, transcript, speaking } = useVoiceAgent();

  // auto-send voice + scroll to chat
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      send(); // ← auto-send final transcript
    }
  }, [transcript]);

  // scroll chat into view when panel opens
  useEffect(() => {
    if (thread.length > 0) {
      document.getElementById('ai-chat-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [thread]);

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user' as const, content: input };
    setThread((p) => [...p, userMsg]);
    setInput('');

    if (thread.length === 0) {
      const req = await gatherRequirements('unknown', 'anon');
      const botMsg = { role: 'assistant' as const, content: req.question };
      setThread((p) => [...p, botMsg]);
      setLoading(false); return;
    }

    const res = await agentChat(input, 'anon');
    setThread((p) => [...p, { role: 'assistant', content: res.content }]);
    if (res.requiresContact) setCalendarOffer(true);
    setLoading(false);
  };

  const book = async () => {
    if (!date || !time || !email) return alert('Fill all fields');
    await bookSlot(date, time, email, 'anon');
    alert('Calendar invite sent + email summary delivered!');
    setCalendarOffer(false);
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice not supported');
      return;
    }
    const rec = new (window as any).webkitSpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      // store transcript → useEffect will auto-send
    };
    rec.onend = () => {
      if (!speaking && !loading) send(); // final send on silence
    };
    rec.start();
  };

  return (
    <div id="ai-chat-panel" className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-white text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-xl">🤖</span>
          <span className="font-semibold">AI Consultant</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={startVoice}
            disabled={speaking || loading}
            className={`px-2 py-1 rounded text-xs ${
              speaking ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'
            }`}
          >
            {speaking ? <MdMicOff size={14} /> : <HiOutlineMicrophone size={14} />}
          </Button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="h-64 overflow-y-auto mb-3 space-y-2 rounded-lg bg-gray-900/50 p-3">
        {thread.length === 0 && (
          <div className="px-3 py-2 rounded-lg bg-gray-700/50 text-xs text-gray-300 mb-2">
            �� Try: “Book a consultation”, “Tell me about MutSyncHub”, “I need AI agents”
          </div>
        )}
        <AnimatePresence>
          {thread.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-3 py-2 rounded-lg text-xs ${m.role === 'user' ? 'bg-cyan-600' : 'bg-gray-700'}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 text-xs">
              Typing…
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          id="ai-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type or speak…"
          className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <Button onClick={send} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-xs px-3 py-2">
          Send
        </Button>
      </div>

      {/* Calendar Offer */}
      <AnimatePresence>
        {calendarOffer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 rounded-lg bg-cyan-600/10 border border-cyan-500"
          >
            <p className="text-sm mb-2">Ready to book a free consultation?</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-xs"
              />
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-xs"
              >
                <option value="">Time</option>
                {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-xs"
              />
              <Button onClick={book} className="bg-cyan-600 hover:bg-cyan-700 text-xs px-3 py-1">
                <HiOutlineCalendar size={14} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
