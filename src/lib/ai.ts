import { openai } from '@ai-sdk/openai';
import type { ModelMessage } from 'ai';
import { generateText } from 'ai';

export const aiModel = openai('gpt-5-mini');

export interface GenerateResponseOptions {
    messages: ModelMessage[];
    systemPrompt?: string;
}

export async function generateAIResponse({
    messages,
    systemPrompt,
}: GenerateResponseOptions): Promise<string> {
    const { text } = await generateText({
        model: aiModel,
        messages,
        system:
            systemPrompt ||
            'You are a helpful assistant. Be concise, friendly, and helpful in your responses.',
    });

    return text;
}

/**
 * Generates content for a PowerPoint template marker based on a user prompt.
 * Used to fill in placeholders in PPTX templates.
 */
export async function generateMarkerContent(
    marker: string,
    prompt: string,
    slideContext: string,
): Promise<string> {
    const systemPrompt = `You are a professional content writer for PowerPoint presentations.
Your task is to generate content for a specific placeholder marker in a slide.

Context about the slide:
${slideContext}

Guidelines:
- Generate ONLY the text content, no formatting or markup
- Keep responses concise and suitable for presentation slides
- Use professional language appropriate for business presentations
- Do not include the marker itself in your response
- Match the tone and style implied by the prompt`;

    const { text } = await generateText({
        model: aiModel,
        messages: [
            {
                role: 'user',
                content: `Generate content for marker ${marker} based on this prompt: ${prompt}`,
            },
        ],
        system: systemPrompt,
    });

    return text.trim();
}
