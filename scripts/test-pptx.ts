import Automizer from 'pptx-automizer';
import path from 'path';

interface TextInput {
    elementName: string;
    content: string;
    marker?: string;
    type: 'textbox' | 'table';
    tableLocation?: { row: number; col: number };
}

async function testPptxExtraction() {
    const rootDir = process.cwd();
    const templateDir = rootDir;
    const outputDir = path.join(rootDir, 'output');

    const automizer = new Automizer({
        templateDir,
        outputDir,
        removeExistingSlides: false,
        cleanup: false,
        compression: 0,
    });

    const pres = automizer.loadRoot('report.pptx').load('report.pptx', 'report');

    // Get info about the presentation
    const presInfo = await pres.getInfo();

    console.log('=== Presentation Info ===');

    const reportSlides = presInfo.slidesByTemplate('report');
    console.log('Number of slides:', reportSlides?.length ?? 'unknown');

    // Get the 2nd slide info
    const slide2Info = presInfo.slideByNumber('report', 2);
    console.log('\n=== Slide 2 Info ===');
    console.log(
        'Slide 2 elements:',
        slide2Info?.elements?.map((el) => ({
            name: el.name,
            type: el.type,
        })),
    );

    // Find table elements
    const tableElements = slide2Info?.elements?.filter((el) => el.type === 'table') ?? [];
    console.log('\n=== Table Elements ===');
    console.log('Tables found:', tableElements.map((el) => el.name));

    // Now let's process slide 2 and extract all text content
    const textInputs: TextInput[] = [];

    // Add slide 2 and extract text
    pres.addSlide('report', 2, async (slide) => {
        const textElements = await slide.getAllTextElementIds();
        console.log('\n=== Text Elements on Slide 2 ===');
        console.log('Text element count:', textElements.length);

        // Process regular text elements
        for (const elementId of textElements) {
            slide.modifyElement(elementId, (element) => {
                const textNodes = element.getElementsByTagName('a:t');
                let fullText = '';

                for (let i = 0; i < textNodes.length; i++) {
                    const textNode = textNodes.item(i);
                    if (textNode?.firstChild?.nodeValue) {
                        fullText += textNode.firstChild.nodeValue;
                    }
                }

                // Check for [x] pattern markers
                const markerMatch = fullText.match(/\[(\d+)\]/g);

                if (markerMatch) {
                    for (const marker of markerMatch) {
                        textInputs.push({
                            elementName: String(elementId),
                            content: fullText,
                            marker,
                            type: 'textbox',
                        });
                        console.log(`Found text input marker ${marker} in textbox "${elementId}": "${fullText}"`);
                    }
                }
            });
        }

        // Process table elements
        for (const tableEl of tableElements) {
            slide.modifyElement(tableEl.name, (element) => {
                // Tables have rows (a:tr) and cells (a:tc)
                const rows = element.getElementsByTagName('a:tr');
                console.log(`\n=== Processing Table "${tableEl.name}" ===`);
                console.log(`Table has ${rows.length} rows`);

                for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
                    const row = rows.item(rowIdx);
                    if (!row) continue;

                    const cells = row.getElementsByTagName('a:tc');
                    for (let colIdx = 0; colIdx < cells.length; colIdx++) {
                        const cell = cells.item(colIdx);
                        if (!cell) continue;

                        // Get text content from cell
                        const textNodes = cell.getElementsByTagName('a:t');
                        let cellText = '';
                        for (let i = 0; i < textNodes.length; i++) {
                            const textNode = textNodes.item(i);
                            if (textNode?.firstChild?.nodeValue) {
                                cellText += textNode.firstChild.nodeValue;
                            }
                        }

                        // Check for [x] pattern markers
                        const markerMatch = cellText.match(/\[(\d+)\]/g);
                        if (markerMatch) {
                            for (const marker of markerMatch) {
                                textInputs.push({
                                    elementName: tableEl.name,
                                    content: cellText,
                                    marker,
                                    type: 'table',
                                    tableLocation: { row: rowIdx, col: colIdx },
                                });
                                console.log(
                                    `Found text input marker ${marker} in table cell [row ${rowIdx}, col ${colIdx}]: "${cellText}"`,
                                );
                            }
                        }
                    }
                }
            });
        }
    });

    // We need to process the presentation to trigger the callbacks
    try {
        await pres.getJSZip();
    } catch (error) {
        // Ignore errors - we just need to trigger processing
    }

    // Sort text inputs by marker number
    textInputs.sort((a, b) => {
        const aNum = parseInt(a.marker?.match(/\d+/)?.[0] ?? '0');
        const bNum = parseInt(b.marker?.match(/\d+/)?.[0] ?? '0');
        return aNum - bNum;
    });

    console.log('\n=== Summary of Text Inputs ===');
    console.log('Total text inputs found:', textInputs.length);
    textInputs.forEach((input) => {
        if (input.type === 'table') {
            console.log(
                `  ${input.marker}: "${input.content}" (table: ${input.elementName}, row: ${input.tableLocation?.row}, col: ${input.tableLocation?.col})`,
            );
        } else {
            console.log(`  ${input.marker}: "${input.content}" (textbox: ${input.elementName})`);
        }
    });

    return {
        slideCount: reportSlides.length,
        textInputs,
    };
}

testPptxExtraction()
    .then((result) => {
        console.log('\n=== Final Result ===');
        console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
        console.error('Error:', error);
    });
