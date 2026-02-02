'use client';

import { FileText, Layers, Calendar, ChevronRight } from 'lucide-react';
import { Template, CATEGORY_MAP } from '@/lib/types';

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const categoryInfo = CATEGORY_MAP[template.category];

  return (
    <div
      onClick={() => onSelect(template)}
      className="card card-interactive p-4 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded bg-[var(--slate-100)] flex items-center justify-center">
          <FileText className="w-4 h-4 text-[var(--slate-600)]" />
        </div>
        <span className={`badge ${categoryInfo.badge}`}>
          {template.category}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-heading text-[var(--text-primary)] mb-1 group-hover:text-[var(--mol-red)] transition-colors">
        {template.name}
      </h3>
      <p className="text-caption line-clamp-2 mb-4">
        {template.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-[11px] text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {template.slideCount} slides
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          v{template.version}
        </span>
      </div>

      {/* Hover Action */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-medium text-[var(--mol-red)]">Generate Presentation</span>
        <ChevronRight className="w-4 h-4 text-[var(--mol-red)]" />
      </div>
    </div>
  );
}
