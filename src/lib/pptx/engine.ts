import fs from 'fs';
import path from 'path';

import Automizer, { XmlElement } from 'pptx-automizer';

import {
    extractMarkerNumber,
    type ExtractionResult,
    type MarkerValueMap,
    type TemplateInput,
} from './types';

export class PptxTemplateEngine {
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
    async extractTemplateInputs(slideNumber: number): Promise<ExtractionResult> {
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
                                        markerNumber: extractMarkerNumber(marker),
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
    ): Promise<string> {
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
            const markerRegex = new RegExp(
                input.marker.replace('[', '\\[').replace(']', '\\]'),
                'g',
            );

            slideXml = slideXml.replace(markerRegex, escapedValue);
        }

        // Update the slide in the zip
        zip.file(slideFile, slideXml);

        // Write the output file
        const outputPath = path.join(this.outputDir, outputFileName);

        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        const outputData = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });
        fs.writeFileSync(outputPath, outputData);

        return outputPath;
    }

    /**
     * Gets the number of slides in the template
     */
    async getSlideCount(): Promise<number> {
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
        const slides = presInfo.slidesByTemplate('template');
        return slides?.length ?? 0;
    }
}

/**
 * Creates a PptxTemplateEngine instance for a job
 */
export function createEngineForJob(
    jobDir: string,
    templateFileName: string,
): PptxTemplateEngine {
    return new PptxTemplateEngine(jobDir, jobDir, templateFileName);
}
