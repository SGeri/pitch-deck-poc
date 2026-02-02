'use client';

import { processTemplateAction } from '@/actions/template/process-template';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertCircle, Download, FileUp, Plus, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface MarkerPromptPair {
    marker: string;
    prompt: string;
}

interface FormValues {
    slideNumber: number;
    generalContext: string;
    prompts: MarkerPromptPair[];
}

export default function TemplatesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ data: string; fileName: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        defaultValues: {
            slideNumber: 1,
            generalContext: '',
            prompts: [{ marker: '', prompt: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'prompts',
    });

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith('.pptx')) {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Please upload a .pptx file');
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile?.name.endsWith('.pptx')) {
            setFile(selectedFile);
            setError(null);
        } else if (selectedFile) {
            setError('Please upload a .pptx file');
        }
    }, []);

    const clearFile = () => {
        setFile(null);
        setResult(null);
    };

    const handleProcess = form.handleSubmit((data) => {
        if (!file) {
            setError('Please upload a template file first');
            return;
        }

        // Filter out empty prompts
        const validPrompts = data.prompts.filter(
            (p) => p.marker.trim() && p.prompt.trim(),
        );

        if (validPrompts.length === 0) {
            setError('Please add at least one marker-prompt pair');
            return;
        }

        setError(null);
        setResult(null);

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('prompts', JSON.stringify(validPrompts));
                formData.append('slideNumber', data.slideNumber.toString());
                formData.append('generalContext', data.generalContext);

                const response = await processTemplateAction(formData);

                if (!response.success || !response.data) {
                    throw new Error(response.error || 'Processing failed');
                }

                setResult({
                    data: response.data,
                    fileName: response.fileName || 'filled-template.pptx',
                });
                toast.success('Template processed successfully!');
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An error occurred';
                setError(message);
                toast.error(message);
            }
        });
    });

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

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Template Filler</h1>
                <p className="text-muted-foreground">
                    Upload a PowerPoint template and fill markers with AI-generated content
                </p>
            </div>

            <form onSubmit={handleProcess} className="space-y-6">
                {/* File Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>1. Upload Template</CardTitle>
                        <CardDescription>
                            Upload a .pptx file with content markers (e.g., [1], [2])
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!file ? (
                            <div
                                className={cn(
                                    'relative rounded-lg border-2 border-dashed p-8 transition-colors',
                                    isDragOver
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25',
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept=".pptx"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                />
                                <div className="flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="rounded-full bg-muted p-4">
                                        <Upload className="size-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium">
                                            Drop your PowerPoint template here
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            or click to browse (.pptx files only)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                                <div className="flex items-center gap-3">
                                    <FileUp className="size-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearFile}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Prompts Configuration Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>2. Configure Prompts</CardTitle>
                        <CardDescription>
                            Add marker-prompt pairs. Each marker (e.g., [1]) will be replaced
                            with AI-generated content based on its prompt.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="slideNumber">Slide Number</FieldLabel>
                                <Input
                                    id="slideNumber"
                                    type="number"
                                    min={1}
                                    className="w-32"
                                    {...form.register('slideNumber', { valueAsNumber: true })}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="generalContext">
                                    General Context
                                </FieldLabel>
                                <Textarea
                                    id="generalContext"
                                    placeholder="Provide general context that applies to all markers (e.g., company info, project details, tone of voice)..."
                                    className="min-h-[120px] resize-y"
                                    {...form.register('generalContext')}
                                />
                                <p className="text-sm text-muted-foreground">
                                    This context will be included in every AI generation request.
                                </p>
                            </Field>

                            <div className="space-y-4">
                                <FieldLabel>Marker-Prompt Pairs</FieldLabel>

                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="flex gap-3 rounded-lg border bg-muted/30 p-4"
                                    >
                                        <div className="w-24 shrink-0">
                                            <Input
                                                placeholder="[1]"
                                                {...form.register(`prompts.${index}.marker`)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Textarea
                                                placeholder="Enter prompt for AI to generate content..."
                                                className="min-h-[100px] resize-y"
                                                {...form.register(`prompts.${index}.prompt`)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ marker: '', prompt: '' })}
                                >
                                    <Plus className="mr-2 size-4" />
                                    Add Marker
                                </Button>
                            </div>
                        </FieldGroup>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending || !file} className="flex-1">
                        {isPending ? (
                            <>
                                <Spinner className="mr-2" />
                                Processing...
                            </>
                        ) : (
                            'Process Template'
                        )}
                    </Button>

                    {result && (
                        <Button type="button" variant="secondary" onClick={handleDownload}>
                            <Download className="mr-2 size-4" />
                            Download Result
                        </Button>
                    )}
                </div>

                {/* Success Result */}
                {result && (
                    <Alert>
                        <Download className="size-4" />
                        <AlertDescription>
                            Your template has been processed successfully. Click the download
                            button to get your filled presentation.
                        </AlertDescription>
                    </Alert>
                )}
            </form>
        </div>
    );
}
