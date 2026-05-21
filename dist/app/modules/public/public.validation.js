"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqValidations = exports.PublicValidation = void 0;
const zod_1 = require("zod");
const contactZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Name is required',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Invalid email format'),
        phone: zod_1.z.string().optional(),
        message: zod_1.z.string({
            required_error: 'Message is required',
        }),
    }),
});
exports.PublicValidation = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            content: zod_1.z.string(),
            type: zod_1.z.enum(['privacy-policy', 'terms-and-condition', 'contact', 'about', 'rolebook']),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            content: zod_1.z.string(),
            type: zod_1.z.enum(['privacy-policy', 'terms-and-condition', 'contact', 'about', 'rolebook']),
        }),
    }),
    contactZodSchema,
};
exports.FaqValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            question: zod_1.z.string({
                required_error: 'Question is required',
            }),
            answer: zod_1.z.string({
                required_error: 'Answer is required',
            }),
            type: zod_1.z.enum(['fan', 'driver']).optional(),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            question: zod_1.z.string().optional(),
            answer: zod_1.z.string().optional(),
            type: zod_1.z.enum(['fan', 'driver']).optional(),
        }),
    }),
};
