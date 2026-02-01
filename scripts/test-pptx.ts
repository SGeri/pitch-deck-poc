import fs from 'fs';
import path from 'path';

import Automizer, { XmlElement } from 'pptx-automizer';

// ============================================================================
// TYPES
// ============================================================================

/** Base interface for all template inputs */
interface BaseTemplateInput {
    /** The marker pattern found (e.g., "[1]", "[2]") */
    marker: string;
    /** The numeric value extracted from the marker */
    markerNumber: number;
}

/** Template input from a textbox element */
interface TextboxTemplateInput extends BaseTemplateInput {
    type: 'textbox';
    /** Unique element name that identifies this textbox */
    elementName: string;
}

/** Template input from a table cell */
interface TableTemplateInput extends BaseTemplateInput {
    type: 'table';
    /** Element name of the table */
    elementName: string;
    /** Table cell location */
    tableLocation: {
        row: number;
        col: number;
    };
}

/** Union type for all template inputs */
type TemplateInput = TextboxTemplateInput | TableTemplateInput;

/** Map of marker to replacement value */
type MarkerValueMap = Record<string, string>;

/** Result of template extraction */
interface ExtractionResult {
    slideNumber: number;
    inputs: TemplateInput[];
}

/** Unique identifier for a template input */
type TemplateInputId = string;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a unique identifier for a template input.
 * For textboxes: elementName
 * For tables: elementName:row:col
 */
function getTemplateInputId(input: TemplateInput): TemplateInputId {
    if (input.type === 'textbox') {
        return input.elementName;
    }
    return `${input.elementName}:${input.tableLocation.row}:${input.tableLocation.col}`;
}

/**
 * Extracts the marker number from a marker string (e.g., "[5]" -> 5)
 */
function extractMarkerNumber(marker: string): number {
    const match = marker.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

// ============================================================================
// TEMPLATE ENGINE
// ============================================================================

class PptxTemplateEngine {
    private templateDir: string;
    private templateFile: string;
    private outputDir: string;

    constructor(templateDir: string, outputDir: string, templateFile: string) {
        this.templateDir = templateDir;
        this.templateFile = templateFile;
        this.outputDir = outputDir;
    }

    /**
     * Extracts all template inputs from a specific slide
     */
    async extractTemplateInputs(
        slideNumber: number,
    ): Promise<ExtractionResult> {
        const automizer = new Automizer({
            templateDir: this.templateDir,
            outputDir: this.outputDir,
            removeExistingSlides: false,
            cleanup: false,
            compression: 0,
        });

        const pres = automizer
            .loadRoot(this.templateFile)
            .load(this.templateFile, 'template');

        const presInfo = await pres.getInfo();
        const slideInfo = presInfo.slideByNumber('template', slideNumber);

        if (!slideInfo) {
            throw new Error(`Slide ${slideNumber} not found in template`);
        }

        // Find table elements for this slide
        const tableElements =
            slideInfo.elements?.filter((el) => el.type === 'table') ?? [];

        const inputs: TemplateInput[] = [];

        // Process the slide to extract inputs
        pres.addSlide('template', slideNumber, async (slide) => {
            const textElements = await slide.getAllTextElementIds();

            // Process regular text elements (textboxes)
            for (const elementId of textElements) {
                slide.modifyElement(elementId, (element: XmlElement) => {
                    const textNodes = element.getElementsByTagName('a:t');
                    let fullText = '';

                    for (let i = 0; i < textNodes.length; i++) {
                        const textNode = textNodes.item(i);
                        if (textNode?.firstChild?.nodeValue) {
                            fullText += textNode.firstChild.nodeValue;
                        }
                    }

                    const markerMatches = fullText.match(/\[\d+\]/g);
                    if (markerMatches) {
                        for (const marker of markerMatches) {
                            inputs.push({
                                type: 'textbox',
                                marker,
                                markerNumber: extractMarkerNumber(marker),
                                elementName: String(elementId),
                            });
                        }
                    }
                });
            }

            // Process table elements
            for (const tableEl of tableElements) {
                slide.modifyElement(tableEl.name, (element: XmlElement) => {
                    const rows = element.getElementsByTagName('a:tr');

                    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                        const row = rows.item(rowIdx);
                        if (!row) continue;

                        const cells = row.getElementsByTagName('a:tc');
                        for (let colIdx = 0; colIdx < cells.length; colIdx++) {
                            const cell = cells.item(colIdx);
                            if (!cell) continue;

                            const textNodes = cell.getElementsByTagName('a:t');
                            let cellText = '';
                            for (let i = 0; i < textNodes.length; i++) {
                                const textNode = textNodes.item(i);
                                if (textNode?.firstChild?.nodeValue) {
                                    cellText += textNode.firstChild.nodeValue;
                                }
                            }

                            const markerMatches = cellText.match(/\[\d+\]/g);
                            if (markerMatches) {
                                for (const marker of markerMatches) {
                                    inputs.push({
                                        type: 'table',
                                        marker,
                                        markerNumber:
                                            extractMarkerNumber(marker),
                                        elementName: tableEl.name,
                                        tableLocation: {
                                            row: rowIdx,
                                            col: colIdx,
                                        },
                                    });
                                }
                            }
                        }
                    }
                });
            }
        });

        // Trigger processing
        try {
            await pres.getJSZip();
        } catch {
            // Ignore - we just need to trigger the callbacks
        }

        // Sort by marker number
        inputs.sort((a, b) => a.markerNumber - b.markerNumber);

        return {
            slideNumber,
            inputs,
        };
    }

    /**
     * Fills the template with values and writes to output.
     * Uses direct JSZip manipulation for reliable text replacement.
     */
    async fillTemplate(
        slideNumber: number,
        inputs: TemplateInput[],
        values: MarkerValueMap,
        outputFileName: string,
    ): Promise<void> {
        const JSZip = (await import('jszip')).default;

        // Read the template file
        const templatePath = path.join(this.templateDir, this.templateFile);
        const data = fs.readFileSync(templatePath);
        const zip = await JSZip.loadAsync(data);

        // Get the slide XML
        const slideFile = `ppt/slides/slide${slideNumber}.xml`;
        let slideXml = await zip.file(slideFile)?.async('string');

        if (!slideXml) {
            throw new Error(`Slide ${slideNumber} not found in template`);
        }

        // Replace all markers in the XML
        for (const input of inputs) {
            const newValue = values[input.marker];
            if (newValue === undefined) continue;

            // Escape special XML characters in the new value
            const escapedValue = newValue
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');

            // Replace the marker in the XML
            // The marker appears as text content, e.g., <a:t>[1]</a:t>
            const markerRegex = new RegExp(
                input.marker.replace('[', '\\[').replace(']', '\\]'),
                'g',
            );

            const beforeCount = (slideXml.match(markerRegex) || []).length;
            slideXml = slideXml.replace(markerRegex, escapedValue);
            const afterCount = (slideXml.match(markerRegex) || []).length;

            if (beforeCount > afterCount) {
                console.log(
                    `  Replaced ${input.marker} -> "${newValue}" (${beforeCount - afterCount} occurrences)`,
                );
            }
        }

        // Update the slide in the zip
        zip.file(slideFile, slideXml);

        // Write the output file
        const outputPath = path.join(this.outputDir, outputFileName);
        const outputData = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });
        fs.writeFileSync(outputPath, outputData);

        console.log(`\nTemplate filled and written to: ${outputPath}`);
    }
}

