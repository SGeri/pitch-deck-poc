'use server';

import type { Presentation, Slide } from '@/lib/types';

export interface ExportPresentationResult {
  success: boolean;
  data?: string; // Base64 PPTX
  fileName?: string;
  error?: string;
}

export async function exportPresentationAction(
  presentation: Presentation
): Promise<ExportPresentationResult> {
  try {
    // Dynamic import of pptxgenjs (server-side)
    const PptxGenJS = (await import('pptxgenjs')).default;

    const pptx = new PptxGenJS();
    pptx.author = 'MOL Group';
    pptx.title = presentation.name;
    pptx.subject = 'Generated Presentation';
    pptx.company = 'MOL Group';

    // Define MOL brand colors
    const molRed = 'E30613';
    const molDark = '1a1a2e';
    for (const slide of presentation.slides) {
      const pptSlide = pptx.addSlide();

      switch (slide.type) {
        case 'title':
          renderTitleSlide(pptSlide, slide, molRed, molDark);
          break;
        case 'content':
          renderContentSlide(pptSlide, slide, molRed, molDark);
          break;
        case 'chart':
          renderChartSlide(pptSlide, slide, molRed, molDark);
          break;
        case 'table':
          renderTableSlide(pptSlide, slide, molRed, molDark);
          break;
        case 'two-column':
          renderTwoColumnSlide(pptSlide, slide, molRed, molDark);
          break;
        default:
          renderContentSlide(pptSlide, slide, molRed, molDark);
      }
    }

    // Generate base64 output
    const base64Data = await pptx.write({ outputType: 'base64' });
    const fileName = `${presentation.name.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;

    return {
      success: true,
      data: base64Data as string,
      fileName,
    };
  } catch (error) {
    console.error('Export presentation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export presentation',
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderTitleSlide(pptSlide: any, slide: Slide, molRed: string, molDark: string) {
  // Add a subtle accent bar at top
  pptSlide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: molRed },
  });

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.2,
    fontSize: 44,
    fontFace: 'Arial',
    bold: true,
    color: molDark,
  });

  // Subtitle
  if (slide.subtitle) {
    pptSlide.addText(slide.subtitle, {
      x: 0.5,
      y: 3.8,
      w: 9,
      h: 0.8,
      fontSize: 24,
      fontFace: 'Arial',
      color: '6b7280',
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderContentSlide(pptSlide: any, slide: Slide, molRed: string, molDark: string) {
  // Accent bar
  pptSlide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.1,
    fill: { color: molRed },
  });

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.7,
    fontSize: 28,
    fontFace: 'Arial',
    bold: true,
    color: molDark,
  });

  // Subtitle
  if (slide.subtitle) {
    pptSlide.addText(slide.subtitle, {
      x: 0.5,
      y: 1.1,
      w: 9,
      h: 0.5,
      fontSize: 16,
      fontFace: 'Arial',
      color: '6b7280',
    });
  }

  // Content bullets
  if (slide.content && slide.content.length > 0) {
    const bulletText = slide.content.map((item) => ({
      text: item,
      options: { bullet: { type: 'bullet', color: molRed }, indentLevel: 0 },
    }));

    pptSlide.addText(bulletText, {
      x: 0.5,
      y: slide.subtitle ? 1.7 : 1.3,
      w: 9,
      h: 4,
      fontSize: 18,
      fontFace: 'Arial',
      color: molDark,
      valign: 'top',
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderChartSlide(pptSlide: any, slide: Slide, molRed: string, molDark: string) {
  // Accent bar
  pptSlide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.1,
    fill: { color: molRed },
  });

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.7,
    fontSize: 28,
    fontFace: 'Arial',
    bold: true,
    color: molDark,
  });

  // Subtitle
  if (slide.subtitle) {
    pptSlide.addText(slide.subtitle, {
      x: 0.5,
      y: 1.1,
      w: 9,
      h: 0.5,
      fontSize: 16,
      fontFace: 'Arial',
      color: '6b7280',
    });
  }

  // Chart
  if (slide.chartData) {
    const chartType = slide.chartData.type === 'pie' ? 'pie' :
                      slide.chartData.type === 'line' ? 'line' : 'bar';

    pptSlide.addChart(chartType, [
      {
        name: slide.chartData.label,
        labels: slide.chartData.labels,
        values: slide.chartData.values,
      },
    ], {
      x: 0.5,
      y: 1.7,
      w: 9,
      h: 4,
      showTitle: false,
      showLegend: true,
      legendPos: 'b',
      chartColors: [molRed, '3b82f6', '10b981', 'f59e0b', '8b5cf6'],
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderTableSlide(pptSlide: any, slide: Slide, molRed: string, molDark: string) {
  // Accent bar
  pptSlide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.1,
    fill: { color: molRed },
  });

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.7,
    fontSize: 28,
    fontFace: 'Arial',
    bold: true,
    color: molDark,
  });

  // Table
  if (slide.tableData) {
    const tableRows = [
      slide.tableData.headers.map((h) => ({
        text: h,
        options: { bold: true, fill: { color: molRed }, color: 'ffffff' },
      })),
      ...slide.tableData.rows.map((row, rowIdx) =>
        row.map((cell) => ({
          text: cell,
          options: { fill: { color: rowIdx % 2 === 0 ? 'f8fafc' : 'ffffff' } },
        }))
      ),
    ];

    pptSlide.addTable(tableRows, {
      x: 0.5,
      y: 1.4,
      w: 9,
      colW: Array(slide.tableData.headers.length).fill(9 / slide.tableData.headers.length),
      fontSize: 14,
      fontFace: 'Arial',
      color: molDark,
      border: { pt: 0.5, color: 'e5e7eb' },
      valign: 'middle',
      align: 'center',
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderTwoColumnSlide(pptSlide: any, slide: Slide, molRed: string, molDark: string) {
  // Accent bar
  pptSlide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.1,
    fill: { color: molRed },
  });

  // Title
  pptSlide.addText(slide.title, {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.7,
    fontSize: 28,
    fontFace: 'Arial',
    bold: true,
    color: molDark,
  });

  // Left column
  if (slide.leftContent && slide.leftContent.length > 0) {
    const leftText = slide.leftContent.map((item, idx) => ({
      text: item,
      options: idx === 0
        ? { bold: true, bullet: false }
        : { bullet: { type: 'bullet', color: molRed }, indentLevel: 0 },
    }));

    pptSlide.addText(leftText, {
      x: 0.5,
      y: 1.3,
      w: 4.2,
      h: 4,
      fontSize: 16,
      fontFace: 'Arial',
      color: molDark,
      valign: 'top',
    });
  }

  // Right column
  if (slide.rightContent && slide.rightContent.length > 0) {
    const rightText = slide.rightContent.map((item, idx) => ({
      text: item,
      options: idx === 0
        ? { bold: true, bullet: false }
        : { bullet: { type: 'bullet', color: molRed }, indentLevel: 0 },
    }));

    pptSlide.addText(rightText, {
      x: 5.3,
      y: 1.3,
      w: 4.2,
      h: 4,
      fontSize: 16,
      fontFace: 'Arial',
      color: molDark,
      valign: 'top',
    });
  }
}
