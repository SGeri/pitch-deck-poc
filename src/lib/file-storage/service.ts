import type { Readable } from 'node:stream';

import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { PRESIGNED_URL_EXPIRY, S3_BUCKET_NAME, s3Client } from './client';
import type { PresignedUrlResult, S3FileMetadata } from './types';

export async function generateS3Key(
    fileName: string,
    prefix = 'uploads',
): Promise<string> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${prefix}/${timestamp}-${randomId}-${sanitizedName}`;
}

export async function generateUploadUrl(
    fileName: string,
    contentType: string,
    maxSize?: number,
): Promise<PresignedUrlResult> {
    const key = await generateS3Key(fileName);

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ...(maxSize && { ContentLength: maxSize }),
    });

    const url = await getSignedUrl(s3Client, command, {
        expiresIn: PRESIGNED_URL_EXPIRY,
    });

    return {
        url,
        key,
        expiresAt: new Date(Date.now() + PRESIGNED_URL_EXPIRY * 1000),
    };
}

export async function generateDownloadUrl(
    key: string,
    fileName?: string,
): Promise<PresignedUrlResult> {
    const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        ...(fileName && {
            ResponseContentDisposition: `attachment; filename="${fileName}"`,
        }),
    });

    const url = await getSignedUrl(s3Client, command, {
        expiresIn: PRESIGNED_URL_EXPIRY,
    });

    return {
        url,
        key,
        expiresAt: new Date(Date.now() + PRESIGNED_URL_EXPIRY * 1000),
    };
}

export async function generateViewUrl(
    key: string,
): Promise<PresignedUrlResult> {
    const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        ResponseContentDisposition: 'inline',
    });

    const url = await getSignedUrl(s3Client, command, {
        expiresIn: PRESIGNED_URL_EXPIRY,
    });

    return {
        url,
        key,
        expiresAt: new Date(Date.now() + PRESIGNED_URL_EXPIRY * 1000),
    };
}

export async function checkFileExistence(key: string): Promise<boolean> {
    try {
        const command = new HeadObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
        return true;
    } catch {
        return false;
    }
}

export async function getFileMetadata(
    key: string,
): Promise<S3FileMetadata | null> {
    try {
        const command = new HeadObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });
        const response = await s3Client.send(command);

        const fileName = key.split('/').pop() || key;

        return {
            key,
            fileName,
            contentType: response.ContentType || 'application/octet-stream',
            size: response.ContentLength,
        };
    } catch (error) {
        console.error('Error getting file metadata:', error);
        return null;
    }
}

export async function deleteFile(key: string): Promise<boolean> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        return false;
    }
}

export async function getFileBuffer(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
    });

    const response = await s3Client.send(command);
    const stream = response.Body;

    if (!stream) {
        throw new Error(`Unable to download file for key ${key}`);
    }

    const readableStream = stream as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of readableStream) {
        if (Buffer.isBuffer(chunk)) {
            chunks.push(chunk);
        } else if (chunk instanceof Uint8Array) {
            chunks.push(Buffer.from(chunk));
        } else {
            chunks.push(Buffer.from(String(chunk)));
        }
    }

    return Buffer.concat(chunks);
}
