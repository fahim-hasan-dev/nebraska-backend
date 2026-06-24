import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import config from '../config';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.r2.endpoint || '',
  credentials: {
    accessKeyId: config.r2.accessKeyId || '',
    secretAccessKey: config.r2.secretAccessKey || '',
  },
});

export const uploadToR2 = async (
  localFilePath: string,
  folder: string,
  fileName: string,
  mimeType: string
): Promise<string> => {
  const fileStream = fs.createReadStream(localFilePath);
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
    Body: fileStream,
    ContentType: mimeType,
  });

  try {
    await s3Client.send(command);
    return `${config.r2.publicUrl}/${key}`;
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};

export const deleteFromR2 = async (publicUrl: string): Promise<void> => {
  try {
    const prefix = `${config.r2.publicUrl}/`;
    if (!publicUrl.startsWith(prefix)) {
      return;
    }
    const key = publicUrl.replace(prefix, '');
    const command = new DeleteObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Failed to delete file from R2:', error);
  }
};
