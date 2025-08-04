import { FaRobot } from 'react-icons/fa';

export default function AIChatButton() {
  return (
    <button className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-teal-400 shadow-lg rounded-full p-4 text-white text-2xl hover:scale-105 transition-all z-50">
      <FaRobot />
    </button>
  );
}
