
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import emailjs from 'emailjs-com';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Calendar, Check, ChevronDown, ChevronUp, ArrowRight, Star, Briefcase, Cpu, Cloud, Database, Bot, Globe, Code2, LayoutGrid } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import Link from 'next/link';
import Image from 'next/image';

// Service categories
const SERVICE_CATEGORIES = [
  { id: 'ai', name: 'AI & Automation', icon: <Cpu size={20} /> },
  { id: 'cloud', name: 'Cloud Solutions', icon: <Cloud size={20} /> },
  { id: 'data', name: 'Data Engineering', icon: <Database size={20} /> },
  { id: 'chatbots', name: 'Chatbots', icon: <Bot size={20} /> },
  { id: 'web', name: 'Web Development', icon: <Globe size={20} /> },
  { id: 'integrations', name: 'Integrations', icon: <Code2 size={20} /> },
  { id: 'all', name: 'All Services', icon: <LayoutGrid size={20} /> },
];

// Solutions data (unchanged for brevity)
const SOLUTIONS = [
  {
    id: "analytics-demo",
    title: "Analytics Demo",
    description: "Request a live demonstration of our analytics engine and dashboard capabilities.",
    category: "data",
    services: [
      "Custom analytics walkthrough",
      "Live dashboard demo",
      "Q&A with analytics expert"
    ],
    deliverables: [
      "Personalized demo session",
      "Demo access credentials",
      "Follow-up recommendations"
    ],
    benefits: [
      "See analytics in action",
      "Tailored to your use case",
      "Direct expert answers"
    ],
    isHot: true
  },
  {
    id: "ai-agents",
    title: "AI Agent Ecosystems",
    description: "Build autonomous AI agents that collaborate to solve complex business problems without human intervention.",
    category: "ai",
    services: [
      "Multi-agent orchestration systems",
      "Self-optimizing agent networks",
      "Domain-specific agent frameworks",
      "Agent-to-agent communication protocols",
      "Continuous learning environments"
    ],
    deliverables: [
      "Deployed agent ecosystem",
      "Agent performance dashboard",
      "Integration documentation",
      "Training datasets",
      "Maintenance playbook"
    ],
    benefits: [
      "24/7 automated problem solving",
      "Reduced operational costs by 40-60%",
      "Real-time business intelligence",
      "Scalable decision-making capacity",
      "Future-proof adaptability"
    ],
    isHot: true
  },
  {
    id: "cloud-architecture",
    title: "Cloud-Native Architecture",
    description: "Design and implement resilient, scalable cloud infrastructures optimized for your specific business needs.",
    category: "cloud",
    services: [
      "Multi-cloud strategy development",
      "Serverless architecture design",
      "Kubernetes orchestration",
      "Cloud cost optimization",
      "Disaster recovery planning"
    ],
    deliverables: [
      "Cloud architecture blueprint",
      "Infrastructure-as-Code templates",
      "Performance benchmarking",
      "Security compliance report",
      "Cost management dashboard"
    ],
    benefits: [
      "99.99% uptime guarantee",
      "40-70% lower infrastructure costs",
      "Instant global scalability",
      "Enhanced security posture",
      "Faster time-to-market"
    ],
    isHot: true
  },
  {
    id: "data-engineering",
    title: "Modern Data Engineering",
    description: "Build robust data pipelines that transform raw information into actionable intelligence.",
    category: "data",
    services: [
      "Real-time data streaming",
      "AI-powered data quality",
      "Data lakehouse implementation",
      "Predictive analytics pipelines",
      "Data governance frameworks"
    ],
    deliverables: [
      "End-to-end data pipeline",
      "Data catalog and dictionary",
      "BI dashboard templates",
      "Data quality reports",
      "ML-ready datasets"
    ],
    benefits: [
      "Unified data ecosystem",
      "90% faster insights delivery",
      "Automated data quality control",
      "Scalable to petabyte scale",
      "Regulatory compliance assurance"
    ],
    isHot: true
  },
  {
    id: "enterprise-chatbots",
    title: "Enterprise Chatbot Systems",
    description: "Create AI-powered conversational interfaces that handle complex enterprise workflows.",
    category: "chatbots",
    services: [
      "Multi-modal chatbot design",
      "Emotion-aware interactions",
      "ERP/CRM integrations",
      "Voice-enabled assistants",
      "Continuous learning systems"
    ],
    deliverables: [
      "Deployed chatbot solution",
      "Conversation flow diagrams",
      "Integration documentation",
      "Training datasets",
      "Analytics dashboard"
    ],
    benefits: [
      "85% automated query resolution",
      "40% reduction in support costs",
      "24/7 customer engagement",
      "Personalized user experiences",
      "Actionable conversation insights"
    ],
    isHot: true
  },
  {
    id: "fullstack",
    title: "Full-Stack Development",
    description: "Build robust and scalable web applications tailored to your business needs.",
    category: "web",
    services: [
      "Custom web applications",
      "Progressive Web Apps (PWAs)",
      "Micro-frontend architecture",
      "Real-time collaboration features",
      "Headless CMS implementation"
    ],
    deliverables: [
      "Production-ready application",
      "Responsive design system",
      "CI/CD pipeline",
      "Performance optimization report",
      "Maintenance guidelines"
    ],
    benefits: [
      "Enhanced user engagement",
      "Faster feature deployment",
      "Cross-platform compatibility",
      "Future-proof architecture",
      "Reduced maintenance costs"
    ]
  },
  {
    id: "cloud-migration",
    title: "Cloud Migration & Optimization",
    description: "Seamlessly transition to cloud environments with maximum efficiency and minimal disruption.",
    category: "cloud",
    services: [
      "Legacy system modernization",
      "Cloud cost optimization",
      "Data migration strategies",
      "Containerization services",
      "Hybrid cloud solutions"
    ],
    deliverables: [
      "Migration roadmap",
      "Cost-benefit analysis",
      "Deployment playbook",
      "Performance benchmarks",
      "Security assessment"
    ],
    benefits: [
      "40-60% infrastructure cost savings",
      "Enhanced system performance",
      "Improved scalability",
      "Reduced technical debt",
      "Future-ready architecture"
    ]
  },
  {
    id: "ai-integrations",
    title: "AI-Powered Workflow Automation",
    description: "Transform business processes with intelligent automation that learns and adapts.",
    category: "ai",
    services: [
      "Process mining and analysis",
      "Intelligent document processing",
      "Predictive workflow optimization",
      "RPA with cognitive capabilities",
      "Automation governance frameworks"
    ],
    deliverables: [
      "Automated workflow implementation",
      "Process optimization report",
      "ROI analysis",
      "Maintenance dashboard",
      "Training materials"
    ],
    benefits: [
      "70-90% process acceleration",
      "60% reduction in manual errors",
      "Continuous process improvement",
      "Enhanced compliance tracking",
      "Rapid ROI (3-6 months)"
    ],
    isHot: true
  },
  {
    id: "multitenant",
    title: "Multi-Tenant SaaS Platforms",
    description: "Build scalable, secure SaaS solutions with efficient resource sharing and isolation.",
    category: "web",
    services: [
      "Tenant isolation architecture",
      "Customizable white-label solutions",
      "Usage-based billing systems",
      "Scalable data partitioning",
      "Self-service tenant management"
    ],
    deliverables: [
      "SaaS platform architecture",
      "Tenant management dashboard",
      "Billing system integration",
      "Scalability assessment",
      "Security audit report"
    ],
    benefits: [
      "90% faster tenant onboarding",
      "Efficient resource utilization",
      "Customizable client experiences",
      "Automated billing and reporting",
      "Enterprise-grade security"
    ]
  },
  {
    id: "data-analytics",
    title: "Advanced Analytics & BI",
    description: "Transform raw data into strategic insights with cutting-edge analytics solutions.",
    category: "data",
    services: [
      "Predictive analytics modeling",
      "Real-time dashboards",
      "Natural language query systems",
      "Anomaly detection frameworks",
      "Data storytelling platforms"
    ],
    deliverables: [
      "Interactive BI dashboards",
      "Analytics models",
      "Data visualization library",
      "Insight delivery framework",
      "User training materials"
    ],
    benefits: [
      "Data-driven decision making",
      "90% faster insights delivery",
      "Predictive capabilities",
      "Democratized data access",
      "Competitive intelligence"
    ]
  },
  {
    id: "api-integrations",
    title: "Enterprise API Integrations",
    description: "Connect your ecosystem with robust, secure API integrations.",
    category: "integrations",
    services: [
      "API gateway implementation",
      "Microservices architecture",
      "Event-driven integrations",
      "Legacy system API wrapping",
      "Real-time data synchronization"
    ],
    deliverables: [
      "Integration architecture",
      "API documentation",
      "Testing suite",
      "Monitoring dashboard",
      "Security audit report"
    ],
    benefits: [
      "Unified business ecosystem",
      "Real-time data flow",
      "Reduced integration costs",
      "Enhanced system agility",
      "Future-proof connectivity"
    ],
    isHot: true
  },
  {
    id: "iot-cloud",
    title: "IoT Cloud Platforms",
    description: "Connect, manage, and derive value from IoT ecosystems at scale.",
    category: "cloud",
    services: [
      "IoT device management",
      "Edge computing architecture",
      "Real-time telemetry processing",
      "Predictive maintenance systems",
      "Digital twin implementation"
    ],
    deliverables: [
      "IoT platform architecture",
      "Device management console",
      "Data pipeline design",
      "Alerting and monitoring system",
      "Analytics dashboard"
    ],
    benefits: [
      "Unified device management",
      "Real-time operational insights",
      "Predictive failure prevention",
      "Remote monitoring capabilities",
      "New revenue streams"
    ],
    isHot: true
  },
  {
    id: "blockchain",
    title: "Blockchain Integration",
    description: "Leverage distributed ledger technology for secure, transparent transactions.",
    category: "integrations",
    services: [
      "Smart contract development",
      "Tokenization strategies",
      "Supply chain transparency",
      "Decentralized identity solutions",
      "NFT marketplace development"
    ],
    deliverables: [
      "Blockchain architecture",
      "Smart contract suite",
      "Integration documentation",
      "Wallet management system",
      "Compliance assessment"
    ],
    benefits: [
      "Enhanced transaction security",
      "Reduced intermediary costs",
      "Immutable audit trails",
      "New business models",
      "Increased stakeholder trust"
    ]
  }
];

