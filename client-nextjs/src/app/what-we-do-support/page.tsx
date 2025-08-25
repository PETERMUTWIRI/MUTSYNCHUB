
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LifeBuoy, MessageSquare, BookOpen, Users, AlertCircle, Plus, Search,
  ChevronRight, Mail, Phone, Wrench, CheckCircle2, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import SupportTicketCard from '@/components/support/SupportTicketCard';
import SupportChannelCard from '@/components/support/SupportChannelCard';
import KnowledgeBaseSearch from '@/components/whatwedosupport/KnowledgeBaseSearch';
import SystemStatusCard from '@/components/support/SystemStatusCard';
import FaqAccordion from '@/components/support/FaqAccordion';
import ContactOption from '@/components/support/ContactOption';
import LiveChatWidget from '@/components/support/LiveChatWidget';

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

export default function WhatWeDoSupport() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('section') as 'tickets' | 'knowledge' | 'community' | 'status') || 'tickets';
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledge' | 'community' | 'status'>(initialTab);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setActiveTab((searchParams?.get('section') as 'tickets' | 'knowledge' | 'community' | 'status') || 'tickets');
  }, [searchParams]);

  useEffect(() => {
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

  const supportChannels: SupportChannel[] = [
    {
      icon: <MessageSquare size={24} />,
      title: 'Live Chat',
      description: 'Get immediate assistance from our support team',
      actionText: 'Start Chat',
      onClick: () => setIsChatOpen(true),
      color: 'bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600/20'
    },
    {
      icon: <LifeBuoy size={24} />,
      title: 'Support Ticket',
      description: 'Submit a ticket for non-urgent issues',
      actionText: 'Create Ticket',
      onClick: () => console.log('Create Ticket'),
      color: 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Knowledge Base',
      description: 'Find answers in our documentation',
      actionText: 'Browse Articles',
      onClick: () => setActiveTab('knowledge'),
      color: 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    },
    {
      icon: <Users size={24} />,
      title: 'Community Forum',
      description: 'Ask the community for help',
      actionText: 'Visit Forum',
      onClick: () => console.log('Visit Forum'),
      color: 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    }
  ];

  const contactOptions: ContactOptionType[] = [
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

  const systemStatus: SystemStatus[] = [
    { service: 'API Services', status: 'operational', lastUpdated: '2025-07-24T10:30:00Z' },
    { service: 'Data Processing', status: 'operational', lastUpdated: '2025-07-24T09:45:00Z' },
    { service: 'Dashboard & Analytics', status: 'degraded', lastUpdated: '2025-07-24T11:15:00Z' },
    { service: 'Authentication', status: 'operational', lastUpdated: '2025-07-24T08:20:00Z' },
    { service: 'Integration Connectors', status: 'maintenance', lastUpdated: '2025-07-24T07:00:00Z' },
    { service: 'Notification System', status: 'outage', lastUpdated: '2025-07-24T12:05:00Z' }
  ];

  const faqs: Faq[] = [
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
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
          >
            MutSyncHub Support Center
          </motion.h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Enterprise-grade support for your business-critical operations, available 24/7 with a 98% satisfaction rate.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              className="bg-cyan-600 text-white hover:bg-cyan-700 px-8 py-3 rounded-lg font-semibold"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare className="mr-2" /> Start Live Chat
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-200 hover:bg-gray-800 px-8 py-3 rounded-lg"
              asChild
            >
              <Link href="/resources">Explore Resources</Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/solutions" className="hover:text-cyan-400 transition-colors">Solutions</Link>
            <Link href="/resources" className="hover:text-cyan-400 transition-colors">Resources</Link>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-gray-100 mb-6"
          >
            Trusted by Industry Leaders
          </motion.h2>
          <div className="flex justify-center gap-8 flex-wrap">
            <Image src="/microsoft.svg" alt="Client 1" width={120} height={60} className="opacity-80 hover:opacity-100" />
            <Image src="/oracle.svg" alt="Client 2" width={120} height={60} className="opacity-80 hover:opacity-100" />
            <Image src="/soc.svg" alt="SOC 2 Certified" width={100} height={50} className="opacity-80 hover:opacity-100" />
            <Image src="/iso.svg" alt="ISO 27001 Certified" width={100} height={50} className="opacity-80 hover:opacity-100" />
          </div>
        </div>
      </section>

      {/* Support Metrics Section */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-100 mb-8"
          >
            World-Class Support, Backed by Data
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700"
            >
              <h3 className="text-4xl font-extrabold text-cyan-400">98%</h3>
              <p className="text-gray-300 mt-2">Customer Satisfaction Rate</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700"
            >
              <h3 className="text-4xl font-extrabold text-cyan-400">&lt;2 hr</h3>
              <p className="text-gray-300 mt-2">Average Response Time</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700"
            >
              <h3 className="text-4xl font-extrabold text-cyan-400">95%</h3>
              <p className="text-gray-300 mt-2">First-Contact Resolution</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-100 mb-8 text-center"
          >
            How We Can Help
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <SupportChannelCard key={index} {...channel} />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Contact and Status */}
            <div className="lg:w-1/3">
              <div className="bg-gray-800 rounded-lg p-6 shadow-md mb-8 border border-gray-700">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">Contact Support</h2>
                <div className="space-y-4">
                  {contactOptions.map((option, index) => (
                    <ContactOption key={index} {...option} />
                  ))}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700">
                <h2 className="text-xl font-semibold text-gray-100 mb-4">System Status</h2>
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
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Status Legend:</span>{' '}
                    <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} className="text-cyan-400" /> Operational</span>{' '}
                    <span className="inline-flex items-center gap-1"><AlertCircle size={14} className="text-yellow-400" /> Degraded</span>{' '}
                    <span className="inline-flex items-center gap-1"><Wrench size={14} className="text-blue-400" /> Maintenance</span>{' '}
                    <span className="inline-flex items-center gap-1"><XCircle size={14} className="text-red-400" /> Outage</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Tickets/Knowledge Base */}
            <div className="lg:w-2/3">
              <div className="flex border-b border-gray-700 mb-6">
                {['tickets', 'knowledge', 'status'].map(tab => (
                  <button
                    key={tab}
                    className={`py-3 px-4 font-medium text-sm border-b-2 ${
                      activeTab === tab
                        ? 'border-cyan-600 text-cyan-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab(tab as 'tickets' | 'knowledge' | 'status')}
                  >
                    {tab === 'tickets' ? 'My Support Tickets' : tab === 'knowledge' ? 'Knowledge Base' : 'System Status'}
                  </button>
                ))}
              </div>
              <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700">
                {activeTab === 'tickets' && (
                  <div>
                    <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-100">My Support Tickets</h3>
                      <Button
                        className="flex items-center gap-1 bg-cyan-600 text-white hover:bg-cyan-700 px-4 py-2 rounded-lg text-sm font-medium"
                        onClick={() => console.log('Create Ticket')}
                      >
                        <Plus size={16} /> New Ticket
                      </Button>
                    </div>
                    <div className="divide-y divide-gray-700">
                      {isLoading ? (
                        <div className="p-12 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                          <p className="mt-4 text-gray-400">Loading your support tickets...</p>
                        </div>
                      ) : tickets.length === 0 ? (
                        <div className="p-12 text-center">
                          <p className="text-gray-400">No support tickets found.</p>
                          <Button
                            variant="link"
                            className="mt-4 text-cyan-400 hover:text-cyan-300"
                            onClick={() => console.log('Create Ticket')}
                          >
                            Create your first ticket
                          </Button>
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
                        <div className="bg-cyan-600/10 rounded-lg p-2 text-cyan-400">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-100">All Systems Operational</h3>
                          <p className="text-gray-300 text-sm">Last updated on July 24, 2025</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="font-semibold text-gray-100 mb-3">Component Status</h3>
                      <div className="space-y-3">
                        {systemStatus.map((system, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {system.status === 'operational' && <CheckCircle2 size={16} className="text-cyan-400" />}
                              {system.status === 'degraded' && <AlertCircle size={16} className="text-yellow-400" />}
                              {system.status === 'maintenance' && <Wrench size={16} className="text-blue-400" />}
                              {system.status === 'outage' && <XCircle size={16} className="text-red-400" />}
                              <span className="text-gray-300">{system.service}</span>
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                              system.status === 'operational'
                                ? 'bg-cyan-600/10 text-cyan-400'
                                : system.status === 'degraded'
                                  ? 'bg-yellow-600/10 text-yellow-400'
                                  : system.status === 'maintenance'
                                    ? 'bg-blue-600/10 text-blue-400'
                                    : 'bg-red-600/10 text-red-400'
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
              <div className="mt-8">
                <div className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700">
                  <h2 className="text-2xl font-semibold text-gray-100 mb-6">Frequently Asked Questions</h2>
                  <FaqAccordion faqs={faqs} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA with Navigation */}
      <section className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-lg p-8"
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Need Immediate Assistance?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Our 24/7 support team is here to ensure your operations run smoothly. Contact us now.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-cyan-600 text-white hover:bg-cyan-700 px-8 py-3 rounded-lg"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquare className="mr-2" /> Start Live Chat
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-200 hover:bg-gray-800 px-8 py-3 rounded-lg"
                asChild
              >
                <Link href="/resources">Explore Support Resources</Link>
              </Button>
            </div>
            <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-gray-400">
              <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
              <Link href="/solutions" className="hover:text-cyan-400 transition-colors">Solutions</Link>
              <Link href="/resources" className="hover:text-cyan-400 transition-colors">Resources</Link>
              <Link href="/what-we-do-support" className="hover:text-cyan-400 transition-colors">Support</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <LiveChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
