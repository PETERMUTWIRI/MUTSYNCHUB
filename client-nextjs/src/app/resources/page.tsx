
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  SearchIcon, BookOpenIcon, CodeIcon, VideoIcon, LifeBuoyIcon,
  NewspaperIcon, FileTextIcon, LibraryIcon, FilterIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import ResourceCard from '@/components/resources/ResourceCard';
import SearchBar from '@/components/resources/SearchBar';
import CategoryFilter from '@/components/resources/CategoryFilter';
import ResourceTable from '@/components/resources/ResourceTable';
import FeaturedResources from '@/components/resources/FeaturedResources';
import Breadcrumb from '@/components/resources/Breadcrumb';
import { resources } from '@/data/resources';

export default function Resources() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    setActiveCategory(searchParams?.get('category') || 'all');
  }, [searchParams]);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach(resource => {
      counts[resource.category] = (counts[resource.category] || 0) + 1;
    });
    return counts;
  }, []);

  const categories = [
    { id: 'all', name: 'All Resources', icon: <LibraryIcon size={18} />, count: resources.length },
    { id: 'documentation', name: 'Documentation', icon: <BookOpenIcon size={18} />, count: categoryCounts.documentation || 0 },
    { id: 'api', name: 'API Reference', icon: <CodeIcon size={18} />, count: categoryCounts.api || 0 },
    { id: 'guides', name: 'Guides & Tutorials', icon: <VideoIcon size={18} />, count: categoryCounts.guides || 0 },
    { id: 'support', name: 'Support', icon: <LifeBuoyIcon size={18} />, count: categoryCounts.support || 0 },
    { id: 'blog', name: 'Blog', icon: <NewspaperIcon size={18} />, count: categoryCounts.blog || 0 },
    { id: 'whitepapers', name: 'White Papers', icon: <FileTextIcon size={18} />, count: categoryCounts.whitepapers || 0 },
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
            MutSyncHub Knowledge Hub
          </motion.h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Explore 500+ resources to master integrations, analytics, and AI with MutSyncHub’s enterprise-grade solutions.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search documentation, APIs, guides..."
            />
          </div>
          <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/solutions" className="hover:text-cyan-400 transition-colors">Solutions</Link>
            <Link href="/what-we-do-support" className="hover:text-cyan-400 transition-colors">Support</Link>
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
            <Image src="/assets/logos/client-logo-1.png" alt="Client 1" width={120} height={60} className="opacity-80 hover:opacity-100" />
            <Image src="/assets/logos/client-logo-2.png" alt="Client 2" width={120} height={60} className="opacity-80 hover:opacity-100" />
            <Image src="/assets/logos/soc2-logo.png" alt="SOC 2 Certified" width={100} height={50} className="opacity-80 hover:opacity-100" />
            <Image src="/assets/logos/iso27001-logo.png" alt="ISO 27001 Certified" width={100} height={50} className="opacity-80 hover:opacity-100" />
          </div>
        </div>
      </section>

      {/* Resource Metrics Section */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-100 mb-8"
          >
            A Wealth of Knowledge
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700"
            >
              <h3 className="text-4xl font-extrabold text-cyan-400">500+</h3>
              <p className="text-gray-300 mt-2">Resources Available</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700"
            >
              <h3 className="text-4xl font-extrabold text-cyan-400">10,000+</h3>
              <p className="text-gray-300 mt-2">Downloads</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700"
            >
              <h3 className="text-4xl font-extrabold text-cyan-400">50+</h3>
              <p className="text-gray-300 mt-2">Expert Contributors</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
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
          <FeaturedResources />
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-24 bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-100 mb-4">
                  <FilterIcon size={20} /> Filter Resources
                </h2>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center justify-between w-full p-3 rounded-lg text-left transition-all ${
                        activeCategory === category.id
                          ? 'bg-cyan-600/10 text-cyan-400'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      <span className="bg-gray-700 text-gray-300 rounded-full px-2 py-1 text-xs">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['API', 'Integration', 'Dashboard', 'Analytics', 'Security', 'Onboarding', 'Best Practices', 'Data Models'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchTerm(tag)}
                        className="text-xs bg-gray-700 text-gray-300 hover:bg-cyan-600/20 hover:text-cyan-400 px-3 py-1 rounded-full transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Content */}
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-100">
                  {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.name}
                  <span className="text-gray-400 text-lg font-normal ml-2">
                    ({filteredResources.length} items)
                  </span>
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    className={`${viewMode === 'grid' ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'border-gray-600 text-gray-200 hover:bg-gray-800'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    className={`${viewMode === 'table' ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'border-gray-600 text-gray-200 hover:bg-gray-800'}`}
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                </div>
              </div>
              {filteredResources.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
                  <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No resources found</h3>
                  <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="rounded-lg shadow-md bg-gray-800 border border-gray-700 p-6 transition-transform hover:shadow-xl"
                    >
                      <ResourceCard resource={resource} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <ResourceTable resources={filteredResources} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-lg p-8"
          >
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Need More Help?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with our 24/7 support team or dive deeper into our resources for expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-cyan-600 text-white hover:bg-cyan-700 px-8 py-3 rounded-lg"
                asChild
              >
                <Link href="/what-we-do-support">Contact Support</Link>
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-200 hover:bg-gray-800 px-8 py-3 rounded-lg"
                asChild
              >
                <Link href="/resources/api-guide">Download API Guide</Link>
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
