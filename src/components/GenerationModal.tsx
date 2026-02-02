'use client';

import { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Check, Download, Loader2, ArrowRight } from 'lucide-react';
import { Template, TemplateField, Presentation, CATEGORY_MAP } from '@/lib/types';
import { generatePresentationAction } from '@/actions/presentation';

interface GenerationModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (presentation: Presentation) => void;
}

type Step = 'form' | 'processing' | 'complete' | 'error';

export default function GenerationModal({ template, isOpen, onClose, onComplete }: GenerationModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [step, setStep] = useState<Step>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [generatedPresentation, setGeneratedPresentation] = useState<Presentation | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (template && isOpen) {
      const initialData: Record<string, string> = {};
      template.fields.forEach((field) => {
        initialData[field.id] = '';
      });
      setFormData(initialData);
      setStep('form');
      setErrors({});
      setProgress(0);
      setGeneratedPresentation(null);
      setGenerationError(null);
    }
  }, [template, isOpen]);

  useEffect(() => {
    if (step === 'processing' && template) {
      // Start progress animation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Cap at 90% until complete
          return prev + Math.random() * 8;
        });
      }, 400);

      // Call the real generation action
      generatePresentationAction({
        templateId: template.id,
        formData,
      })
        .then((result) => {
          clearInterval(interval);
          if (result.success && result.presentation) {
            setGeneratedPresentation(result.presentation);
            setProgress(100);
            setStep('complete');
          } else {
            setGenerationError(result.error || 'Generation failed');
            setStep('error');
          }
        })
        .catch((err) => {
          clearInterval(interval);
          setGenerationError(err instanceof Error ? err.message : 'Generation failed');
          setStep('error');
        });

      return () => clearInterval(interval);
    }
  }, [step, template, formData]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    if (!template) return false;
    const newErrors: Record<string, string> = {};
    template.fields.forEach((field) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = 'Required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setStep('processing');
    }
  };

  const handleOpenEditor = () => {
    if (onComplete && generatedPresentation) {
      onComplete(generatedPresentation);
    }
  };

  const handleDownload = () => {
    console.log('Download:', formData);
    onClose();
  };

  const renderField = (field: TemplateField) => {
    const hasError = !!errors[field.id];
    const baseClass = `form-input ${hasError ? 'error' : ''}`;

    return (
      <div key={field.id} className="space-y-1">
        <label className="form-label">
          {field.label}
          {field.required && <span className="text-[var(--mol-red)] ml-0.5">*</span>}
        </label>

        {field.type === 'textarea' ? (
          <textarea
            className={`${baseClass} form-textarea`}
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        ) : field.type === 'select' ? (
          <select
            className={`${baseClass} form-select`}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            className={baseClass}
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        )}

        {field.hint && !hasError && (
          <p className="text-[11px] text-[var(--text-tertiary)]">{field.hint}</p>
        )}
        {hasError && (
          <p className="text-[11px] text-[var(--error)] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors[field.id]}
          </p>
        )}
      </div>
    );
  };

  if (!template || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--bg-surface)] rounded-lg shadow-xl animate-slide">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[var(--slate-100)] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[var(--slate-600)]" />
            </div>
            <div>
              <h2 className="text-heading text-[var(--text-primary)]">{template.name}</h2>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {CATEGORY_MAP[template.category].label} • {template.slideCount} slides
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--slate-100)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {step === 'form' && (
            <div className="p-5 space-y-4">
              {template.fields.map(renderField)}
            </div>
          )}

          {step === 'processing' && (
            <div className="p-8 flex flex-col items-center">
              <div className="spinner mb-4" style={{ width: 24, height: 24 }} />
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Generating presentation...
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">
                {progress < 30 && 'Parsing input data'}
                {progress >= 30 && progress < 60 && 'Building slides'}
                {progress >= 60 && progress < 90 && 'Formatting content'}
                {progress >= 90 && 'Finalizing'}
              </p>
              <div className="w-full max-w-xs progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {step === 'complete' && generatedPresentation && (
            <div className="p-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#ecfdf5] flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-[#166534]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Presentation ready
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">
                {generatedPresentation.name}.pptx • {generatedPresentation.slides.length} slides
              </p>
              <p className="text-xs text-[var(--text-secondary)] text-center max-w-xs">
                Open in the editor to review and refine your presentation with AI assistance.
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="p-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#fef2f2] flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-[#dc2626]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Generation failed
              </p>
              <p className="text-xs text-[var(--text-secondary)] text-center max-w-xs">
                {generationError || 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border-default)] bg-[var(--slate-50)]">
          {step === 'form' && (
            <>
              <button onClick={onClose} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn btn-primary btn-sm">
                Generate
              </button>
            </>
          )}

          {step === 'processing' && (
            <button disabled className="btn btn-primary btn-sm opacity-60">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing...
            </button>
          )}

          {step === 'complete' && (
            <>
              <button onClick={handleDownload} className="btn btn-secondary btn-sm">
                <Download className="w-3 h-3" />
                Download
              </button>
              <button onClick={handleOpenEditor} className="btn btn-primary btn-sm">
                Open in Editor
                <ArrowRight className="w-3 h-3" />
              </button>
            </>
          )}

          {step === 'error' && (
            <>
              <button onClick={onClose} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button onClick={() => setStep('form')} className="btn btn-primary btn-sm">
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
