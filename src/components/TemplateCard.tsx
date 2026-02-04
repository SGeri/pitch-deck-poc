'use client';

import { Calendar, ChevronRight, FileText, Layers } from 'lucide-react';

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    slideCount: number;
    version: string;
}

export const CATEGORY_MAP: Record<string, { badge: string }> = {
    FINANCIAL: { badge: 'badge-financial' },
    ESG: { badge: 'badge-esg' },
    INVESTOR: { badge: 'badge-investor' },
    QUARTERLY: { badge: 'badge-quarterly' },
    STRATEGY: { badge: 'badge-strategy' },
    OPERATIONS: { badge: 'badge-operations' },
};

interface TemplateCardProps {
    template: Template;
    onSelect: (template: Template) => void;
}

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
    const categoryInfo = CATEGORY_MAP[template.category] || { badge: 'badge-strategy' };

    return (
        <div
            onClick={() => onSelect(template)}
            className="card card-interactive group p-4"
        >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded bg-[var(--slate-100)]">
                    <FileText className="size-4 text-[var(--slate-600)]" />
                </div>
                <span className={`badge ${categoryInfo.badge}`}>{template.category}</span>
            </div>

            {/* Content */}
            <h3 className="text-heading mb-1 text-[var(--text-primary)] transition-colors group-hover:text-[var(--mol-red)]">
                {template.name}
            </h3>
            <p className="text-caption mb-4 line-clamp-2">{template.description}</p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-[11px] text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1">
                    <Layers className="size-3" />
                    {template.slideCount} slides
                </span>
                <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    v{template.version}
                </span>
            </div>

            {/* Hover Action */}
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs font-medium text-[var(--mol-red)]">
                    Generate Presentation
                </span>
                <ChevronRight className="size-4 text-[var(--mol-red)]" />
            </div>
        </div>
    );
}