// Case studies data
const CASE_STUDIES = [
  {
    id: "fintech-ai",
    title: "AI-Powered Fraud Detection",
    client: "Global FinTech Leader",
    challenge: "Facing $12M annual losses to sophisticated fraud with legacy systems missing 40% of fraudulent transactions while generating excessive false positives.",
    solution: "Implemented a multi-agent AI ecosystem with specialized fraud detection agents, behavioral analysis modules, and real-time adaptive learning capabilities.",
    results: [
      "94% fraud detection accuracy",
      "$8.7M annual fraud prevention",
      "80% reduction in false positives",
      "Real-time transaction monitoring",
      "Self-optimizing detection models"
    ],
    technologies: ["Python", "TensorFlow", "Kubernetes", "Apache Kafka", "React"],
    testimonial: "The AI agent ecosystem reduced our fraud losses by 92% in the first quarter while improving customer experience through fewer false positives. The system continues to improve autonomously."
  },
  {
    id: "healthcare-cloud",
    title: "Healthcare Cloud Migration",
    client: "National Healthcare Provider",
    challenge: "Legacy systems causing 5+ hours of downtime monthly with inability to scale during pandemic surges, risking patient care and compliance.",
    solution: "Designed and implemented a HIPAA-compliant multi-cloud architecture with auto-scaling capabilities, zero-downtime migration, and advanced data encryption.",
    results: [
      "99.99% uptime achieved",
      "40% infrastructure cost reduction",
      "3x faster system performance",
      "Seamless pandemic-scale capacity",
      "Enhanced security compliance"
    ],
    technologies: ["AWS", "Azure", "Terraform", "Kubernetes", "React"],
    testimonial: "Our cloud transformation enabled us to handle 300% patient volume increases during critical periods without service degradation. The cost savings funded our telehealth expansion."
  },
  {
    id: "retail-chatbot",
    title: "Omnichannel Retail Assistant",
    client: "International Retail Chain",
    challenge: "Inconsistent customer experience across 12 channels with 48-hour response times and $3M annual support costs for basic inquiries.",
    solution: "Created unified AI assistant ecosystem handling 23 languages across web, mobile, social, and in-store kiosks with seamless human handoff.",
    results: [
      "85% inquiry automation rate",
      "$2.1M annual support savings",
      "4.8/5 customer satisfaction",
      "40% increase in conversion rate",
      "Unified customer journey"
    ],
    technologies: ["Dialogflow", "Node.js", "React Native", "AWS Lambda", "Redis"],
    testimonial: "Our AI assistant now handles 15,000+ daily conversations with higher satisfaction than human agents. It's transformed how we engage customers across all touchpoints."
  }
];

