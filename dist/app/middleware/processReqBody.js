"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileAndBodyProcessorUsingDiskStorage = void 0;
const multer_1 = __importDefault(require("multer"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// Upload configuration details
const uploadFields = [
    { name: 'image', maxCount: 1 },
    { name: 'pictures', maxCount: 10 },
    { name: 'file', maxCount: 1 },
];
// Middleware for parsing body and files
const fileAndBodyProcessorUsingDiskStorage = () => {
    const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const folderPath = path_1.default.join(uploadsDir, file.fieldname);
            if (!fs_1.default.existsSync(folderPath)) {
                fs_1.default.mkdirSync(folderPath, { recursive: true });
            }
            cb(null, folderPath);
        },
        filename: (req, file, cb) => {
            const extension = path_1.default.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
            cb(null, filename);
        },
    });
    const fileFilter = (req, file, cb) => {
        try {
            const isImage = file.mimetype.startsWith('image/') ||
                /\.(jpg|jpeg|png|gif|webp|heic|heif|bmp|tiff)$/i.test(file.originalname);
            const isAllowedDoc = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ].includes(file.mimetype) || /\.(pdf|doc|docx|txt)$/i.test(file.originalname);
            const fieldType = file.fieldname;
            if (fieldType === 'image' || fieldType === 'pictures') {
                if (!isImage) {
                    return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Invalid file type for ${file.fieldname}. Only image formats are supported.`));
                }
            }
            else if (fieldType === 'file') {
                if (!isImage && !isAllowedDoc) {
                    return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Invalid file type for ${file.fieldname}. Supported formats: images (JPG, PNG, WEBP, HEIC, HEIF, GIF) and documents (PDF, DOC, DOCX, TXT).`));
                }
            }
            else {
                return cb(new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Unsupported field name: ${file.fieldname}`));
            }
            cb(null, true);
        }
        catch (error) {
            cb(new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'File validation failed'));
        }
    };
    const upload = (0, multer_1.default)({
        storage,
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024, files: 50 },
    }).fields(uploadFields);
    return (req, res, next) => {
        upload(req, res, async (error) => {
            var _a;
            if (error)
                return next(error);
            try {
                if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.data) {
                    req.body = JSON.parse(req.body.data);
                }
                if (!req.files) {
                    return next();
                }
                const processedFiles = {};
                const fieldsConfig = new Map(uploadFields.map((f) => [f.name, f.maxCount]));
                await Promise.all(Object.entries(req.files).map(async ([fieldName, files]) => {
                    var _a;
                    const fileArray = files;
                    const maxCount = (_a = fieldsConfig.get(fieldName)) !== null && _a !== void 0 ? _a : 1;
                    const paths = [];
                    await Promise.all(fileArray.map(async (file) => {
                        const filePath = `/${fieldName}/${file.filename}`;
                        paths.push(filePath);
                        if (['image', 'pictures', 'file'].includes(fieldName) && file.mimetype.startsWith('image/')) {
                            const fullPath = path_1.default.join(uploadsDir, fieldName, file.filename);
                            const tempPath = fullPath + '.opt';
                            try {
                                let sharpInstance = (0, sharp_1.default)(fullPath)
                                    .rotate()
                                    .resize(800, null, { withoutEnlargement: true });
                                if (file.mimetype === 'image/png') {
                                    sharpInstance = sharpInstance.png({ quality: 80 });
                                }
                                else {
                                    sharpInstance = sharpInstance.jpeg({ quality: 80, mozjpeg: true });
                                }
                                await sharpInstance.toFile(tempPath);
                                fs_1.default.unlinkSync(fullPath);
                                fs_1.default.renameSync(tempPath, fullPath);
                            }
                            catch (err) {
                                console.error(`Failed to optimize ${filePath}:`, err);
                            }
                        }
                    }));
                    processedFiles[fieldName] = maxCount > 1 ? paths : paths[0];
                }));
                req.body = {
                    ...req.body,
                    ...(processedFiles.image && { image: processedFiles.image }),
                    ...(processedFiles.pictures && { pictures: processedFiles.pictures }),
                    ...(processedFiles.file && { file: processedFiles.file }),
                };
                next();
            }
            catch (err) {
                next(err);
            }
        });
    };
};
exports.fileAndBodyProcessorUsingDiskStorage = fileAndBodyProcessorUsingDiskStorage;
