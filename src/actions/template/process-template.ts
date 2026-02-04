'use server';

import fs from 'fs';
import path from 'path';

import { generateMarkerContent } from '@/lib/ai';
import { createEngineForJob } from '@/lib/pptx/engine';
import { ensureTmpDir } from '@/lib/pptx/tmp-storage';
import type { MarkerValueMap, TemplateInput } from '@/lib/pptx/types';

export interface MarkerPromptPair {
    marker: string;
    prompt: string;
}

export interface ProcessTemplateInput {
    prompts: MarkerPromptPair[];
    slideNumber: number;
}

export interface ProcessTemplateResult {
    success: boolean;
    data?: string; // Base64 encoded file
    fileName?: string;
    error?: string;
}

export async function processTemplateAction(
    formData: FormData,
): Promise<ProcessTemplateResult> {
    // Generate a temporary job ID for this processing session
    const jobId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
        // Extract file from FormData
        const file = formData.get('file') as File | null;
        const promptsJson = formData.get('prompts') as string | null;
        const slideNumber =
            parseInt(formData.get('slideNumber') as string) || 1;
        const generalContext = (formData.get('generalContext') as string) || '';
        const contentPrompt = (formData.get('contentPrompt') as string) || '';

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        if (!promptsJson) {
            return { success: false, error: 'No prompts provided' };
        }

        const prompts: MarkerPromptPair[] = JSON.parse(promptsJson);

        if (prompts.length === 0) {
            return {
                success: false,
                error: 'At least one marker-prompt pair is required',
            };
        }

        // Validate file type
        if (!file.name.endsWith('.pptx')) {
            return {
                success: false,
                error: 'Invalid file type. Please upload a .pptx file',
            };
        }

        // Save file to tmp directory
        const jobDir = ensureTmpDir(jobId);
        const filePath = path.join(jobDir, file.name);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);

        // Create engine
        const engine = createEngineForJob(jobDir, file.name);

        // Extract markers from the template
        const extraction = await engine.extractTemplateInputs(slideNumber);

        // Build slide context for AI - combine general context and content prompt
        const combinedContext = [
            generalContext,
            contentPrompt
                ? `\n----\n\nTHE ACTUAL CONTENT TO FILL THE TEXTBOXES FROM:\n\n${contentPrompt}`
                : '',
        ]
            .filter(Boolean)
            .join('\n');

        const slideContext = `Slide ${slideNumber} of a PowerPoint presentation. 
The content should be professional and suitable for a presentation.
Markers in the template: ${extraction.inputs.map((i) => i.marker).join(', ')}

${combinedContext ? `Context:\n${combinedContext}` : ''}`;

        // Process all prompts in parallel with AI
        const aiResults = await Promise.all(
            prompts.map(async ({ marker, prompt }) => {
                try {
                    const value = await generateMarkerContent(
                        marker,
                        prompt,
                        slideContext,
                    );
                    return { marker, value, error: null };
                } catch (error) {
                    return {
                        marker,
                        value: null,
                        error:
                            error instanceof Error
                                ? error.message
                                : 'AI generation failed',
                    };
                }
            }),
        );

        // Check for AI errors
        const failedResults = aiResults.filter((r) => r.error);

        if (failedResults.length > 0) {
            return {
                success: false,
                error: `AI generation failed for markers: ${failedResults.map((r) => r.marker).join(', ')}`,
            };
        }

        // Build value map for filling template
        const values: MarkerValueMap = {};
        for (const result of aiResults) {
            if (result.value) {
                values[result.marker] = result.value;
            }
        }

        // Convert extracted inputs to TemplateInput format (only those we have values for)
        const inputs: TemplateInput[] = extraction.inputs.filter(
            (input) => values[input.marker] !== undefined,
        );

        // Fill the template
        const outputFileName = `filled-${file.name}`;
        const outputPath = await engine.fillTemplate(
            slideNumber,
            inputs,
            values,
            outputFileName,
        );

        // Read the output file and encode as base64
        const outputBuffer = fs.readFileSync(outputPath);
        const base64Data = outputBuffer.toString('base64');

        // Cleanup tmp files
        try {
            fs.rmSync(jobDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }

        return {
            success: true,
            data: base64Data,
            fileName: outputFileName,
        };
    } catch (error) {
        console.error('Process template error:', error);

        // Attempt cleanup on error
        try {
            const jobDir = path.join(process.cwd(), 'tmp', 'templates', jobId);
            if (fs.existsSync(jobDir)) {
                fs.rmSync(jobDir, { recursive: true, force: true });
            }
        } catch {
            // Ignore cleanup errors
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to process template',
        };
    }
}
