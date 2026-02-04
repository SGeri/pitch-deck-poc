'use client';

import Sidebar from '@/components/Sidebar';
import TemplateCard, { Template } from '@/components/TemplateCard';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    Cog,
    Leaf,
    Search,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Template data matching the screenshot
const templates: Template[] = [
    {
        id: 'annual-financial',
        name: 'Annual Financial Report',
        description:
            'Comprehensive annual report with financial highlights, KPIs, and year-over-year analysis.',
        category: 'FINANCIAL',
        slideCount: 24,
        version: '2.1',
    },
    {
        id: 'esg-sustainability',
        name: 'ESG Sustainability Report',
        description:
            'Environmental, Social, and Governance metrics with sustainability initiatives.',
        category: 'ESG',
        slideCount: 32,
        version: '1.4',
    },
    {
        id: 'investor-relations',
        name: 'Investor Relations Deck',
        description:
            'Investor presentation with company overview and investment highlights.',
        category: 'INVESTOR',
        slideCount: 18,
        version: '3.0',
    },
    {
        id: 'quarterly-results',
        name: 'Quarterly Results',
        description: 'Quarterly earnings with segment performance and guidance.',
        category: 'QUARTERLY',
        slideCount: 16,
        version: '2.3',
    },
    {
        id: 'strategic-plan',
        name: 'Strategic Plan 2030',
        description:
            'Long-term strategic planning with vision and transformation roadmap.',
        category: 'STRATEGY',
        slideCount: 28,
        version: '1.2',
    },
    {
        id: 'operations-update',
        name: 'Operations Update',
        description:
            'Operational performance with production data and project status.',
        category: 'OPERATIONS',
        slideCount: 14,
        version: '1.8',
    },
];

const filterCategories = [
    { id: 'all', label: 'All', icon: null },
    { id: 'financial', label: 'Financial Reports', icon: BarChart3 },
    { id: 'esg', label: 'ESG & Sustainability', icon: Leaf },
    { id: 'investor', label: 'Investor Relations', icon: Users },
    { id: 'quarterly', label: 'Reports', icon: TrendingUp },
    { id: 'strategy', label: 'Strategy', icon: Target },
    { id: 'operations', label: 'Operations', icon: Cog },
];

export default function SelectTemplatePage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            activeFilter === 'all' ||
            template.category.toLowerCase() === activeFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const handleTemplateSelect = (template: Template) => {
        router.push('/templates');
    };

    const handleNavigate = (view: 'templates' | 'editor' | 'history') => {
        if (view === 'templates') {
            router.push('/select-template');
        } else if (view === 'editor') {
            router.push('/templates');
        }
    };

    const handleNewPresentation = () => {
        router.push('/templates');
    };

    return (
        <div className="flex h-screen bg-[#FAFAFA]">
            {/* Sidebar */}
            <Sidebar
                currentView="templates"
                onNavigate={handleNavigate}
                onNewPresentation={handleNewPresentation}
            />

            {/* Main Content */}
            <main className="ml-16 flex-1 overflow-auto px-8 py-8">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-[#0F172A]">
                            Select a Template
                        </h1>
                        <p className="mt-1 text-[#64748B]">
                            Choose a template to start generating your presentation
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {filterCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveFilter(category.id)}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                                    activeFilter === category.id
                                        ? 'bg-[#0F172A] text-white'
                                        : 'border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                                )}
                            >
                                {category.icon && <category.icon className="size-4" />}
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {/* Templates Count */}
                    <p className="mb-4 text-sm text-[#94A3B8]">
                        {filteredTemplates.length} templates available
                    </p>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onSelect={handleTemplateSelect}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