// Consultation times for scheduling
const CONSULTATION_TIMES = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
];

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleSolutions, setVisibleSolutions] = useState(6);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [consultationDate, setConsultationDate] = useState<Date | null>(null);
  const [consultationTime, setConsultationTime] = useState('');
  const [userDetails, setUserDetails] = useState({
    name: '', email: '', company: '', phone: '', message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);

  // Auto-expand solution
  useEffect(() => {
    const solutionId = searchParams.get('id');
    if (solutionId) {
      setExpandedSolution(solutionId);
      setTimeout(() => {
        solutionsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [searchParams]);

  // Filter solutions
  const filteredSolutions = selectedCategory === 'all'
    ? SOLUTIONS
    : SOLUTIONS.filter(s => s.category === selectedCategory);
  const visibleSolutionsData = filteredSolutions.slice(0, visibleSolutions);

  // Handle CTA preselect
  useEffect(() => {
    window.scrollTo(0, 0);
    const handler = (e: any) => {
      if (e?.detail?.preselect === 'analytics-demo') {
        setIsFormVisible(true);
        setFormStep(1);
        setSelectedServices(['analytics-demo']);
      }
    };
    window.addEventListener('openConsultationModal', handler);
    return () => window.removeEventListener('openConsultationModal', handler);
  }, []);

  const openCaseStudy = (study: any) => {
    setSelectedCaseStudy(study);
    document.body.style.overflow = 'hidden';
  };

  const closeCaseStudy = () => {
    setSelectedCaseStudy(null);
    document.body.style.overflow = 'auto';
  };

  const loadMoreSolutions = () => {
    setVisibleSolutions(prev => prev + 3);
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const scrollToSolutions = () => {
    solutionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^([+]?\d{1,3})?[-. (]*\d{3}[-. )]*\d{3}[-. ]*\d{4,}$/.test(phone.trim());
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep !== 3) return;

    if (!validateEmail(userDetails.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (userDetails.phone && !validatePhone(userDetails.phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    const templateParams = {
      services: selectedServices.map(id => SOLUTIONS.find(s => s.id === id)?.title).join(', '),
      consultation_date: consultationDate ? consultationDate.toLocaleDateString() : '',
      consultation_time: consultationTime,
      name: userDetails.name,
      email: userDetails.email,
      company: userDetails.company,
      phone: userDetails.phone,
      message: userDetails.message,
    };

    try {
      await emailjs.send(
        'service_m31tnxo',
        'template_2xnhweh',
        templateParams,
        'Rsa5hNJ7Mie6je22q'
      );
      setFormSubmitted(true);
    } catch (error) {
      alert('Failed to send request. Please try again.');
      console.error('EmailJS error:', error);
    }
  };

  const toggleSolutionExpand = (id: string) => {
    setExpandedSolution(expandedSolution === id ? null : id);
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setFormStep(1);
    setSelectedServices([]);
    setConsultationDate(null);
    setConsultationTime('');
    setUserDetails({ name: '', email: '', company: '', phone: '', message: '' });
    setFormSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              MutSyncHub Resources
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our cutting-edge solutions, case studies, and tools to transform your business with AI, cloud, and data innovation.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg"
                onClick={() => setIsFormVisible(true)}
              >
                Schedule a Consultation
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white px-8 py-3 rounded-lg"
                onClick={scrollToSolutions}
              >
                Discover Solutions
              </Button>
            </div>
          </motion.div>
          {/* Navigation Links */}
          <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/solutions" className="hover:text-cyan-400 transition-colors">Solutions</Link>
            <Link href="/what-we-do-support" className="hover:text-cyan-400 transition-colors">Support</Link>
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-100 mb-8 text-center"
          >
            Featured Resources
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">AI Transformation Guide</h3>
              <p className="text-gray-300 mb-4">Learn how AI agents can reduce costs by 40-60% and drive innovation.</p>
              <Button
                variant="link"
                className="text-cyan-400 hover:text-cyan-300 p-0"
                asChild
              >
                <Link href="/resources/whitepaper-ai">Download Whitepaper</Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">Cloud ROI Calculator</h3>
              <p className="text-gray-300 mb-4">Estimate your savings with our cloud migration strategies.</p>
              <Button
                variant="link"
                className="text-cyan-400 hover:text-cyan-300 p-0"
                asChild
              >
                <Link href="/resources/roi-calculator">Try Now</Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">Video Demo</h3>
              <p className="text-gray-300 mb-4">Watch our analytics engine in action.</p>
              <Button
                variant="link"
                className="text-cyan-400 hover:text-cyan-300 p-0"
                asChild
              >
                <Link href="/resources/video-demo">Watch Video</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Categories Navigation */}
      <section className="py-8 bg-gray-900 sticky top-0 z-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium ${
                  selectedCategory === category.id
                    ? 'bg-cyan-600 text-white'
                    : 'border-gray-600 text-gray-200 hover:bg-gray-800'
                }`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  scrollToSolutions();
                }}
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section id="solutions" ref={solutionsRef} className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-100 mb-4 text-center"
          >
            {selectedCategory === 'all' ? 'Our Solutions' : SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </motion.h2>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
            Discover enterprise-grade solutions designed to drive innovation and efficiency.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleSolutionsData.map((solution, idx) => (
              <motion.div
                key={`solution-${solution.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">{solution.title}</h3>
                    <p className="text-gray-300 text-sm mt-1">{solution.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-cyan-400"
                    onClick={() => toggleSolutionExpand(solution.id)}
                  >
                    {expandedSolution === solution.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Button>
                </div>
                <div className={`overflow-hidden transition-all duration-500 ${expandedSolution === solution.id ? 'max-h-[1000px]' : 'max-h-0'}`}>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
                      <Briefcase size={16} /> Key Services
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {solution.services.map((service, i) => (
                        <li key={`service-${i}`} className="flex items-start">
                          <Check size={14} className="text-cyan-400 mt-1 mr-2" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
                      <Check size={16} /> Deliverables
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {solution.deliverables.map((item, i) => (
                        <li key={`deliverable-${i}`} className="flex items-start">
                          <Check size={14} className="text-cyan-400 mt-1 mr-2" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
                      <ArrowRight size={16} /> Business Benefits
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {solution.benefits.map((benefit, i) => (
                        <li key={`benefit-${i}`} className="flex items-start">
                          <Check size={14} className="text-cyan-400 mt-1 mr-2" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 bg-cyan-600 text-white hover:bg-cyan-700"
                  onClick={() => {
                    setIsFormVisible(true);
                    setSelectedServices([solution.id]);
                  }}
                >
                  Request This Solution
                </Button>
              </motion.div>
            ))}
          </div>
          {visibleSolutions < filteredSolutions.length && (
            <div className="text-center mt-12">
              <Button
                onClick={loadMoreSolutions}
                variant="outline"
                className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white px-8 py-3 rounded-lg"
              >
                View More Solutions
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-100 mb-4 text-center"
          >
            Success Stories
          </motion.h2>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
            See how MutSyncHub has empowered businesses with transformative technology.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {CASE_STUDIES.map((study, idx) => (
              <motion.div
                key={`study-${study.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-700 hover:border-cyan-600 cursor-pointer"
                onClick={() => openCaseStudy(study)}
              >
                <h3 className="text-xl font-semibold text-gray-100 mb-2">{study.title}</h3>
                <p className="text-cyan-400 mb-4">{study.client}</p>
                <p className="text-gray-300 mb-4 line-clamp-3">{study.challenge}</p>
                <div className="flex flex-wrap gap-2">
                  {study.results.slice(0, 3).map((result, i) => (
                    <span key={i} className="text-xs bg-cyan-600 text-white px-3 py-1 rounded-full">
                      {result}
                    </span>
                  ))}
                </div>
                <Button
                  variant="link"
                  className="mt-4 text-cyan-400 hover:text-cyan-300 p-0"
                >
                  Read Full Case Study →
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Form Overlay */}
      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => !formSubmitted && setIsFormVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => !formSubmitted && setIsFormVisible(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <div className="p-8">
                {!formSubmitted ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">
                      {formStep === 1 ? 'Select Services' : formStep === 2 ? 'Schedule Consultation' : 'Contact Information'}
                    </h2>
                    <p className="text-gray-300 mb-6">
                      {formStep === 1 ? 'Choose the solutions you’re interested in.' : formStep === 2 ? 'Pick a convenient time for your free consultation.' : 'Tell us how to reach you.'}
                    </p>
                    <form onSubmit={handleFormSubmit}>
                      {formStep === 1 && (
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {SOLUTIONS.slice(0, 6).map(solution => (
                              <div
                                key={solution.id}
                                className={`p-4 rounded-lg border cursor-pointer ${
                                  selectedServices.includes(solution.id)
                                    ? 'border-cyan-600 bg-cyan-600/10'
                                    : 'border-gray-700 hover:border-cyan-600'
                                }`}
                                onClick={() => toggleServiceSelection(solution.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    selectedServices.includes(solution.id)
                                      ? 'bg-cyan-600 text-white'
                                      : 'bg-gray-700 text-gray-300'
                                  }`}>
                                    {SERVICE_CATEGORIES.find(c => c.id === solution.category)?.icon}
                                  </div>
                                  <h3 className="font-medium text-gray-100">{solution.title}</h3>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                              Additional Service Requests
                            </label>
                            <textarea
                              name="message"
                              value={userDetails.message}
                              onChange={handleInputChange}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                              placeholder="Describe any other services you need..."
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => setIsFormVisible(false)}
                              className="border-gray-600 text-gray-200 hover:bg-gray-800"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => setFormStep(2)}
                              className="bg-cyan-600 text-white hover:bg-cyan-700"
                              disabled={selectedServices.length === 0 && !userDetails.message}
                            >
                              Continue to Schedule
                            </Button>
                          </div>
                        </div>
                      )}
                      {formStep === 2 && (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Consultation Date
                              </label>
                              <div className="bg-gray-700 border border-gray-600 rounded-lg">
                                <DatePicker
                                  date={consultationDate || undefined}
                                  onDateChange={(date: Date | undefined) => setConsultationDate(date || null)}
                                  placeholder="Select a date"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Consultation Time
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                {CONSULTATION_TIMES.map(time => (
                                  <Button
                                    key={time}
                                    variant={consultationTime === time ? 'default' : 'outline'}
                                    className={`${
                                      consultationTime === time
                                        ? 'bg-cyan-600 text-white'
                                        : 'border-gray-600 text-gray-200 hover:bg-gray-800'
                                    }`}
                                    onClick={() => setConsultationTime(time)}
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => setFormStep(1)}
                              className="border-gray-600 text-gray-200 hover:bg-gray-800"
                            >
                              Back
                            </Button>
                            <Button
                              onClick={() => setFormStep(3)}
                              className="bg-cyan-600 text-white hover:bg-cyan-700"
                              disabled={!consultationDate || !consultationTime}
                            >
                              Continue to Contact
                            </Button>
                          </div>
                        </div>
                      )}
                      {formStep === 3 && (
                        <div>
                          <div className="space-y-4 mb-8">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Full Name
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={userDetails.name}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                placeholder="Your name"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  value={userDetails.email}
                                  onChange={handleInputChange}
                                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                  placeholder="your.email@example.com"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  name="phone"
                                  value={userDetails.phone}
                                  onChange={handleInputChange}
                                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                  placeholder="(123) 456-7890"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Company
                              </label>
                              <input
                                type="text"
                                name="company"
                                value={userDetails.company}
                                onChange={handleInputChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                                placeholder="Company name"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => setFormStep(2)}
                              className="border-gray-600 text-gray-200 hover:bg-gray-800"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              className="bg-cyan-600 text-white hover:bg-cyan-700"
                            >
                              Submit Request
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-100 mb-4">Request Submitted!</h3>
                    <p className="text-gray-300 mb-8">
                      Our team will contact you within 24 hours to discuss your needs.
                    </p>
                    <div className="bg-gray-700 rounded-lg p-4 text-left mb-8">
                      <h4 className="font-medium text-gray-100 mb-2">Request Summary:</h4>
                      {selectedServices.length > 0 && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">Services:</span>{' '}
                          {selectedServices.map(id => SOLUTIONS.find(s => s.id === id)?.title).join(', ')}
                        </p>
                      )}
                      {consultationDate && consultationTime && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">Consultation:</span>{' '}
                          {consultationDate.toLocaleDateString()} at {consultationTime}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="border-gray-600 text-gray-200 hover:bg-gray-800"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedCaseStudy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={closeCaseStudy}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={closeCaseStudy}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-100 mb-2">{selectedCaseStudy.title}</h2>
                <p className="text-cyan-400 text-lg mb-6">{selectedCaseStudy.client}</p>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-3">The Challenge</h3>
                    <p className="text-gray-300">{selectedCaseStudy.challenge}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-3">Our Solution</h3>
                    <p className="text-gray-300">{selectedCaseStudy.solution}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-3">Key Results</h3>
                    <ul className="space-y-3">
                      {selectedCaseStudy.results.map((result: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <Check size={18} className="text-cyan-400 mt-1 mr-3" />
                          <span className="text-gray-300">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-3">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCaseStudy.technologies.map((tech: string, i: number) => (
                        <span key={i} className="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="italic text-gray-300 mb-2">"{selectedCaseStudy.testimonial}"</p>
                    <p className="text-cyan-400 font-medium">— Client Representative</p>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={closeCaseStudy}
                    className="bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    Close Case Study
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer CTA with Navigation */}
      <section className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-lg p-8"
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Ready to Transform Your Business?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join leading enterprises leveraging MutSyncHub’s AI and cloud solutions for unparalleled growth.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-cyan-600 text-white hover:bg-cyan-700 px-8 py-3 rounded-lg"
                onClick={() => {
                  setIsFormVisible(true);
                  setFormStep(2);
                }}
              >
                <Calendar className="mr-2" /> Schedule Free Consultation
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-200 hover:bg-gray-800 px-8 py-3 rounded-lg"
                asChild
              >
                <Link href="/solutions">Explore All Solutions</Link>
              </Button>
            </div>
            <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-gray-400">
              <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
              <Link href="/solutions" className="hover:text-cyan-400 transition-colors">Solutions</Link>
              <Link href="/what-we-do-support" className="hover:text-cyan-400 transition-colors">Support</Link>
              <Link href="/resources" className="hover:text-cyan-400 transition-colors">Resources</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
