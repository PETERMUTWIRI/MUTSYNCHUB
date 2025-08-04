import  { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HiChat, HiX } from 'react-icons/hi';
import { getChatbotResponse } from '../../api/user';
import { useLocation } from 'react-router-dom';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const location = useLocation();

  const handleSend = () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { text: input, sender: 'user' as 'user' }];
    setMessages(newMessages);
    setInput('');

    getChatbotResponse(input, { page: location.pathname })
      .then(response => {
        setMessages([...newMessages, { text: response.data.reply, sender: 'bot' as 'bot' }]);
      })
      .catch(error => {
        console.error('Failed to get chatbot response:', error);
        setMessages([
          ...newMessages,
          { text: 'Sorry, I am having trouble connecting.', sender: 'bot' as 'bot' },
        ]);
      });
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
            <div className="h-64 overflow-y-auto p-4 bg-gray-700 rounded-lg mb-4">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  <span
                    className={`inline-block p-2 rounded-lg ${
                      msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                    }`}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button onClick={handleSend} className="ml-2">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chatbot;
