import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "@config";

const s3Client = new S3Client({ region: config.s3.region });

export class S3Service {
  async generarUrlSubida(fileName: string, mimeType: string): Promise<{ uploadUrl: string; key: string }> {

    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/\s+/g, '-');
    const key = `testimonios/${timestamp}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return { uploadUrl, key };
  }
}