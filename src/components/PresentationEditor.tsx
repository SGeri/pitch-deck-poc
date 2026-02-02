'use client';

import { useState, useCallback } from 'react';
import {
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import SlidePreview from './SlidePreview';
import AIChat from './AIChat';
import { Presentation, ChatMessage } from '@/lib/types';
import { editSlideAction } from '@/actions/presentation/edit-slide';
import { exportPresentationAction } from '@/actions/presentation/export-pptx';

interface PresentationEditorProps {
  presentation: Presentation;
  onBack: () => void;
}

export default function PresentationEditor({
  presentation: initialPresentation,
  onBack,
}: PresentationEditorProps) {
  const [presentation, setPresentation] = useState(initialPresentation);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `I've generated your "${initialPresentation.name}" presentation with ${initialPresentation.slides.length} slides. You can ask me to edit any slide - just select it and describe what you'd like to change.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState(100);

  const currentSlide = presentation.slides[currentSlideIndex];

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    const slideRef = `Slide ${currentSlideIndex + 1}`;

    try {
      const result = await editSlideAction({
        presentation,
        slideIndex: currentSlideIndex,
        userMessage: content,
      });

      if (result.success && result.updatedSlide) {
        // Update the slide in presentation
        setPresentation((prev) => ({
          ...prev,
          slides: prev.slides.map((s, i) => (i === currentSlideIndex ? result.updatedSlide! : s)),
        }));
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: result.aiMessage,
        timestamp: new Date().toISOString(),
        slideRef,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        slideRef,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [currentSlideIndex, presentation]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportPresentationAction(presentation);
      if (result.success && result.data && result.fileName) {
        // Convert base64 to blob and trigger download
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Export failed:', result.error);
        alert('Failed to export presentation. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export presentation. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [presentation]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < presentation.slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-app)]">
      {/* Top Bar */}
      <header className="h-12 bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded hover:bg-[var(--slate-100)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">
              {presentation.name}
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)]">
              <span>{presentation.slides.length} slides</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${presentation.status === 'draft' ? 'bg-amber-400' : 'bg-green-500'}`} />
                {presentation.status === 'draft' ? 'Draft' : 'Final'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
          <button className="p-1.5 rounded hover:bg-[var(--slate-100)] transition-colors">
            <MoreVertical className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Slide Thumbnails */}
        <div className="w-48 bg-[var(--slate-50)] border-r border-[var(--border-default)] overflow-y-auto flex-shrink-0">
          <div className="p-3 space-y-2">
            {presentation.slides.map((slide, index) => (
              <div key={slide.id} className="relative">
                <div className="absolute -left-1 top-1 text-[9px] font-medium text-[var(--text-tertiary)] w-4 text-right">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <SlidePreview
                    slide={slide}
                    isSelected={index === currentSlideIndex}
                    isThumbnail
                    onClick={() => setCurrentSlideIndex(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Main Slide View */}
        <div className="flex-1 flex flex-col bg-[var(--slate-100)] overflow-hidden">
          {/* Slide Navigation */}
          <div className="h-10 px-4 flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToSlide(currentSlideIndex - 1)}
                disabled={currentSlideIndex === 0}
                className="p-1 rounded hover:bg-[var(--slate-100)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
              <span className="text-xs text-[var(--text-secondary)]">
                {currentSlideIndex + 1} / {presentation.slides.length}
              </span>
              <button
                onClick={() => goToSlide(currentSlideIndex + 1)}
                disabled={currentSlideIndex === presentation.slides.length - 1}
                className="p-1 rounded hover:bg-[var(--slate-100)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 rounded hover:bg-[var(--slate-100)] transition-colors"
              >
                <ZoomOut className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
              <span className="text-xs text-[var(--text-secondary)] w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-1 rounded hover:bg-[var(--slate-100)] transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
              <div className="w-px h-4 bg-[var(--border-default)] mx-2" />
              <button className="p-1 rounded hover:bg-[var(--slate-100)] transition-colors">
                <Maximize2 className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>

          {/* Slide Display */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div
              className="shadow-xl transition-transform"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                width: '800px',
              }}
            >
              <SlidePreview slide={currentSlide} />
            </div>
          </div>
        </div>

        {/* Right: AI Chat Panel */}
        <div className="w-80 border-l border-[var(--border-default)] flex-shrink-0">
          <AIChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            currentSlide={currentSlideIndex}
          />
        </div>
      </div>
    </div>
  );
}
