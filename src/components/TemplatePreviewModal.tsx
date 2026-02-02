'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Template, Slide, CATEGORY_MAP } from '@/lib/types';
import SlidePreview from './SlidePreview';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: Template) => void;
}

// Generate sample preview slides based on template type
function getPreviewSlides(template: Template): Slide[] {
  const baseSlides: Record<string, Slide[]> = {
    'tpl-fin-annual-2024': [
      {
        id: 'preview-1',
        type: 'title',
        title: 'Annual Financial Report',
        subtitle: 'Fiscal Year 2024 • MOL Group',
      },
      {
        id: 'preview-2',
        type: 'content',
        title: 'Executive Summary',
        content: [
          'Record revenue performance across all segments',
          'Strong EBITDA margin improvement year-over-year',
          'Successful execution of strategic initiatives',
          'Continued investment in sustainability',
          'Proposed dividend increase for shareholders',
        ],
      },
      {
        id: 'preview-3',
        type: 'chart',
        title: 'Revenue Performance',
        subtitle: 'Annual Revenue (EUR millions)',
        chartData: {
          type: 'bar',
          labels: ['2021', '2022', '2023', '2024'],
          values: [18500, 21200, 23800, 25000],
          label: 'Revenue',
        },
      },
      {
        id: 'preview-4',
        type: 'table',
        title: 'Key Financial Metrics',
        tableData: {
          headers: ['Metric', '2023', '2024', 'Change'],
          rows: [
            ['Revenue', '€23.8B', '€25.0B', '+5.0%'],
            ['EBITDA', '€4.0B', '€4.2B', '+5.0%'],
            ['Net Income', '€2.3B', '€2.5B', '+8.7%'],
          ],
        },
      },
      {
        id: 'preview-5',
        type: 'two-column',
        title: 'Strategic Highlights',
        leftContent: [
          'Operational Excellence',
          '• Refinery utilization at 94%',
          '• Cost optimization achieved',
          '• Digital transformation progress',
        ],
        rightContent: [
          'Growth Initiatives',
          '• EV charging network expansion',
          '• Renewable energy investments',
          '• New market entries',
        ],
      },
    ],
    'tpl-esg-2024': [
      {
        id: 'preview-1',
        type: 'title',
        title: 'ESG Sustainability Report',
        subtitle: 'Environmental, Social & Governance • 2024',
      },
      {
        id: 'preview-2',
        type: 'content',
        title: 'Sustainability Highlights',
        content: [
          'Carbon emissions reduced by 15% vs baseline',
          'Renewable energy share increased to 25%',
          'Zero safety incidents across operations',
          'Community investment programs expanded',
          'Board diversity targets achieved',
        ],
      },
      {
        id: 'preview-3',
        type: 'chart',
        title: 'Carbon Emission Reduction',
        subtitle: 'CO2 Emissions (Million tonnes)',
        chartData: {
          type: 'bar',
          labels: ['2020', '2021', '2022', '2023', '2024'],
          values: [18.5, 17.2, 16.1, 15.5, 15.0],
          label: 'Emissions',
        },
      },
      {
        id: 'preview-4',
        type: 'two-column',
        title: 'ESG Pillars',
        leftContent: [
          'Environmental',
          '• Net-zero commitment by 2050',
          '• Circular economy initiatives',
          '• Biodiversity protection',
        ],
        rightContent: [
          'Social & Governance',
          '• Employee wellbeing programs',
          '• Supply chain ethics',
          '• Transparent reporting',
        ],
      },
    ],
    'tpl-ir-deck': [
      {
        id: 'preview-1',
        type: 'title',
        title: 'Investor Relations',
        subtitle: 'Company Overview & Investment Highlights',
      },
      {
        id: 'preview-2',
        type: 'content',
        title: 'Investment Highlights',
        content: [
          'Leading integrated energy company in CEE',
          'Diversified portfolio with stable cash flows',
          'Strong balance sheet and credit rating',
          'Attractive dividend yield',
          'Clear energy transition strategy',
        ],
      },
      {
        id: 'preview-3',
        type: 'table',
        title: 'Key Investment Metrics',
        tableData: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Market Cap', '€8.5B'],
            ['Share Price', '€2,850'],
            ['Dividend Yield', '4.2%'],
            ['P/E Ratio', '8.5x'],
          ],
        },
      },
      {
        id: 'preview-4',
        type: 'chart',
        title: 'Share Price Performance',
        subtitle: '12-Month Performance',
        chartData: {
          type: 'line',
          labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
          values: [2650, 2720, 2780, 2810, 2790, 2850],
          label: 'Share Price (€)',
        },
      },
    ],
    'tpl-quarterly': [
      {
        id: 'preview-1',
        type: 'title',
        title: 'Quarterly Results',
        subtitle: 'Q4 2024 Performance Review',
      },
      {
        id: 'preview-2',
        type: 'content',
        title: 'Q4 Highlights',
        content: [
          'Revenue exceeded guidance by 3%',
          'EBITDA margin improved to 18%',
          'Strong performance in Downstream',
          'Cash generation remains robust',
        ],
      },
      {
        id: 'preview-3',
        type: 'chart',
        title: 'Quarterly Revenue Trend',
        chartData: {
          type: 'bar',
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          values: [5400, 5800, 5950, 6200],
          label: 'Revenue (€M)',
        },
      },
      {
        id: 'preview-4',
        type: 'table',
        title: 'Segment Performance',
        tableData: {
          headers: ['Segment', 'Revenue', 'YoY'],
          rows: [
            ['Upstream', '€1.85B', '+8%'],
            ['Downstream', '€3.2B', '+15%'],
            ['Consumer Services', '€1.15B', '+11%'],
          ],
        },
      },
    ],
    'tpl-strategy-2030': [
      {
        id: 'preview-1',
        type: 'title',
        title: 'Strategic Plan 2030',
        subtitle: 'Shaping the Future of Energy',
      },
      {
        id: 'preview-2',
        type: 'content',
        title: 'Our Vision',
        content: [
          'Become a leading sustainable energy company',
          'Carbon neutral operations by 2050',
          'Digital-first customer experience',
          'Innovation-driven growth',
        ],
      },
      {
        id: 'preview-3',
        type: 'two-column',
        title: 'Strategic Pillars',
        leftContent: [
          'Transform Core Business',
          '• Operational excellence',
          '• Portfolio optimization',
          '• Cost leadership',
        ],
        rightContent: [
          'Build Future Growth',
          '• Low-carbon solutions',
          '• New mobility services',
          '• Digital platforms',
        ],
      },
      {
        id: 'preview-4',
        type: 'chart',
        title: 'Revenue Mix Evolution',
        subtitle: 'Target Portfolio 2030',
        chartData: {
          type: 'pie',
          labels: ['Traditional', 'Low-Carbon', 'Services'],
          values: [50, 30, 20],
          label: 'Revenue %',
        },
      },
    ],
    'tpl-ops-update': [
      {
        id: 'preview-1',
        type: 'title',
        title: 'Operations Update',
        subtitle: 'Monthly Performance Review',
      },
      {
        id: 'preview-2',
        type: 'content',
        title: 'Operational Highlights',
        content: [
          'Production volumes on target',
          'Refinery utilization at 92%',
          'Safety record maintained',
          'Key projects on schedule',
        ],
      },
      {
        id: 'preview-3',
        type: 'chart',
        title: 'Production Performance',
        chartData: {
          type: 'bar',
          labels: ['Jan', 'Feb', 'Mar', 'Apr'],
          values: [92, 94, 91, 95],
          label: 'Utilization %',
        },
      },
      {
        id: 'preview-4',
        type: 'table',
        title: 'Project Status',
        tableData: {
          headers: ['Project', 'Status', 'Completion'],
          rows: [
            ['Refinery Upgrade', 'On Track', '75%'],
            ['Pipeline Extension', 'On Track', '60%'],
            ['Solar Farm', 'Ahead', '90%'],
          ],
        },
      },
    ],
  };

  return baseSlides[template.id] || baseSlides['tpl-quarterly'];
}

