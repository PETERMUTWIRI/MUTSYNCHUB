// src/pages/Support.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LifeBuoy, 
  MessageSquare, 
  BookOpen, 
  Users, 
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  Mail,
  Phone,
  Wrench,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Components
import SupportTicketCard from '../components/support/SupportTicketCard';
import SupportChannelCard from '../components/support/SupportChannelCard';
import KnowledgeBaseSearch from '../components/whatwedosupport/KnowledgeBaseSearch';
import SystemStatusCard from '../components/support/SystemStatusCard';
import FaqAccordion from '../components/support/FaqAccordion';
import PriorityIndicator from '../components/support/PriorityIndicator';
import StatusBadge from '../components/support/StatusBadge';
import Breadcrumb from '../components/resources/Breadcrumb';
import ContactOption from '../components/support/ContactOption';
import LiveChatWidget from '../components/support/LiveChatWidget';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  date: string;
  assignee: string;
}

interface SupportChannel {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onClick: () => void;
  color: string;
}

interface ContactOptionType {
  icon: React.ReactNode;
  title: string;
  details: string;
  actionText: string;
  href: string;
  onClick?: () => void;
}

interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  lastUpdated: string;
}

interface Faq {
  question: string;
  answer: string;
}

const WhatWeDoSupport = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledge' | 'community' | 'status'>('tickets');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in a real app this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTickets([
        {
          id: 'TKT-001',
          title: 'API Integration Issue',
          description: 'Unable to authenticate with the new API endpoint',
          status: 'open',
          priority: 'high',
          date: '2025-07-20',
          assignee: 'Sarah Johnson'
        },
        {
          id: 'TKT-002',
          title: 'Dashboard Not Loading',
          description: 'Analytics dashboard fails to load with large datasets',
          status: 'pending',
          priority: 'medium',
          date: '2025-07-18',
          assignee: 'Michael Chen'
        },
        {
          id: 'TKT-003',
          title: 'Billing Inquiry',
          description: 'Question about the latest invoice charges',
          status: 'resolved',
          priority: 'low',
          date: '2025-07-15',
          assignee: 'Emma Rodriguez'
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const supportChannels = [
    {
      icon: <MessageSquare size={24} />,
      title: 'Live Chat',
      description: 'Get immediate assistance from our support team',
      actionText: 'Start Chat',
      onClick: () => setIsChatOpen(true),
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    },
    {
      icon: <LifeBuoy size={24} />,
      title: 'Support Ticket',
      description: 'Submit a ticket for non-urgent issues',
      actionText: 'Create Ticket',
      onClick: () => console.log('Create Ticket'),
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Knowledge Base',
      description: 'Find answers in our documentation',
      actionText: 'Browse Articles',
      onClick: () => setActiveTab('knowledge'),
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    },
    {
      icon: <Users size={24} />,
      title: 'Community Forum',
      description: 'Ask the community for help',
      actionText: 'Visit Forum',
      onClick: () => console.log('Visit Forum'),
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }
  ];

  const contactOptions = [
    {
      icon: <Mail size={20} />,
      title: 'Email Support',
      details: 'support@mutsynhub.com',
      actionText: 'Send Email',
      href: 'mailto:support@mutsynhub.com'
    },
    {
      icon: <Phone size={20} />,
      title: 'Phone Support',
      details: '+1 (800) 123-4567',
      actionText: 'Call Now',
      href: 'tel:+18001234567'
    },
    {
      icon: <MessageSquare size={20} />,
      title: '24/7 Chat',
      details: 'Available around the clock',
      actionText: 'Start Chat',
      href: '#',
      onClick: () => setIsChatOpen(true)
    }
  ];

  const systemStatus = [
    { service: 'API Services', status: 'operational', lastUpdated: '2025-07-24T10:30:00Z' },
    { service: 'Data Processing', status: 'operational', lastUpdated: '2025-07-24T09:45:00Z' },
    { service: 'Dashboard & Analytics', status: 'degraded', lastUpdated: '2025-07-24T11:15:00Z' },
    { service: 'Authentication', status: 'operational', lastUpdated: '2025-07-24T08:20:00Z' },
    { service: 'Integration Connectors', status: 'maintenance', lastUpdated: '2025-07-24T07:00:00Z' },
    { service: 'Notification System', status: 'outage', lastUpdated: '2025-07-24T12:05:00Z' }
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. You will receive an email with instructions to reset your password.'
    },
    {
      question: 'What data sources do you support?',
      answer: 'We support a wide range of data sources including SQL databases, NoSQL databases, cloud storage services, and popular SaaS applications. Check our integrations page for a complete list.'
    },
    {
      question: 'How often is data synced?',
      answer: 'Data sync frequency depends on your subscription plan. Free plans sync every 24 hours, while paid plans can sync as frequently as every 15 minutes.'
    },
    {
      question: 'Can I use MUTSYNCHUB with my custom API?',
      answer: 'Yes, we provide a flexible API integration framework that allows you to connect to any REST or GraphQL API. Our documentation includes detailed guides for custom integrations.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We take security seriously. All data is encrypted in transit and at rest, and we comply with industry-standard security certifications including SOC 2 and ISO 27001.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={[
          { name: 'Home', href: '/' },
          { name: 'Support', href: '/support' }
        ]} />

        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4"
          >
             Support Center
          </motion.h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Premium support services for your business-critical operations. Our experts are here to help 24/7.
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {supportChannels.map((channel, index) => (
            <SupportChannelCard key={index} {...channel} />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Contact and Status */}
          <div className="lg:w-1/3">
            {/* Contact Options */}
            <div className="bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 rounded-xl shadow-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Support</h2>
              <div className="space-y-4">
                {contactOptions.map((option, index) => (
                  <ContactOption key={index} {...option} />
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
              <div className="space-y-4">
                {systemStatus.map((system, index) => (
                  <SystemStatusCard 
                    key={index} 
                    service={system.service} 
                    status={system.status as 'operational' | 'degraded' | 'maintenance' | 'outage'} 
                    lastUpdated={system.lastUpdated} 
                  />
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Status Legend:</span>{' '}
                  <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Operational</span>{' '}
                  <span className="inline-flex items-center gap-1"><AlertCircle size={14} className="text-yellow-500" /> Degraded</span>{' '}
                  <span className="inline-flex items-center gap-1"><Wrench size={14} className="text-blue-500" /> Maintenance</span>{' '}
                  <span className="inline-flex items-center gap-1"><XCircle size={14} className="text-red-500" /> Outage</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Tickets/Knowledge Base */}
          <div className="lg:w-2/3">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'tickets'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('tickets')}
              >
                My Support Tickets
              </button>
              <button
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'knowledge'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('knowledge')}
              >
                Knowledge Base
              </button>
              <button
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeTab === 'status'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('status')}
              >
                System Status
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 rounded-xl shadow-xl">
              {activeTab === 'tickets' && (
                <div>
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Support Tickets</h3>
                    <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      <Plus size={16} /> New Ticket
                    </button>
                  </div>

                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your support tickets...</p>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No support tickets found.</p>
                        <button className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                          Create your first ticket
                        </button>
                      </div>
                    ) : (
                      tickets.map(ticket => (
                        <SupportTicketCard key={ticket.id} ticket={ticket} />
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'knowledge' && <KnowledgeBaseSearch />}
              
              {activeTab === 'status' && (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2 text-green-600 dark:text-green-300">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">All Systems Operational</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Last updated on July 24, 2025</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Component Status</h3>
                    <div className="space-y-3">
                      {systemStatus.map((system, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {system.status === 'operational' && <CheckCircle2 size={16} className="text-green-500" />}
                            {system.status === 'degraded' && <AlertCircle size={16} className="text-yellow-500" />}
                            {system.status === 'maintenance' && <Wrench size={16} className="text-blue-500" />}
                            {system.status === 'outage' && <XCircle size={16} className="text-red-500" />}
                            <span className="text-gray-700 dark:text-gray-300">{system.service}</span>
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            system.status === 'operational' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : system.status === 'degraded'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : system.status === 'maintenance'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FAQ Section */}
            <div className="mt-8">
              <div className="bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 rounded-xl shadow-xl">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                  <FaqAccordion faqs={faqs} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Chat Widget */}
      <LiveChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};


export default WhatWeDoSupport;
