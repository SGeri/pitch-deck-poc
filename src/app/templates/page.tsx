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
import { AlertCircle, Download, FileUp, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
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

const AFR_PRESET: FormValues = {
    slideNumber: 2,
    generalContext: `KONTEXTUS – AFR PROJEKT STÁTUSZ FRISSÍTÉS

Egy PowerPoint státusz riport diájához kell szöveget generálnod az AFR (AI-based Financial/Document Review) POC projektről a MOL számára.

A dia minden héten frissül, és négy fő szövegdobozt + egy mérföldkő táblázatot + egy dátum mezőt tartalmaz:

1) Általános státusz – executive szintű, 2 bulletpontos, összefoglaló leírás a projekt állapotáról.
2) Múlt héten elvégzett munka – 3 rövid bulletpont arról, hogy mi történt ténylegesen az előző héten.
3) Fő feladatok a hétre – 3 rövid bulletpont a következő hét prioritásairól.
4) Nyitott kérdések és kockázatok – max. 2 nagyon rövid bulletpont a lényegi nyitott témákról.
5) Mérföldkő / fő leszállítandó táblázat – 6 soros táblázat, soronként:
   - készültségi százalék (0–100 közötti egész szám),
   - max. 3 szavas komment.
   A sorok fixek, az alábbi logikai területekhez tartoznak:
   1. sor: UX és UI alapok definiálása
   2. sor: Alkalmazás- és adat alapstruktúra kialakítása
   3. sor: Dokumentum-feltöltés és -kezelés modul implementálása
   4. sor: AI-alapú dokumentum-feldarabolás (chunking) implementálása
   5. sor: Validációs engine és szabálykészlet (6 kategória) implementálása
   6. sor: AI workflow és prompting optimalizálása
6) Dátum mező – a riport generálásának napja, fix formátumban:
   "DÁTUM: ÉÉÉÉ.HH.NN."

STÍLUS ÉS HANGNEM
- Mindig magyar nyelven fogalmazz.
- Rövid, tömör, üzleti tanácsadói hangnem, fölösleges mellébeszélés nélkül.
- Főleg jelen időben, harmadik személyben írj (pl. "A rendszer támogatja...", "A csapat befejezte...").
- Executive szint: a lényegre koncentrálj, ne menj technikai részletekbe a kelleténél jobban.
- Kerüld az érzelmi, marketinges túlzásokat; maradj tárgyilagos, de pozitív/megoldásfókuszú.
- Tartsd tiszteletben a megadott szókereteket (max. szó- és bulletpont-szám mezőnként).

KOHERENCIA
- A "Múlt héten elvégzett munka" mező rezonáljon a megelőző heti "Fő feladatok a hétre" mező tartalmára, ha az információ rendelkezésre áll.
- A "Fő feladatok a hétre" szorosan a felhasználó által megadott aktuális fókuszokra épüljön.
- A "Nyitott kérdések és kockázatok" csak valóban lényeges, még nem lezárt témákat tartalmazzon; ha nincs ilyen, ezt röviden jelezd.
- A mérföldkő táblázat készültségi százalékai legyenek összhangban a szövegdobozokkal és a projekt általános állapotával.
- Mindig ügyelj arra, hogy a teljes dia tartalma logikus, egymással összhangban álló képet adjon a projektről.`,
    prompts: [
        {
            marker: '[1]',
            prompt: `Feladatod az "Általános státusz" szövegdobozt kitölteni az AFR POC projekthez.

– Írj PONTOSAN 2 bulletpontot.
– Minden bullet legfeljebb kb. 15 szóból álljon.
– Executive szinten foglald össze:
  • hol tart a projekt összességében,
  • mi a fő fókusz jelenleg,
  • milyen fontos mérföldkő(ke)t ért el a csapat.
– Maradj tárgyilagos, üzleti tanácsadói hangnemben.
– Csak magyarul írj, a bulletokat "-" jellel kezdve.

Használd fel a felhasználó által megadott aktuális státuszinformációkat, és ügyelj arra, hogy a szöveg összhangban legyen a mérföldkő táblázat készültségével.`,
        },
        {
            marker: '[2]',
            prompt: `Feladatod a "Múlt héten elvégzett munka" szövegdobozt kitölteni.

– Írj legfeljebb 3 bulletpontot (ha kevés dolog történt, elég 1–2 is).
– A HÁROM bullet ÖSSZESEN legfeljebb kb. 30 szóból álljon.
– Csak ténylegesen megtörtént, lezárt vagy érdemben előrehaladt munkákat írj ide.
– Lehetőleg csengjen össze az előző heti "Fő feladatok a hétre" mező tartalmával, ha az információ rendelkezésre áll.
– Csak magyarul írj, a bulletokat "-" jellel kezdve.
– Fogalmazz tömören, múlt időben (pl. "Befejeztük…", "Finomhangoltuk…").

A fókusz legyen a legfontosabb 1–3 eredményen, ne részletezd túl.`,
        },
        {
            marker: '[3]',
            prompt: `Feladatod a "Fő feladatok a hétre" szövegdobozt kitölteni.

– Írj legfeljebb 3 bulletpontot.
– A HÁROM bullet ÖSSZESEN legfeljebb kb. 30 szóból álljon.
– Csak a következő hét konkrét, legfontosabb prioritásaira fókuszálj (pl. tesztek, finomhangolás, döntések, integrációk).
– Csak magyarul írj, a bulletokat "-" jellel kezdve.
– Jelen időt vagy jövő időt használj (pl. "Futtatjuk…", "Előkészítjük…", "Véglegesítjük…").
– A tartalom alapja a felhasználó által megadott aktuális fókusz- és feladatlista.

Kerüld a túl általános megfogalmazást; legyen egyértelmű, mit csinál a csapat a héten.`,
        },
        {
            marker: '[4]',
            prompt: `Feladatod a "Nyitott kérdések és kockázatok" szövegdobozt kitölteni.

– Írj legfeljebb 2 bulletpontot.
– A KÉT bullet EGYÜTT legfeljebb kb. 15 szóból álljon.
– Csak valóban lényeges, még nem lezárt kérdéseket vagy kockázatokat emelj ki.
– Ha nincsenek érdemi nyitott kérdések/kockázatok, írj EGY rövid bulletet, pl.:
  "- Nincs kiemelt nyitott kérdés vagy kockázat."
– Csak magyarul írj, a bulletokat "-" jellel kezdve.
– Fogalmazz nagyon tömören, kulcsszószerűen, de érthetően.

Az itt szereplő elemek legyenek konzisztenssek az általános státusszal és a heti feladatokkal.`,
        },
        {
            marker: '[5]',
            prompt: `Feladatod a "UX és UI alapok definiálása" nevű mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot. (pl. "75%").
– A szám tükrözze, hogy a UX/UI alapok (folyamatok, képernyők, vizuális keretrendszer) milyen arányban tekinthetők késznek.
– Vedd figyelembe az általános státuszt, a múlt heti munkákat és az aktuális heti fókuszt.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[6]',
            prompt: `Feladatod egy rövid kommentet adni a "UX és UI alapok definiálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar nyelvű kommentet adj.
– Fogalmazz állapotleíróan (pl. "Kész", "Majdnem kész", "Finomhangolás alatt", "Folyamatban").
– Ne használj írásjeleket, számokat.

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[7]',
            prompt: `Feladatod az "Alkalmazás- és adat alapstruktúra kialakítása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze, hogy a fogalmi adatmodell, entitások, kapcsolatok és riport/audit mezők mennyire tekinthetők késznek.
– Vedd figyelembe a státusz szövegdobozokat és a felhasználó által jelzett előrehaladást.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[8]',
            prompt: `Feladatod egy rövid kommentet adni az "Alkalmazás- és adat alapstruktúra kialakítása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Legyen állapotleíró és tömör (pl. "Adatmodell kész", "Finomhangolás alatt").

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[9]',
            prompt: `Feladatod a "Dokumentum-feltöltés és -kezelés modul implementálása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze, mennyire működik teljeskörűen a feltöltés, metaadat-kezelés, listázás és státuszkövetés.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[10]',
            prompt: `Feladatod egy rövid kommentet adni a "Dokumentum-feltöltés és -kezelés modul implementálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Lehet pl. "Teljes funkcionalitás", "Stabil működés", "Apró javítások".

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[11]',
            prompt: `Feladatod az "AI-alapú dokumentum-feldarabolás (chunking) implementálása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze, mennyire képes az AI üzletileg értelmes szekciókra (fejezetek, táblázatok, lábjegyzetek) bontani a dokumentumokat MOL-terminológiával.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[12]',
            prompt: `Feladatod egy rövid kommentet adni az "AI-alapú dokumentum-feldarabolás (chunking) implementálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Lehet pl. "AI működik", "Jó szekcionálás", "Finomhangolás maradt".

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[13]',
            prompt: `Feladatod a "Validációs engine és szabálykészlet (6 kategória) implementálása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze a 6 validációs kategória szabálykészletének, futtatásának és hibakezelésének készültségét (beleértve a dinamikus kategóriaszámlálót és szűrést).

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[14]',
            prompt: `Feladatod egy rövid kommentet adni a "Validációs engine és szabálykészlet (6 kategória) implementálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Lehet pl. "Szabályok készek", "V1 elfogadva", "Stabil futások".

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[15]',
            prompt: `Feladatod az "AI workflow és prompting optimalizálása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze, mennyire kiforrott a MOL-specifikus példákra, minőségmutatókra és visszacsatolásra épülő AI workflow és prompting.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[16]',
            prompt: `Feladatod egy rövid kommentet adni az "AI workflow és prompting optimalizálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Lehet pl. "Folyamatos tuning", "Közel kész", "Pilotra kész".

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[17]',
            prompt: `Formátum:
 DÁTUM: ÉÉÉÉ.HH.NN. (pl. DÁTUM: 2026.01.30.)
Feladatod a státusz riport dátummezőjének kitöltése.

– Használd a riport generálásának napját (a futtatás dátumát).
– A formátum legyen PONTOSAN:
  DÁTUM: ÉÉÉÉ.HH.NN.
– Év, hónap, nap mindig kétjegyű hónap/nap formában, ponttal elválasztva.
– Csak ezt az egy sort add vissza, semmi mást.
– Mindig magyar notációt használj, arab számokkal.

Példa (NE ezt írd ki, csak a formátum illusztrációjára):
DÁTUM: 2026.01.30.`,
        },
    ],
};

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

    const loadAfrPreset = () => {
        form.reset(AFR_PRESET);
        toast.success('AFR preset loaded');
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
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Template Filler</h1>
                    <p className="text-muted-foreground">
                        Upload a PowerPoint template and fill markers with AI-generated content
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={loadAfrPreset}
                    title="Load AFR preset"
                >
                    <Pencil className="size-4" />
                </Button>
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
