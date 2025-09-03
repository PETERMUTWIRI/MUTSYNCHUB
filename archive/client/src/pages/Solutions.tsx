import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import emailjs from 'emailjs-com';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Calendar, Check, ChevronDown, ChevronUp, ArrowRight, Star, Briefcase, Cpu, Cloud, Database, Bot, Globe, Code2, LayoutGrid } from "lucide-react";
import {DatePicker} from "../components/ui/datepicker";


// Service categories for easy navigation
const SERVICE_CATEGORIES = [
  { id: "ai", name: "AI & Automation", icon: <Cpu size={20} /> },
  { id: "cloud", name: "Cloud Solutions", icon: <Cloud size={20} /> },
  { id: "data", name: "Data Engineering", icon: <Database size={20} /> },
  { id: "chatbots", name: "Chatbots", icon: <Bot size={20} /> },
  { id: "web", name: "Web Development", icon: <Globe size={20} /> },
  { id: "integrations", name: "Integrations", icon: <Code2 size={20} /> },
  { id: "all", name: "All Services", icon: <LayoutGrid size={20} /> },
];

// Enhanced solutions data with 2025-focused services
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

const SolutionsPage = () => {
  const location = useLocation();
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleSolutions, setVisibleSolutions] = useState(6);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [consultationDate, setConsultationDate] = useState<Date | null>(null);
  const [consultationTime, setConsultationTime] = useState("");
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);

  // Auto-expand solution if ?id=solutionId is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const solutionId = params.get("id");
    if (solutionId) {
      setExpandedSolution(solutionId);
      setTimeout(() => {
        solutionsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [location.search]);

  // Filter solutions by category
  const filteredSolutions = selectedCategory === "all" 
    ? SOLUTIONS 
    : SOLUTIONS.filter(s => s.category === selectedCategory);

  const visibleSolutionsData = filteredSolutions.slice(0, visibleSolutions);


  // Listen for CTA event to preselect Analytics Demo
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
    // Simple email regex
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    // Accepts numbers, spaces, dashes, parentheses, and plus
    return /^([+]?\d{1,3})?[-. (]*\d{3}[-. )]*\d{3}[-. ]*\d{4,}$/.test(phone.trim());
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only submit if on contact info step
    if (formStep !== 3) return;

    // Validate email
    if (!validateEmail(userDetails.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    // Validate phone (optional, only if provided)
    if (userDetails.phone && !validatePhone(userDetails.phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    const templateParams = {
      services: selectedServices.map(id => SOLUTIONS.find(s => s.id === id)?.title).join(", "),
      consultation_date: consultationDate ? consultationDate.toLocaleDateString() : "",
      consultation_time: consultationTime,
      name: userDetails.name,
      email: userDetails.email,
      company: userDetails.company,
      phone: userDetails.phone,
      message: userDetails.message
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
    setConsultationTime("");
    setUserDetails({
      name: "",
      email: "",
      company: "",
      phone: "",
      message: ""
    });
    setFormSubmitted(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Mutsynchub Solutions
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto mb-8">
            Transform your business with cutting-edge technology solutions ,you imagine we  create
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg border border-cyan-500 text-white"
              onClick={() => setIsFormVisible(true)}
            >
              Request Custom Solution
            </Button>
            <Button 
              variant="outline"
              className="border-cyan-500 text-cyan-400 bg-gray-800 hover:bg-cyan-500/10 hover:text-cyan-300 px-8 py-6 text-lg font-semibold rounded-xl"
              onClick={scrollToSolutions}
            >
              Explore Our Solutions
            </Button>
          </div>
        </motion.div>
        
        {/* Floating Tech Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-16 h-16 rounded-full bg-blue-500/20 blur-xl"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-20 w-12 h-12 rounded-full bg-purple-500/20 blur-xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/4 w-14 h-14 rounded-full bg-cyan-500/20 blur-xl"
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Service Categories Navigation */}
      <div className="py-8 bg-white/5 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {SERVICE_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                className={`flex items-center gap-2 rounded-full px-4 py-3 transition-all ${
                  selectedCategory === category.id 
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg"
                    : "text-white hover:bg-white/10"
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
      </div>

      {/* Solutions Grid */}
      <div 
        id="solutions" 
        ref={solutionsRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            {selectedCategory === "all" ? "Our Comprehensive Solutions" : `${SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
          </motion.h2>
          <p className="text-blue-200 max-w-2xl mx-auto">
            Cutting-edge services designed to propel your business into the future
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleSolutionsData.map((solution, idx) => (
            <motion.div
              key={`solution-${solution.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-gray-800/50 to-gray-900/80 border border-cyan-700 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">{solution.title}</h3>
                    </div>
                    <p className="text-blue-200 text-sm mt-1">{solution.description}</p>
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className={`text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500 rounded-full`}
                    onClick={() => setExpandedSolution(expandedSolution === solution.id ? null : solution.id)}
                  >
                    {expandedSolution === solution.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Button>
                </div>
                
                <div className={`overflow-hidden transition-all duration-500 ${expandedSolution === solution.id ? "max-h-[1000px]" : "max-h-0"}`}>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Briefcase size={16} /> Key Services
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {solution.services.map((service, i) => (
                        <li key={`service-${i}`} className="flex items-start">
                          <Check size={14} className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Check size={16} /> Deliverables
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {solution.deliverables.map((item, i) => (
                        <li key={`deliverable-${i}`} className="flex items-start">
                          <Check size={14} className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <ArrowRight size={16} /> Business Benefits
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {solution.benefits.map((benefit, i) => (
                        <li key={`benefit-${i}`} className="flex items-start">
                          <Check size={14} className="text-green-400 mt-1 mr-2 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold border-none shadow-lg hover:from-cyan-600 hover:to-blue-700"
                  onClick={() => {
                    setIsFormVisible(true);
                    setSelectedServices([solution.id]);
                  }}
                >
                  Request This Solution
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Solutions Button */}
        {visibleSolutions < filteredSolutions.length && (
          <div className="text-center mt-12">
            <Button
              onClick={loadMoreSolutions}
              variant="outline"
              className="border-cyan-500 text-cyan-400 bg-gray-800 hover:bg-cyan-500/10 hover:text-cyan-300 px-8 py-6 text-lg font-semibold rounded-xl"
            >
              View More Solutions
            </Button>
          </div>
        )}
      </div>

      {/* Case Studies Section */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Success Stories
            </motion.h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Discover how we've transformed businesses with our technology solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {CASE_STUDIES.map((study, idx) => (
              <motion.div
                key={`study-${study.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-800/50 to-blue-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500 transition-all cursor-pointer group"
                onClick={() => openCaseStudy(study)}
              >
                <div className="h-full flex flex-col">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-300 transition-colors">{study.title}</h3>
                  <p className="text-blue-300 mb-4">{study.client}</p>
                  <p className="text-gray-300 mb-4 line-clamp-3">{study.challenge}</p>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {study.results.slice(0, 3).map((result, i) => (
                        <span key={i} className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full">
                          {result}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="link" 
                    className="mt-auto text-cyan-400 hover:text-cyan-300 p-0 hover:underline justify-start pl-0"
                  >
                    Read Full Case Study →
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => !formSubmitted && setIsFormVisible(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="p-8">
                {(!formSubmitted && formStep <= 3) ? (
                  <>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-2">
                        {formStep === 1 ? "Select Services" : 
                         formStep === 2 ? "Schedule Consultation" : 
                         "Contact Information"}
                      </h2>
                      <p className="text-blue-300">
                        {formStep === 1 ? "Choose the solutions you're interested in" : 
                         formStep === 2 ? "Pick a convenient time for your free consultation" : 
                         "Tell us how to reach you"}
                      </p>
                    </div>

                    <form onSubmit={handleFormSubmit}>
                      {/* Step 1: Service Selection */}
                      {formStep === 1 && (
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {SOLUTIONS.slice(0, 6).map(solution => (
                              <div 
                                key={solution.id}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                  selectedServices.includes(solution.id)
                                    ? "border-cyan-500 bg-cyan-500/10"
                                    : "border-gray-700 hover:border-cyan-400"
                                }`}
                                onClick={() => toggleServiceSelection(solution.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    selectedServices.includes(solution.id)
                                      ? "bg-cyan-500 text-white"
                                      : "bg-gray-700 text-gray-300"
                                  }`}>
                                    {SERVICE_CATEGORIES.find(c => c.id === solution.category)?.icon}
                                  </div>
                                  <h3 className="font-medium">{solution.title}</h3>
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
                              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              placeholder="Describe any other services you need..."
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => setIsFormVisible(false)}
                              className="border-cyan-500 text-cyan-400 bg-gray-800 hover:bg-cyan-500/10 hover:text-cyan-300 font-semibold px-6 py-3 rounded-lg"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => setFormStep(2)}
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700"
                              disabled={selectedServices.length === 0 && !userDetails.message}
                            >
                              Continue to Schedule
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Schedule Consultation */}
                      {formStep === 2 && (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Consultation Date
                              </label>
                              <div className="bg-gray-700/50 border border-gray-600 rounded-lg">
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
                                    variant={consultationTime === time ? "default" : "outline"}
                                    className={`${
                                      consultationTime === time
                                        ? "bg-cyan-600"
                                        : "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600"
                                    }`}
                                    onClick={() => setConsultationTime(time)}
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-8">
                            <Button
                              variant="outline"
                              onClick={() => setFormStep(1)}
                              className="border-cyan-500 text-cyan-400 bg-gray-800 hover:bg-cyan-500/10 hover:text-cyan-300 font-semibold px-6 py-3 rounded-lg"
                            >
                              Back
                            </Button>
                            <Button
                              onClick={() => setFormStep(3)}
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700"
                              disabled={!consultationDate || !consultationTime}
                            >
                              Continue to Contact
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Contact Information */}
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
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Company name"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => setFormStep(2)}
                              className="border-cyan-500 text-cyan-400 bg-gray-800 hover:bg-cyan-500/10 hover:text-cyan-300 font-semibold px-6 py-3 rounded-lg"
                            >
                              Back
                            </Button>
                            <Button
                              type="submit"
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700"
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
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Request Submitted Successfully!</h3>
                    <p className="text-blue-200 mb-8">
                      Thank you for your interest. Our solutions team will contact you within 24 hours to discuss your requirements.
                    </p>
                    <div className="bg-gray-700/50 rounded-xl p-4 text-left mb-8">
                      <h4 className="font-medium mb-2">Request Summary:</h4>
                      {selectedServices.length > 0 && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">Services:</span>{" "}
                          {selectedServices.map(id => SOLUTIONS.find(s => s.id === id)?.title).join(", ")}
                        </p>
                      )}
                      {consultationDate && consultationTime && (
                        <p className="text-sm text-gray-300">
                          <span className="text-gray-400">Consultation:</span>{" "}
                          {consultationDate.toLocaleDateString()} at {consultationTime}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="border-cyan-500 text-cyan-400 bg-gray-800 hover:bg-cyan-500/10 hover:text-cyan-300 font-semibold px-6 py-3 rounded-lg"
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
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeCaseStudy}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2">{selectedCaseStudy.title}</h2>
                  <p className="text-cyan-300 text-lg">{selectedCaseStudy.client}</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-cyan-400">The Challenge</h3>
                    <p className="text-gray-300">{selectedCaseStudy.challenge}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-cyan-400">Our Solution</h3>
                    <p className="text-gray-300">{selectedCaseStudy.solution}</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-cyan-400">Key Results</h3>
                    <ul className="space-y-3">
                      {selectedCaseStudy.results.map((result: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <Check size={18} className="text-green-400 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-cyan-400">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCaseStudy.technologies.map((tech: string, i: number) => (
                        <span key={i} className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="italic text-gray-300 mb-2">"{selectedCaseStudy.testimonial}"</p>
                    <p className="text-cyan-400 font-medium">— Client Representative</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button 
                    onClick={closeCaseStudy}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600"
                  >
                    Close Case Study
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-800/30 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
            <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
              Schedule a free consultation with our experts to explore how our solutions can drive your success
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg"
              onClick={() => {
                setIsFormVisible(true);
                setFormStep(2);
              }}
            >
              <Calendar className="mr-2" /> Schedule Free Consultation
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage;