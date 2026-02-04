'use client';

import { processTemplateAction } from '@/actions/template/process-template';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import {
    Check,
    Download,
    Eye,
    Loader2,
    MessageSquare,
    Play,
    Send,
    Sparkles,
    Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
    MOL_CONTENT_PROMPT,
    MOL_GENERAL_CONTEXT,
    MOL_QUARTERLY_SLIDE_1_PRESET,
    MOL_QUARTERLY_SLIDE_2_PRESET,
    MOL_QUARTERLY_SLIDE_3_PRESET,
    MOL_QUARTERLY_SLIDE_4_PRESET,
} from './constants';

// Slide presets for iterative processing
const SLIDE_PRESETS = [
    MOL_QUARTERLY_SLIDE_1_PRESET,
    MOL_QUARTERLY_SLIDE_2_PRESET,
    MOL_QUARTERLY_SLIDE_3_PRESET,
    MOL_QUARTERLY_SLIDE_4_PRESET,
];

// Helper function to convert base64 back to File
const base64ToFile = (base64: string, fileName: string): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    return new File([blob], fileName, { type: blob.type });
};

// Processing status type
interface ProcessingStatus {
    isProcessing: boolean;
    currentSlide: number;
    totalSlides: number;
    completedSlides: number[];
}

export default function TemplatesPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Template file state
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [templateDragOver, setTemplateDragOver] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const thumbnailUrlRef = useRef<string | null>(null);

    // Context state
    const [context, setContext] = useState(MOL_GENERAL_CONTEXT);

    // Content prompt state (replaces data file upload)
    const [contentPrompt, setContentPrompt] = useState(MOL_CONTENT_PROMPT);

    // Processing status for multi-slide generation
    const [processingStatus, setProcessingStatus] =
        useState<ProcessingStatus | null>(null);

    // Result state
    const [result, setResult] = useState<{
        data: string;
        fileName: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Chat state
    const [chatMessages, setChatMessages] = useState<
        { role: 'user' | 'assistant'; content: string }[]
    >([]);
    const [chatInput, setChatInput] = useState('');

    // Extract thumbnail from PPTX file
    const extractThumbnail = useCallback(async (file: File) => {
        // Revoke previous thumbnail URL if exists
        if (thumbnailUrlRef.current) {
            URL.revokeObjectURL(thumbnailUrlRef.current);
            thumbnailUrlRef.current = null;
        }

        try {
            const JSZip = (await import('jszip')).default;
            const arrayBuffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);

            // Try to find the thumbnail in common locations
            const thumbnailPaths = [
                'docProps/thumbnail.jpeg',
                'docProps/thumbnail.jpg',
                'docProps/thumbnail.png',
            ];

            for (const path of thumbnailPaths) {
                const thumbnailFile = zip.file(path);
                if (thumbnailFile) {
                    const blob = await thumbnailFile.async('blob');
                    const url = URL.createObjectURL(blob);
                    thumbnailUrlRef.current = url;
                    setThumbnailUrl(url);
                    return;
                }
            }

            // No thumbnail found, keep null
            setThumbnailUrl(null);
        } catch (err) {
            console.error('Failed to extract thumbnail:', err);
            setThumbnailUrl(null);
        }
    }, []);

    // Navigation handlers
    const handleNavigate = (view: 'templates' | 'editor' | 'history') => {
        if (view === 'templates') {
            router.push('/select-template');
        }
    };

    const handleNewPresentation = () => {
        router.push('/select-template');
    };

    // Template file handlers
    const handleTemplateDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setTemplateDragOver(true);
    }, []);

    const handleTemplateDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setTemplateDragOver(false);
    }, []);

    const handleTemplateDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setTemplateDragOver(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile?.name.endsWith('.pptx')) {
                setTemplateFile(droppedFile);
                setError(null);
                extractThumbnail(droppedFile);
                toast.success('Template uploaded');
            } else {
                toast.error('Please upload a .pptx file');
            }
        },
        [extractThumbnail],
    );

    const handleTemplateSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile?.name.endsWith('.pptx')) {
                setTemplateFile(selectedFile);
                setError(null);
                extractThumbnail(selectedFile);
                toast.success('Template uploaded');
            } else if (selectedFile) {
                toast.error('Please upload a .pptx file');
            }
        },
        [extractThumbnail],
    );

    // Generate handler - iterates through all 4 slides
    const handleGenerate = () => {
        if (!templateFile) {
            toast.error('Please upload a template file first');
            return;
        }

        setError(null);
        setResult(null);
        setProcessingStatus({
            isProcessing: true,
            currentSlide: 1,
            totalSlides: SLIDE_PRESETS.length,
            completedSlides: [],
        });

        startTransition(async () => {
            try {
                // Combine general context with content prompt
                const fullContext = `${context}\n\n--- CONTENT DATA ---\n\n${contentPrompt}`;

                let currentFile: File = templateFile;

                // Iterate through all slides
                for (let i = 0; i < SLIDE_PRESETS.length; i++) {
                    const slide = SLIDE_PRESETS[i];
                    const slideNumber = slide.slideNumber;

                    // Update processing status
                    setProcessingStatus((prev) => ({
                        isProcessing: true,
                        currentSlide: slideNumber,
                        totalSlides: SLIDE_PRESETS.length,
                        completedSlides: prev?.completedSlides || [],
                    }));

                    console.log(`Processing slide ${slideNumber}...`);

                    const formData = new FormData();
                    formData.append('file', currentFile);
                    formData.append('generalContext', fullContext);
                    formData.append('prompts', JSON.stringify(slide.prompts));
                    formData.append('slideNumber', slideNumber.toString());

                    const response = await processTemplateAction(formData);

                    if (!response.success || !response.data) {
                        throw new Error(
                            response.error ||
                                `Processing slide ${slideNumber} failed`,
                        );
                    }

                    console.log(`Slide ${slideNumber} completed successfully`);

                    // Update completed slides
                    setProcessingStatus((prev) => ({
                        isProcessing: true,
                        currentSlide: slideNumber,
                        totalSlides: SLIDE_PRESETS.length,
                        completedSlides: [
                            ...(prev?.completedSlides || []),
                            slideNumber,
                        ],
                    }));

                    // Convert result to File for next iteration (if not last slide)
                    if (i < SLIDE_PRESETS.length - 1) {
                        currentFile = base64ToFile(
                            response.data,
                            response.fileName ||
                                `slide-${slideNumber}-filled.pptx`,
                        );
                    } else {
                        // Last slide - set final result
                        setResult({
                            data: response.data,
                            fileName:
                                response.fileName || 'filled-template.pptx',
                        });
                    }
                }

                setProcessingStatus(null);
                toast.success('All slides generated successfully!');
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'An error occurred';
                setError(message);
                setProcessingStatus(null);
                toast.error(message);
            }
        });
    };

    // Download handler
    const handleDownload = () => {
        if (!result) return;

        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    // Chat handler (placeholder for now)
    const handleSendChat = () => {
        if (!chatInput.trim()) return;

        setChatMessages((prev) => [
            ...prev,
            { role: 'user', content: chatInput },
        ]);
        setChatInput('');

        // Simulate AI response (placeholder)
        setTimeout(() => {
            setChatMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        'I can help you customize the presentation. What specific changes would you like to make?',
                },
            ]);
        }, 1000);
    };

    return (
        <div className="flex h-screen bg-[#FAFAFA]">
            {/* Sidebar */}
            <Sidebar
                currentView="editor"
                onNavigate={handleNavigate}
                onNewPresentation={handleNewPresentation}
            />

            {/* Main Content */}
            <main className="ml-16 flex flex-1 overflow-hidden">
                {/* Left Panel - Template & Data */}
                <div className="flex flex-1 flex-col border-r border-[var(--border-default)] bg-white">
                    {/* Header */}
                    <div className="border-b border-[var(--border-default)] px-6 py-4">
                        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                            Template Editor
                        </h1>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Configure and generate your presentation
                        </p>
                    </div>

                    <div className="flex-1 space-y-6 overflow-auto p-6">
                        {/* 1. Template File Section */}
                        <section>
                            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                                Template File
                            </h2>
                            {!templateFile ? (
                                <div
                                    className={cn(
                                        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                                        templateDragOver
                                            ? 'border-[var(--mol-red)] bg-red-50'
                                            : 'border-[var(--slate-300)] hover:border-[var(--slate-400)]',
                                    )}
                                    onDragOver={handleTemplateDragOver}
                                    onDragLeave={handleTemplateDragLeave}
                                    onDrop={handleTemplateDrop}
                                >
                                    <input
                                        type="file"
                                        accept=".pptx"
                                        onChange={handleTemplateSelect}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                    />
                                    <div className="mb-3 flex size-12 items-center justify-center rounded-lg bg-[var(--slate-100)]">
                                        <Upload className="size-6 text-[var(--slate-500)]" />
                                    </div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                        Upload Template
                                    </p>
                                    <p className="text-xs text-[var(--text-tertiary)]">
                                        .pptx files only
                                    </p>
                                </div>
                            ) : (
                                <div className="group flex items-stretch overflow-hidden rounded-xl border border-[var(--border-default)] bg-white transition-shadow hover:shadow-md">
                                    {/* Left: Slide Preview Thumbnail */}
                                    <div className="relative w-[220px] shrink-0 border-r border-[var(--border-default)] bg-[var(--slate-100)]">
                                        <div className="aspect-[16/9] w-full">
                                            {thumbnailUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={thumbnailUrl}
                                                    alt="Slide preview"
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src="/mol-slide-preview.png"
                                                    alt="Slide preview"
                                                    className="h-full w-full object-contain"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: File Info & Actions */}
                                    <div className="flex flex-1 flex-col justify-center gap-3 p-4">
                                        {/* Template Name */}
                                        <div>
                                            <p className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                                                {templateFile.name.replace(
                                                    '.pptx',
                                                    '',
                                                )}
                                            </p>
                                            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                                                PowerPoint Template
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() =>
                                                    toast.info(
                                                        'Preview coming soon',
                                                    )
                                                }
                                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-default)] bg-white px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition-all hover:border-[var(--mol-red)] hover:bg-[var(--mol-red)]/5 hover:text-[var(--mol-red)]"
                                            >
                                                <Eye className="size-3.5" />
                                                Preview
                                            </button>
                                            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent bg-[var(--slate-100)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--slate-200)] hover:text-[var(--text-primary)]">
                                                <Upload className="size-3.5" />
                                                Change
                                                <input
                                                    type="file"
                                                    accept=".pptx"
                                                    onChange={
                                                        handleTemplateSelect
                                                    }
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 2. Context Section */}
                        <section>
                            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                                AI Context
                            </h2>
                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Provide context for AI generation..."
                                className="h-48 w-full resize-none rounded-lg border border-[var(--border-default)] bg-white p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--mol-red)] focus:outline-none focus:ring-2 focus:ring-[var(--mol-red)]/20"
                            />
                            <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
                                This context will guide the AI when generating
                                content.
                            </p>
                        </section>

                        {/* 3. Content Data Section */}
                        <section>
                            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                                Update Data
                            </h2>
                            <textarea
                                value={contentPrompt}
                                onChange={(e) =>
                                    setContentPrompt(e.target.value)
                                }
                                placeholder="Provide the quarterly data and content updates..."
                                className="h-64 w-full resize-none rounded-lg border border-[var(--border-default)] bg-white p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--mol-red)] focus:outline-none focus:ring-2 focus:ring-[var(--mol-red)]/20"
                            />
                            <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
                                Enter the quarterly financial data and
                                operational updates for the presentation.
                            </p>
                        </section>

                        {/* Error Display */}
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Processing Progress Indicator */}
                        {processingStatus && (
                            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--slate-50)] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                                        Generating Presentation
                                    </h3>
                                    <span className="text-xs text-[var(--text-tertiary)]">
                                        Slide {processingStatus.currentSlide} of{' '}
                                        {processingStatus.totalSlides}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[var(--slate-200)]">
                                    <div
                                        className="h-full bg-[var(--mol-red)] transition-all duration-300"
                                        style={{
                                            width: `${(processingStatus.completedSlides.length / processingStatus.totalSlides) * 100}%`,
                                        }}
                                    />
                                </div>

                                {/* Slide Status List */}
                                <div className="grid grid-cols-4 gap-2">
                                    {SLIDE_PRESETS.map((slide) => {
                                        const isCompleted =
                                            processingStatus.completedSlides.includes(
                                                slide.slideNumber,
                                            );
                                        const isCurrent =
                                            processingStatus.currentSlide ===
                                                slide.slideNumber &&
                                            !isCompleted;

                                        return (
                                            <div
                                                key={slide.slideNumber}
                                                className={cn(
                                                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium',
                                                    isCompleted &&
                                                        'bg-green-100 text-green-700',
                                                    isCurrent &&
                                                        'bg-[var(--mol-red)]/10 text-[var(--mol-red)]',
                                                    !isCompleted &&
                                                        !isCurrent &&
                                                        'bg-[var(--slate-100)] text-[var(--text-tertiary)]',
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <Check className="size-3.5" />
                                                ) : isCurrent ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <div className="size-3.5" />
                                                )}
                                                Slide {slide.slideNumber}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isPending || !templateFile}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--mol-red)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--mol-red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {processingStatus
                                        ? `Processing Slide ${processingStatus.currentSlide}...`
                                        : 'Generating...'}
                                </>
                            ) : (
                                <>
                                    <Play className="size-4" />
                                    Generate All 4 Slides
                                </>
                            )}
                        </button>

                        {/* Success Message */}
                        {result && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                <p className="text-sm font-medium text-green-700">
                                    Presentation generated successfully!
                                </p>
                                <button
                                    onClick={handleDownload}
                                    className="mt-2 flex items-center gap-1.5 text-sm font-medium text-green-700 underline"
                                >
                                    <Download className="size-4" />
                                    Download {result.fileName}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Chat */}
                <div className="flex flex-1 flex-col bg-white">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-6 py-4">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--mol-red)]/10">
                            <MessageSquare className="size-5 text-[var(--mol-red)]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                                AI Assistant
                            </h2>
                            <p className="text-xs text-[var(--text-tertiary)]">
                                Ask questions or request changes
                            </p>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-auto p-6">
                        {chatMessages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[var(--slate-100)]">
                                    <Sparkles className="size-8 text-[var(--slate-400)]" />
                                </div>
                                <h3 className="mb-1 text-sm font-medium text-[var(--text-primary)]">
                                    Start a conversation
                                </h3>
                                <p className="max-w-xs text-xs text-[var(--text-tertiary)]">
                                    Ask questions about your presentation or
                                    request specific changes to the generated
                                    content.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chatMessages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            'max-w-[80%] rounded-lg p-3 text-sm',
                                            msg.role === 'user'
                                                ? 'ml-auto bg-[var(--mol-red)] text-white'
                                                : 'bg-[var(--slate-100)] text-[var(--text-primary)]',
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-[var(--border-default)] p-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSendChat()
                                }
                                placeholder="Type your message..."
                                className="flex-1 rounded-lg border border-[var(--border-default)] bg-white px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--mol-red)] focus:outline-none focus:ring-2 focus:ring-[var(--mol-red)]/20"
                            />
                            <button
                                onClick={handleSendChat}
                                disabled={!chatInput.trim()}
                                className="flex size-10 items-center justify-center rounded-lg bg-[var(--mol-red)] text-white transition-colors hover:bg-[var(--mol-red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
