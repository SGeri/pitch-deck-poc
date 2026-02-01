export interface S3FileMetadata {
    key: string;
    fileName: string;
    contentType: string;
    size?: number;
}

export interface PresignedUrlResult {
    url: string;
    key: string;
    expiresAt: Date;
}
