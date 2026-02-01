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
