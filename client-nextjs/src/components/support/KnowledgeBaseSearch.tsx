// src/components/support/KnowledgeBaseSearch.tsx
import React, { useState } from 'react';
import { Search, BookOpen, ChevronRight } from 'lucide-react';

const KnowledgeBaseSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const categories = [
    { id: 'getting-started', name: 'Getting Started', count: 12 },
    { id: 'api', name: 'API Documentation', count: 8 },
    { id: 'integrations', name: 'Integrations', count: 15 },
    { id: 'billing', name: 'Billing & Accounts', count: 5 },
    { id: 'troubleshooting', name: 'Troubleshooting', count: 10 }
  ];

  const popularArticles = [
    {
      id: 'KB-001',
      title: 'Setting Up Your First Integration',
      description: 'Step-by-step guide to connecting your first data source',
      category: 'Getting Started',
      views: 1243,
      lastUpdated: '2025-07-10'
    },
    {
      id: 'KB-002',
      title: 'API Authentication Methods',
      description: 'Understanding OAuth 2.0 and API key authentication',
      category: 'API Documentation',
      views: 876,
      lastUpdated: '2025-07-15'
    },
    {
      id: 'KB-003',
      title: 'Resolving Data Sync Issues',
      description: 'Common problems and solutions for data synchronization',
      category: 'Troubleshooting',
      views: 921,
      lastUpdated: '2025-06-28'
    }
  ];

  return (
    <div>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3.5 rounded-xl border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Browse by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.map(category => (
            <div 
              key={category.id} 
              className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full px-2 py-1 text-xs">
                  {category.count} articles
                </span>
              </div>
              <button className="mt-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center">
                View all
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Popular Articles</h3>
          <div className="space-y-4">
            {popularArticles.map(article => (
              <div key={article.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-300">
                  <BookOpen size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{article.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{article.description}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{article.category}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{article.views} views</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {new Date(article.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseSearch;