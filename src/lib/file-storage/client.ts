import { env } from '@/env';
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
    region: env.AWS_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
});

export const S3_BUCKET_NAME = env.S3_BUCKET_NAME;
export const PRESIGNED_URL_EXPIRY = 3600;