// ============================================================================
// DEMO / TEST
// ============================================================================

async function main() {
    const rootDir = process.cwd();
    const templateDir = rootDir;
    const outputDir = path.join(rootDir, 'output');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('=== PPTX Template Engine Demo ===\n');

    // Initialize template engine
    const engine = new PptxTemplateEngine(
        templateDir,
        outputDir,
        'report.pptx',
    );

    // Step 1: Extract template inputs from slide 2
    console.log('Step 1: Extracting template inputs from slide 2...\n');
    const extraction = await engine.extractTemplateInputs(2);

    console.log(`Found ${extraction.inputs.length} template inputs:\n`);
    for (const input of extraction.inputs) {
        const id = getTemplateInputId(input);
        if (input.type === 'textbox') {
            console.log(`  ${input.marker} -> Textbox`);
            console.log(`    ID: ${id}`);
            console.log(`    Element: ${input.elementName}`);
        } else {
            console.log(`  ${input.marker} -> Table Cell`);
            console.log(`    ID: ${id}`);
            console.log(`    Table: ${input.elementName}`);
            console.log(
                `    Location: row=${input.tableLocation.row}, col=${input.tableLocation.col}`,
            );
        }
        console.log();
    }

    // Step 2: Define marker-to-value map (demo data)
    console.log('Step 2: Defining marker-to-value map...\n');

    const markerValues: MarkerValueMap = {
        // Textbox inputs
        '[1]': 'Az általános státusz összefoglalója itt található.',
        '[2]': 'API integráció befejezve, tesztelés megkezdve.',
        '[3]': 'Frontend fejlesztés és hibakeresés.',
        '[4]': 'Nincs kritikus kockázat jelenleg.',
        '[17]': '2024 Q1',

        // Table inputs (% készenlét column)
        '[5]': '100%',
        '[7]': '85%',
        '[9]': '60%',
        '[11]': '45%',
        '[13]': '30%',
        '[15]': '15%',

        // Table inputs (Komment column)
        '[6]': 'Befejezve és jóváhagyva',
        '[8]': 'Haladás a tervek szerint',
        '[10]': 'Kisebb csúszás várható',
        '[12]': 'Fejlesztés alatt',
        '[14]': 'Tervezés fázisában',
        '[16]': 'Még nem kezdődött el',
    };

    console.log('Marker values defined:');
    for (const [marker, value] of Object.entries(markerValues)) {
        console.log(
            `  ${marker}: "${value.substring(0, 40)}${value.length > 40 ? '...' : ''}"`,
        );
    }

    // Step 3: Fill template and generate output
    console.log('\nStep 3: Filling template and generating output...\n');

    await engine.fillTemplate(
        extraction.slideNumber,
        extraction.inputs,
        markerValues,
        'filled-report.pptx',
    );

    // Final summary
    console.log('\n=== Final Result ===\n');
    const result = {
        extraction: {
            slideNumber: extraction.slideNumber,
            inputCount: extraction.inputs.length,
            inputs: extraction.inputs.map((input) => ({
                marker: input.marker,
                elementName: input.elementName,
                type: input.type,
                additionalInfo:
                    input.type === 'table'
                        ? {
                              row: input.tableLocation.row,
                              col: input.tableLocation.col,
                          }
                        : undefined,
            })),
        },
        filledValues: Object.keys(markerValues).length,
        outputFile: 'output/filled-report.pptx',
    };

    console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
