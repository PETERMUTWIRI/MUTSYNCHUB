import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HiChat, HiX } from 'react-icons/hi';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (input.trim() === '') return;
    setLoading(true);
    setError(null);
    const newMessages = [...messages, { text: input, sender: 'user' as 'user' }];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error('Failed to get chatbot response');
      const data = await res.json();
      setMessages([...newMessages, { text: data.reply, sender: 'bot' as 'bot' }]);
    } catch (err: any) {
      setError(err.message);
      setMessages([
        ...newMessages,
        { text: 'Sorry, I am having trouble connecting.', sender: 'bot' as 'bot' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        size="lg"
        className="rounded-full w-16 h-16 flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <HiX size={24} /> : <HiChat size={24} />}
      </Button>

      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Chatbot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`text-sm ${msg.sender === 'user' ? 'text-blue-300' : 'text-green-300'}`}>{msg.text}</div>
              ))}
              {error && <div className="text-xs text-red-400">{error}</div>}
              <div className="flex gap-2 mt-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <Button size="sm" onClick={handleSend} disabled={loading || !input.trim()}>
                  Send
                </Button>
              </div>
              {loading && <div className="text-xs text-gray-400">Loading...</div>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chatbot;
