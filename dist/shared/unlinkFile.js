"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const r2_helper_1 = require("../helpers/r2.helper");
const unlinkFile = (file) => {
    if (!file)
        return;
    if (file.startsWith('http://') || file.startsWith('https://')) {
        (0, r2_helper_1.deleteFromR2)(file);
    }
    else {
        const filePath = path_1.default.join('uploads', file);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
};
exports.default = unlinkFile;
