import fs from 'fs';
import path from 'path';

const TMP_BASE_DIR = path.join(process.cwd(), 'tmp', 'templates');

/**
 * Ensures the tmp directory exists for a given job
 */
export function ensureTmpDir(jobId: string): string {
    const jobDir = path.join(TMP_BASE_DIR, jobId);
    if (!fs.existsSync(jobDir)) {
        fs.mkdirSync(jobDir, { recursive: true });
    }
    return jobDir;
}

/**
 * Gets the full path for a file in a job's tmp directory
 */
export function getTmpFilePath(jobId: string, fileName: string): string {
    return path.join(TMP_BASE_DIR, jobId, fileName);
}

/**
 * Saves a buffer to the tmp directory for a job
 */
export async function saveTmpFile(
    jobId: string,
    fileName: string,
    buffer: Buffer,
): Promise<string> {
    const jobDir = ensureTmpDir(jobId);
    const filePath = path.join(jobDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

/**
 * Reads a file from the tmp directory
 */
export async function readTmpFile(
    jobId: string,
    fileName: string,
): Promise<Buffer> {
    const filePath = getTmpFilePath(jobId, fileName);
    return fs.readFileSync(filePath);
}

/**
 * Checks if a tmp file exists
 */
export function tmpFileExists(jobId: string, fileName: string): boolean {
    const filePath = getTmpFilePath(jobId, fileName);
    return fs.existsSync(filePath);
}

/**
 * Cleans up all tmp files for a job
 */
export async function cleanupTmpFiles(jobId: string): Promise<void> {
    const jobDir = path.join(TMP_BASE_DIR, jobId);
    if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
    }
}

/**
 * Lists all files in a job's tmp directory
 */
export function listTmpFiles(jobId: string): string[] {
    const jobDir = path.join(TMP_BASE_DIR, jobId);
    if (!fs.existsSync(jobDir)) {
        return [];
    }
    return fs.readdirSync(jobDir);
}

/**
 * Gets the base tmp directory path
 */
export function getTmpBaseDir(): string {
    return TMP_BASE_DIR;
}
