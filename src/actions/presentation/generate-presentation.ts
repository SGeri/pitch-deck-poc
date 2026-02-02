'use server';

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { templates } from '@/lib/templates';
import type { Presentation, Slide } from '@/lib/types';

export interface GeneratePresentationInput {
  templateId: string;
  formData: Record<string, string>;
}

export interface GeneratePresentationResult {
  success: boolean;
  presentation?: Presentation;
  error?: string;
}

const ChartDataSchema = z.object({
  type: z.enum(['bar', 'line', 'pie']),
  labels: z.array(z.string()),
  values: z.array(z.number()),
  label: z.string(),
});

const TableDataSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

const SlideSchema = z.object({
  id: z.string(),
  type: z.enum(['title', 'content', 'chart', 'table', 'two-column']),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.array(z.string()).optional(),
  chartData: ChartDataSchema.optional(),
  tableData: TableDataSchema.optional(),
  leftContent: z.array(z.string()).optional(),
  rightContent: z.array(z.string()).optional(),
});

const PresentationSlidesSchema = z.object({
  slides: z.array(SlideSchema),
});

export async function generatePresentationAction(
  input: GeneratePresentationInput
): Promise<GeneratePresentationResult> {
  try {
    const template = templates.find((t) => t.id === input.templateId);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Build context from form data
    const formContext = Object.entries(input.formData)
      .map(([key, value]) => {
        const field = template.fields.find((f) => f.id === key);
        return `${field?.label || key}: ${value}`;
      })
      .join('\n');

    const systemPrompt = `You are a professional presentation designer for MOL Group, a multinational oil and gas company.
Your task is to generate a complete PowerPoint presentation based on the template and user-provided data.

Template: ${template.name}
Description: ${template.description}
Target slide count: ${template.slideCount}

Guidelines:
- Generate professional, business-appropriate content
- Use the provided data accurately in the slides
- Create a logical flow from introduction to conclusion
- Include appropriate visualizations (charts for numerical data, tables for comparisons)
- Keep bullet points concise (5-7 words each when possible)
- Include a title slide and a closing/thank you slide
- For charts, use realistic proportions based on provided data
- Ensure all IDs are unique (use format: slide-1, slide-2, etc.)

Slide type guidelines:
- 'title': Use for opening slide with presentation name and subtitle
- 'content': Use for bullet point lists (3-6 points)
- 'chart': Use when showing numerical trends or comparisons
- 'table': Use for structured data comparisons
- 'two-column': Use for comparing two aspects (e.g., challenges vs solutions)`;

    const userPrompt = `Generate a presentation with the following input data:

${formContext}

Create ${Math.min(template.slideCount, 8)} slides (we'll keep it concise for the demo).
Include a mix of slide types appropriate for the content.
Make sure numerical data from the input is reflected in charts or tables.`;

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: PresentationSlidesSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    const presentation: Presentation = {
      id: `pres-${Date.now()}`,
      name: template.name,
      templateId: template.id,
      slides: object.slides as Slide[],
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    return { success: true, presentation };
  } catch (error) {
    console.error('Generate presentation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate presentation',
    };
  }
}
