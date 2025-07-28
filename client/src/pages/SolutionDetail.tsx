import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Cpu, Cloud, Database, Bot, LayoutGrid, Code, ArrowRight } from "lucide-react";

// Match solution IDs to icons and details
const SOLUTIONS = [
  {
    id: "ai-agent-ecosystems",
    icon: <Cpu className="h-8 w-8 text-blue-400" />,
    title: "AI Agent Ecosystems",
    desc: "Autonomous AI systems that collaborate to solve complex business problems",
    details: "Full details about AI Agent Ecosystems..."
  },
  {
    id: "cloud-architecture",
    icon: <Cloud className="h-8 w-8 text-purple-400" />,
    title: "Cloud Architecture",
    desc: "Design and implement resilient, scalable cloud infrastructures",
    details: "Full details about Cloud Architecture..."
  },
  {
    id: "data-engineering",
    icon: <Database className="h-8 w-8 text-green-400" />,
    title: "Data Engineering",
    desc: "Build robust pipelines that transform information into intelligence",
    details: "Full details about Data Engineering..."
  },
  {
    id: "enterprise-chatbots",
    icon: <Bot className="h-8 w-8 text-cyan-400" />,
    title: "Enterprise Chatbots",
    desc: "AI-powered conversational interfaces for complex workflows",
    details: "Full details about Enterprise Chatbots..."
  },
  {
    id: "multi-tenant-saas",
    icon: <LayoutGrid className="h-8 w-8 text-yellow-400" />,
    title: "Multi-Tenant SaaS",
    desc: "Build scalable SaaS solutions with efficient resource sharing",
    details: "Full details about Multi-Tenant SaaS..."
  },
  {
    id: "api-integrations",
    icon: <Code className="h-8 w-8 text-pink-400" />,
    title: "API Integrations",
    desc: "Connect your ecosystem with robust, secure API integrations",
    details: "Full details about API Integrations..."
  }
];

const SolutionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const solution = SOLUTIONS.find(s => s.id === id);

  if (!solution) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 text-white">
        <h2 className="text-2xl font-bold mb-4">Solution Not Found</h2>
        <Button onClick={() => navigate('/solutions')}>Back to Solutions</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 text-white flex flex-col items-center justify-center px-4 py-24">
      <div className="max-w-xl w-full bg-gradient-to-b from-gray-800/70 to-gray-900/90 rounded-2xl shadow-xl p-8 border border-cyan-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center">
            {solution.icon}
          </div>
          <h1 className="text-3xl font-bold text-white">{solution.title}</h1>
        </div>
        <p className="text-blue-100 mb-6 text-lg">{solution.desc}</p>
        <div className="mb-8 text-gray-200">
          {solution.details}
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:from-blue-700 hover:to-indigo-700 px-5 py-2 rounded-full border-none"
          onClick={() => navigate('/solutions')}
        >
          <ArrowRight className="mr-2 h-4 w-4" /> Back to All Solutions
        </Button>
      </div>
    </div>
  );
};

export default SolutionDetail;
