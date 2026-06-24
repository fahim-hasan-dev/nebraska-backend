import { Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback } from 'multer'
import ApiError from '../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { uploadToR2 } from '../../helpers/r2.helper'

// Allowed field names for uploads
type IFolderName = 'image' | 'pictures' | 'file';

interface ProcessedFiles {
  [key: string]: string | string[] | undefined
}

// Upload configuration details
const uploadFields = [
  { name: 'image', maxCount: 1 },
  { name: 'pictures', maxCount: 10 },
  { name: 'file', maxCount: 1 },
] as const;

// Middleware for parsing body and files
export const fileAndBodyProcessorUsingDiskStorage = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join(uploadsDir, file.fieldname);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
      cb(null, filename);
    },
  });

  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    try {
      const isImage = file.mimetype.startsWith('image/') || 
                      /\.(jpg|jpeg|png|gif|webp|heic|heif|bmp|tiff)$/i.test(file.originalname);
      
      const isAllowedDoc = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain'
      ].includes(file.mimetype) || /\.(pdf|doc|docx|txt)$/i.test(file.originalname);

      const fieldType = file.fieldname as IFolderName;

      if (fieldType === 'image' || fieldType === 'pictures') {
        if (!isImage) {
          return cb(
            new ApiError(StatusCodes.BAD_REQUEST, `Invalid file type for ${file.fieldname}. Only image formats are supported.`)
          );
        }
      } else if (fieldType === 'file') {
        if (!isImage && !isAllowedDoc) {
          return cb(
            new ApiError(StatusCodes.BAD_REQUEST, `Invalid file type for ${file.fieldname}. Supported formats: images (JPG, PNG, WEBP, HEIC, HEIF, GIF) and documents (PDF, DOC, DOCX, TXT).`)
          );
        }
      } else {
        return cb(
          new ApiError(StatusCodes.BAD_REQUEST, `Unsupported field name: ${file.fieldname}`)
        );
      }
      cb(null, true);
    } catch (error) {
      cb(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'File validation failed'));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024, files: 50 },
  }).fields(uploadFields);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (error) => {
      if (error) return next(error);

      try {
        if (req.body?.data) {
          req.body = JSON.parse(req.body.data);
        }

        if (!req.files) {
          return next();
        }

        const processedFiles: ProcessedFiles = {};
        const fieldsConfig = new Map(uploadFields.map((f) => [f.name, f.maxCount]));

        await Promise.all(
          Object.entries(req.files).map(async ([fieldName, files]) => {
            const fileArray = files as Express.Multer.File[];
            const maxCount = fieldsConfig.get(fieldName as IFolderName) ?? 1;
            const paths: string[] = [];

            await Promise.all(
              fileArray.map(async (file) => {
                const fullPath = path.join(uploadsDir, fieldName, file.filename);

                if (['image', 'pictures', 'file'].includes(fieldName) && file.mimetype.startsWith('image/')) {
                  const tempPath = fullPath + '.opt';

                  try {
                    let sharpInstance = sharp(fullPath)
                      .rotate()
                      .resize(800, null, { withoutEnlargement: true });

                    if (file.mimetype === 'image/png') {
                      sharpInstance = sharpInstance.png({ quality: 80 });
                    } else {
                      sharpInstance = sharpInstance.jpeg({ quality: 80, mozjpeg: true });
                    }

                    await sharpInstance.toFile(tempPath);
                    fs.unlinkSync(fullPath);
                    fs.renameSync(tempPath, fullPath);
                  } catch (err) {
                    console.error(`Failed to optimize image:`, err);
                  }
                }

                // Upload to R2 (helper handles local file deletion)
                const r2Url = await uploadToR2(fullPath, fieldName, file.filename, file.mimetype);
                paths.push(r2Url);
              })
            );

            processedFiles[fieldName] = maxCount > 1 ? paths : paths[0];
          })
        );

        req.body = {
          ...req.body,
          ...(processedFiles.image && { image: processedFiles.image }),
          ...(processedFiles.pictures && { pictures: processedFiles.pictures }),
          ...(processedFiles.file && { file: processedFiles.file }),
        };

        next();
      } catch (err) {
        next(err);
      }
    });
  };
};
