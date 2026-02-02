'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, BarChart3, Leaf, Users, TrendingUp, Target, Cog } from 'lucide-react';
import TemplateCard from './TemplateCard';
import { templates } from '@/lib/templates';
import { Template, TemplateCategory, CATEGORY_MAP } from '@/lib/types';

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
}

const CATEGORY_ICONS: Record<TemplateCategory, React.ElementType> = {
  financial: BarChart3,
  esg: Leaf,
  investor: Users,
  quarterly: TrendingUp,
  strategy: Target,
  operations: Cog,
};

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categories: TemplateCategory[] = ['financial', 'esg', 'investor', 'quarterly', 'strategy', 'operations'];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <h1 className="text-display text-[var(--text-primary)] mb-1">Select a Template</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose a template to start generating your presentation
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 h-9 text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[var(--slate-900)] text-white'
                : 'bg-[var(--slate-100)] text-[var(--text-secondary)] hover:bg-[var(--slate-200)]'
            }`}
          >
            All
          </button>
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-[var(--slate-900)] text-white'
                    : 'bg-[var(--slate-100)] text-[var(--text-secondary)] hover:bg-[var(--slate-200)]'
                }`}
              >
                <Icon className="w-3 h-3" />
                {CATEGORY_MAP[category].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTemplates.length > 0 ? (
          <>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelectTemplate}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--slate-100)] flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No templates found</p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
