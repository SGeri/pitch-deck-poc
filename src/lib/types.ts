export type TemplateCategory =
  | 'financial'
  | 'esg'
  | 'investor'
  | 'quarterly'
  | 'strategy'
  | 'operations';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  slideCount: number;
  fields: TemplateField[];
  lastUpdated: string;
  version: string;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  placeholder?: string;
  required: boolean;
  options?: string[];
  hint?: string;
}

// Presentation & Slides
export interface Slide {
  id: string;
  type: 'title' | 'content' | 'chart' | 'table' | 'two-column';
  title: string;
  subtitle?: string;
  content?: string[];
  chartData?: ChartData;
  tableData?: TableData;
  leftContent?: string[];
  rightContent?: string[];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  labels: string[];
  values: number[];
  label: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface Presentation {
  id: string;
  name: string;
  templateId: string;
  slides: Slide[];
  createdAt: string;
  status: 'draft' | 'final';
}

// AI Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  slideRef?: string; // Reference to affected slide
}

export const CATEGORY_MAP: Record<TemplateCategory, { label: string; badge: string }> = {
  'financial': { label: 'Financial Reports', badge: 'badge-red' },
  'esg': { label: 'ESG & Sustainability', badge: 'badge-green' },
  'investor': { label: 'Investor Relations', badge: 'badge-blue' },
  'quarterly': { label: 'Quarterly Results', badge: 'badge-amber' },
  'strategy': { label: 'Strategy', badge: 'badge-default' },
  'operations': { label: 'Operations', badge: 'badge-default' },
};
