/** Base interface for all template inputs */
export interface BaseTemplateInput {
    /** The marker pattern found (e.g., "[1]", "[2]") */
    marker: string;
    /** The numeric value extracted from the marker */
    markerNumber: number;
}

/** Template input from a textbox element */
export interface TextboxTemplateInput extends BaseTemplateInput {
    type: 'textbox';
    /** Unique element name that identifies this textbox */
    elementName: string;
}

/** Template input from a table cell */
export interface TableTemplateInput extends BaseTemplateInput {
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
export type TemplateInput = TextboxTemplateInput | TableTemplateInput;

/** Map of marker to replacement value */
export type MarkerValueMap = Record<string, string>;

/** Result of template extraction */
export interface ExtractionResult {
    slideNumber: number;
    inputs: TemplateInput[];
}

/** Unique identifier for a template input */
export type TemplateInputId = string;

/**
 * Generates a unique identifier for a template input.
 * For textboxes: elementName
 * For tables: elementName:row:col
 */
export function getTemplateInputId(input: TemplateInput): TemplateInputId {
    if (input.type === 'textbox') {
        return input.elementName;
    }
    return `${input.elementName}:${input.tableLocation.row}:${input.tableLocation.col}`;
}

/**
 * Extracts the marker number from a marker string (e.g., "[5]" -> 5)
 */
export function extractMarkerNumber(marker: string): number {
    const match = marker.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}
