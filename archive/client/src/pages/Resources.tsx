// src/pages/Resources.tsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  SearchIcon, BookOpenIcon, CodeIcon, 
  VideoIcon, LifeBuoyIcon, NewspaperIcon, 
  FileTextIcon, LibraryIcon, FilterIcon 
} from 'lucide-react';

// Components
import ResourceCard from '../components/resources/ResourceCard';
import SearchBar from '../components/resources/SearchBar';
import CategoryFilter from '../components/resources/CategoryFilter';
import ResourceTable from '../components/resources/ResourceTable';
import FeaturedResources from '../components/resources/FeaturedResources';
import Breadcrumb from '../components/resources/Breadcrumb';

// Mock data (replace with API calls)
import { resources } from '../data/resources';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter resources based on search and category
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === 'all' || 
        resource.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach(resource => {
      counts[resource.category] = (counts[resource.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Categories with icons
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { name: 'Home', href: '/' },
          { name: 'Resources', href: '/resources' }
        ]} />
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
            Knowledge Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Everything you need to integrate, analyze, and optimize with MUTSYNCHUB
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search documentation, APIs, guides..."
            />
          </div>
        </motion.div>

        {/* Featured Resources */}
        <FeaturedResources />
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 rounded-xl shadow-xl p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                <FilterIcon size={20} /> Filter Resources
              </h2>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center justify-between w-full p-3 rounded-lg text-left transition-all ${
                      activeCategory === category.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500 dark:text-blue-400">{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-1 text-xs">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3 text-white drop-shadow-lg">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['API', 'Integration', 'Dashboard', 'Analytics', 'Security', 'Onboarding', 'Best Practices', 'Data Models'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
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
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.name}
                <span className="text-white/70 text-lg font-normal ml-2">
                  ({filteredResources.length} items)
                </span>
              </h2>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white/20 text-white font-bold shadow-lg' : 'text-white/80 hover:bg-white/10'}`}
                >
                  Grid
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-white/20 text-white font-bold shadow-lg' : 'text-white/80 hover:bg-white/10'}`}
                >
                  Table
                </button>
              </div>
            </div>
            
            {filteredResources.length === 0 ? (
              <div className="bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 rounded-xl shadow-xl p-12 text-center">
                <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No resources found
                </h3>
                <p className="text-white/80">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map((resource) => (
                  <div className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 p-6 transition-transform duration-200 hover:scale-105">
                    <ResourceCard key={resource.id} resource={resource} />
                  </div>
                ))}
              </div>
            ) : (
              <ResourceTable resources={filteredResources} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;