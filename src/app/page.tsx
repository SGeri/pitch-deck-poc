'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TemplateSelector from '@/components/TemplateSelector';
import GenerationModal from '@/components/GenerationModal';
import TemplatePickerModal from '@/components/TemplatePickerModal';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import PresentationEditor from '@/components/PresentationEditor';
import { Template, Presentation } from '@/lib/types';
import { Clock, FileText, ChevronRight } from 'lucide-react';

type View = 'templates' | 'editor' | 'history';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);

  const handleSelectTemplate = (template: Template) => {
    setIsPickerOpen(false);
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleUseTemplate = (template: Template) => {
    setIsPreviewOpen(false);
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTemplate(null), 200);
  };

  const handleGenerationComplete = (presentation: Presentation) => {
    setCurrentPresentation(presentation);
    setIsModalOpen(false);
    setCurrentView('editor');
  };

  const handleNewPresentation = () => {
    setIsPickerOpen(true);
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleBackFromEditor = () => {
    setCurrentView('templates');
  };

  // If in editor view with a presentation, show full-screen editor
  if (currentView === 'editor' && currentPresentation) {
    return (
      <div className="flex">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          onNewPresentation={handleNewPresentation}
        />
        <main className="ml-16 flex-1">
          <PresentationEditor
            presentation={currentPresentation}
            onBack={handleBackFromEditor}
          />
        </main>

        {/* Template Picker Modal */}
        <TemplatePickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Template Preview Modal */}
        <TemplatePreviewModal
          template={selectedTemplate}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onUseTemplate={handleUseTemplate}
        />

        {/* Generation Modal */}
        <GenerationModal
          template={selectedTemplate}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onComplete={handleGenerationComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onNewPresentation={handleNewPresentation}
      />

      <main className="ml-16 flex-1">
        {currentView === 'templates' && (
          <TemplateSelector onSelectTemplate={handleSelectTemplate} />
        )}

        {currentView === 'history' && (
          <HistoryView
            onOpenPresentation={(pres) => {
              setCurrentPresentation(pres);
              setCurrentView('editor');
            }}
          />
        )}

        {currentView === 'editor' && !currentPresentation && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--slate-100)] flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No presentation open
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm">
              Select a template to generate a new presentation, or open one from your history.
            </p>
            <button
              onClick={() => setCurrentView('templates')}
              className="btn btn-primary"
            >
              Browse Templates
            </button>
          </div>
        )}
      </main>

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onUseTemplate={handleUseTemplate}
      />

      {/* Generation Modal */}
      <GenerationModal
        template={selectedTemplate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onComplete={handleGenerationComplete}
      />
    </div>
  );
}

// History View Component
function HistoryView({
  onOpenPresentation,
}: {
  onOpenPresentation: (pres: Presentation) => void;
}) {
  // Sample presentations for history demo
  const samplePresentation: Presentation = {
    id: 'pres-sample',
    name: 'Q4 2024 Financial Results',
    templateId: 'tpl-quarterly',
    createdAt: '2025-02-01T10:30:00Z',
    status: 'draft',
    slides: [
      { id: 'slide-1', type: 'title', title: 'Q4 2024 Financial Results', subtitle: 'MOL Group Quarterly Performance Review' },
      { id: 'slide-2', type: 'content', title: 'Executive Summary', content: ['Revenue increased by 12.5% YoY', 'Strong performance across segments', 'Continued sustainability progress'] },
    ],
  };

  const recentPresentations = [
    { ...samplePresentation, id: 'pres-001', createdAt: '2025-02-01T10:30:00Z' },
    { ...samplePresentation, id: 'pres-002', name: 'Annual Report 2024', createdAt: '2025-01-28T14:20:00Z' },
    { ...samplePresentation, id: 'pres-003', name: 'ESG Sustainability Update', createdAt: '2025-01-25T09:15:00Z' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <h1 className="text-display text-[var(--text-primary)] mb-1">Recent Presentations</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Continue working on your recent presentations
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          {recentPresentations.map((pres) => (
            <div
              key={pres.id}
              onClick={() => onOpenPresentation(pres)}
              className="card card-interactive flex items-center gap-4 p-4 cursor-pointer"
            >
              <div className="w-10 h-10 rounded bg-[var(--slate-100)] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{pres.name}</h3>
                <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                  <span>{pres.slides.length} slides</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(pres.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span className={`flex items-center gap-1 ${pres.status === 'draft' ? 'text-amber-600' : 'text-green-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pres.status === 'draft' ? 'bg-amber-400' : 'bg-green-500'}`} />
                    {pres.status === 'draft' ? 'Draft' : 'Final'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
