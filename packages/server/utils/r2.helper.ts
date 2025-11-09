// C:\LMS App copy Part 2\Lms-App - Copy\server\utils\r2.helper.ts

import mime from "mime-types";
import { minioClient } from "./minioClient";

export const getR2PublicDomain = (bucketName: string): string => {
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

export const uploadBase64ToR2 = async (base64String: string, bucketName: string, objectPrefix: string): Promise<{ public_id: string; url: string }> => {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) throw new Error("Invalid base64 string format");
    
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