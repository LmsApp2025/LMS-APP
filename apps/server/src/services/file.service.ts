// In: apps/server/src/services/file.service.ts (NEW FILE)

import mime from "mime-types";
import { minioClient } from "../utils/minioClient"; // minioClient is a true utility

interface IUploadResult {
    public_id: string; // This is the objectName
    url: string;       // This is the public URL
}

const getR2PublicDomain = (bucketName: string): string => {
    switch (bucketName) {
        case 'marstech-lms-avatars-2025':
            return process.env.R2_AVATARS_DOMAIN!;
        case 'marstech-lms-banners-2025':
            return process.env.R2_BANNERS_DOMAIN!;
        case 'marstech-lms-resources-2025':
            return process.env.R2_RESOURCES_DOMAIN!;
        case 'marstech-lms-thumbnails-2025':
            return process.env.R2_THUMBNAILS_DOMAIN!;
        default:
            throw new Error(`Public domain for bucket '${bucketName}' is not configured.`);
    }
};

export const uploadBase64ToR2 = async (base64String: string, bucketName: string, objectPrefix: string): Promise<IUploadResult> => {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 string format");
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const fileExtension = mime.extension(mimeType) || 'file';

    const objectName = `${objectPrefix}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`;

    await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, { 'Content-Type': mimeType });
    
    const r2PublicDomain = getR2PublicDomain(bucketName);
    if (!r2PublicDomain) {
        throw new Error(`R2 public domain for bucket ${bucketName} is not set in environment variables.`);
    }

    const publicUrl = `https://${r2PublicDomain}/${objectName}`;
    
    return {
        public_id: objectName,
        url: publicUrl,
    };
};

export const removeFileFromR2 = async (bucketName: string, objectName: string): Promise<void> => {
    try {
        await minioClient.removeObject(bucketName, objectName);
    } catch (error) {
        console.error(`Error removing file from R2: ${objectName} in ${bucketName}`, error);
        // We log the error but don't re-throw, as failing to delete an old file shouldn't block a user update.
    }
};