export default function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!template || !isOpen) return null;

  const previewSlides = getPreviewSlides(template);
  const currentSlide = previewSlides[currentSlideIndex];

  const goToSlide = (index: number) => {
    if (index >= 0 && index < previewSlides.length) {
      setCurrentSlideIndex(index);
    }
  };

  const handleUseTemplate = () => {
    setCurrentSlideIndex(0);
    onUseTemplate(template);
  };

  const handleClose = () => {
    setCurrentSlideIndex(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-[var(--bg-surface)] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {template.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${CATEGORY_MAP[template.category].badge}`}>
                  {CATEGORY_MAP[template.category].label}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {template.slideCount} slides • v{template.version}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleUseTemplate}
              className="btn btn-primary btn-sm"
            >
              Use Template
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[var(--slate-100)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Slide Thumbnails */}
          <div className="w-48 bg-[var(--slate-50)] border-r border-[var(--border-default)] overflow-y-auto flex-shrink-0">
            <div className="p-3 space-y-2">
              {previewSlides.map((slide, index) => (
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

          {/* Main Slide View */}
          <div className="flex-1 flex flex-col bg-[var(--slate-100)]">
            {/* Navigation */}
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
                  {currentSlideIndex + 1} / {previewSlides.length}
                </span>
                <button
                  onClick={() => goToSlide(currentSlideIndex + 1)}
                  disabled={currentSlideIndex === previewSlides.length - 1}
                  className="p-1 rounded hover:bg-[var(--slate-100)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">
                Preview Mode
              </span>
            </div>

            {/* Slide Display */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
              <div className="shadow-xl" style={{ width: '720px' }}>
                <SlidePreview slide={currentSlide} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-default)] bg-[var(--slate-50)]">
          <p className="text-xs text-[var(--text-tertiary)]">
            {template.description}
          </p>
        </div>
      </div>
    </div>
  );
}
