import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';
import { uploadToR2 } from '../../helpers/r2.helper';

const fileUploadHandler = () => {

    //create upload folder
    const baseUploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(baseUploadDir)) {
        fs.mkdirSync(baseUploadDir);
    }

    //folder create for different file
    const createDir = (dirPath: string) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    };

    //create filename
    const storage = multer.diskStorage({

        destination: (req, file, cb) => {
            let uploadDir;
            switch (file.fieldname) {
                case 'image':
                    uploadDir = path.join(baseUploadDir, 'image');
                    break;
                case 'media':
                    uploadDir = path.join(baseUploadDir, 'media');
                    break;
                default:
                    throw new ApiError(StatusCodes.BAD_REQUEST, 'File is not supported');
            }
            createDir(uploadDir);
            cb(null, uploadDir);
        },

        filename: (req, file, cb) => {
            const fileExt = path.extname(file.originalname);
            const fileName =
                file.originalname
                    .replace(fileExt, '')
                    .toLowerCase()
                    .split(' ')
                    .join('-') +
                '-' +
                Date.now();
            cb(null, fileName + fileExt);
        },
    });

    //file filter
    const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {

        // console.log("file handler",file)
        if (file.fieldname === 'image') {
            if (
                file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg'
            ) {
                cb(null, true);
            } else {
                cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .jpeg, .png, .jpg file supported'))
            }
        } else if (file.fieldname === 'media') {
            if (
                file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg'
            ) {
                cb(null, true);
            } else {
                cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only .png file supported'))
            }
        }

        else {
            cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported'))
        }
    };

    const upload = multer({ storage: storage, fileFilter: filterFilter })
        .fields([
            { name: 'image', maxCount: 3 },
            { name: 'media', maxCount: 2 },
        ]);

    return (req: Request, res: Response, next: NextFunction) => {
        upload(req, res, async (err) => {
            if (err) return next(err);

            if (req.files) {
                try {
                    const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
                    for (const [fieldname, files] of Object.entries(filesMap)) {
                        for (const file of files) {
                            const url = await uploadToR2(
                                file.path,
                                fieldname,
                                file.filename,
                                file.mimetype
                            );
                            (file as any).location = url;
                        }
                    }
                } catch (uploadErr) {
                    return next(uploadErr);
                }
            }
            next();
        });
    };

};

export default fileUploadHandler;
