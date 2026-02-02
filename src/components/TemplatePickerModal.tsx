'use client';

import { X, FileText } from 'lucide-react';
import { Template, CATEGORY_MAP } from '@/lib/types';
import { templates } from '@/lib/templates';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export default function TemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplatePickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[var(--bg-surface)] rounded-xl shadow-2xl animate-slide">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              New Presentation
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Select a template to get started
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--slate-100)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Template Grid */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="group text-left p-4 rounded-lg border border-[var(--border-default)] hover:border-[var(--mol-red)] hover:bg-[var(--slate-50)] transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--slate-100)] group-hover:bg-[var(--mol-red)]/10 flex items-center justify-center flex-shrink-0 transition-colors">
                    <FileText className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--mol-red)] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--mol-red)] transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${CATEGORY_MAP[template.category].badge}`}>
                        {CATEGORY_MAP[template.category].label}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {template.slideCount} slides
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
