'use server';

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { Presentation, Slide } from '@/lib/types';

export interface EditSlideInput {
  presentation: Presentation;
  slideIndex: number;
  userMessage: string;
}

export interface EditSlideResult {
  success: boolean;
  updatedSlide?: Slide;
  aiMessage: string;
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

const SlideEditResponseSchema = z.object({
  updatedSlide: z.object({
    id: z.string(),
    type: z.enum(['title', 'content', 'chart', 'table', 'two-column']),
    title: z.string(),
    subtitle: z.string().optional(),
    content: z.array(z.string()).optional(),
    chartData: ChartDataSchema.optional(),
    tableData: TableDataSchema.optional(),
    leftContent: z.array(z.string()).optional(),
    rightContent: z.array(z.string()).optional(),
  }),
  responseMessage: z.string().describe('A brief message explaining what changes were made'),
});

export async function editSlideAction(input: EditSlideInput): Promise<EditSlideResult> {
  try {
    const { presentation, slideIndex, userMessage } = input;
    const currentSlide = presentation.slides[slideIndex];

    if (!currentSlide) {
      return {
        success: false,
        aiMessage: 'Slide not found',
        error: 'Invalid slide index',
      };
    }

    const systemPrompt = `You are a professional presentation editor for MOL Group.
Your task is to modify a specific slide based on user instructions.

Current presentation: ${presentation.name}
You are editing Slide ${slideIndex + 1} of ${presentation.slides.length}

Guidelines:
- Make only the changes the user requests
- Preserve the slide's existing structure unless asked to change it
- Keep content professional and business-appropriate
- Maintain the slide ID exactly as provided
- If the user asks for something impossible (e.g., add a chart to a title slide), explain what you can do instead
- Keep bullet points concise

Current slide data:
${JSON.stringify(currentSlide, null, 2)}`;

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: SlideEditResponseSchema,
      system: systemPrompt,
      prompt: userMessage,
    });

    return {
      success: true,
      updatedSlide: object.updatedSlide as Slide,
      aiMessage: object.responseMessage,
    };
  } catch (error) {
    console.error('Edit slide error:', error);
    return {
      success: false,
      aiMessage: 'Sorry, I encountered an error while editing the slide. Please try again.',
      error: error instanceof Error ? error.message : 'Failed to edit slide',
    };
  }
}
