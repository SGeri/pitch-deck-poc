import { Presentation, ChatMessage } from './types';

export const mockPresentation: Presentation = {
  id: 'pres-001',
  name: 'Q4 2024 Financial Results',
  templateId: 'tpl-quarterly',
  createdAt: '2025-02-01T10:30:00Z',
  status: 'draft',
  slides: [
    {
      id: 'slide-1',
      type: 'title',
      title: 'Q4 2024 Financial Results',
      subtitle: 'MOL Group Quarterly Performance Review',
    },
    {
      id: 'slide-2',
      type: 'content',
      title: 'Executive Summary',
      content: [
        'Revenue increased by 12.5% YoY to EUR 6.2 billion',
        'EBITDA margin improved to 18.3% from 16.8%',
        'Strong performance in Downstream segment',
        'Continued progress on 2030 sustainability targets',
        'Proposed dividend of EUR 1.20 per share',
      ],
    },
    {
      id: 'slide-3',
      type: 'chart',
      title: 'Revenue Performance',
      subtitle: 'Quarterly Revenue (EUR millions)',
      chartData: {
        type: 'bar',
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
        values: [5400, 5800, 5950, 6200],
        label: 'Revenue',
      },
    },
    {
      id: 'slide-4',
      type: 'table',
      title: 'Segment Performance',
      tableData: {
        headers: ['Segment', 'Revenue', 'EBITDA', 'YoY Change'],
        rows: [
          ['Upstream', 'EUR 1,850M', 'EUR 620M', '+8.2%'],
          ['Downstream', 'EUR 3,200M', 'EUR 480M', '+15.1%'],
          ['Consumer Services', 'EUR 1,150M', 'EUR 180M', '+11.3%'],
        ],
      },
    },
    {
      id: 'slide-5',
      type: 'two-column',
      title: 'Strategic Highlights',
      leftContent: [
        'Operational Excellence',
        '• Refinery utilization at 94%',
        '• Cost optimization program on track',
        '• Digital transformation initiatives',
      ],
      rightContent: [
        'Growth Initiatives',
        '• EV charging network expansion',
        '• Renewable energy investments',
        '• New market entries in CEE',
      ],
    },
    {
      id: 'slide-6',
      type: 'content',
      title: 'Outlook for 2025',
      content: [
        'Expected revenue growth of 8-10%',
        'Continued focus on operational efficiency',
        'Accelerated investments in low-carbon solutions',
        'Maintaining strong shareholder returns',
      ],
    },
    {
      id: 'slide-7',
      type: 'chart',
      title: 'EBITDA Trend',
      subtitle: 'EBITDA by Quarter (EUR millions)',
      chartData: {
        type: 'bar',
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
        values: [980, 1050, 1080, 1135],
        label: 'EBITDA',
      },
    },
    {
      id: 'slide-8',
      type: 'content',
      title: 'Thank You',
      subtitle: 'Questions & Discussion',
      content: [
        'Investor Relations Contact:',
        'ir@mol.hu | +36 1 464 1395',
        '',
        'Next earnings call: April 25, 2025',
      ],
    },
  ],
};

export const mockChatHistory: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: 'I\'ve generated your Q4 2024 Financial Results presentation with 8 slides. The presentation includes your revenue data, segment performance, and strategic highlights. How would you like me to adjust it?',
    timestamp: '2025-02-01T10:30:15Z',
  },
];

export const aiResponses: Record<string, { response: string; action?: string }> = {
  'add chart': {
    response: 'I\'ve added a new chart slide showing the EBITDA trend. You can see it as Slide 7 in the presentation.',
    action: 'Added chart slide',
  },
  'change title': {
    response: 'I\'ve updated the title. The change is now reflected in the slide.',
    action: 'Updated title',
  },
  'add bullet': {
    response: 'I\'ve added the new bullet point to the slide content.',
    action: 'Added content',
  },
  'default': {
    response: 'I understand. Let me make that change to the presentation. The update has been applied to the relevant slide.',
    action: 'Applied changes',
  },
};
