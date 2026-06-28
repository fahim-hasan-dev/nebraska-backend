import { Schema, model } from 'mongoose'
import { ContactModel, FaqModel, IContact, IFaq, IPublic, PublicModel } from './public.interface'

const publicSchema = new Schema<IPublic, PublicModel>(
  {
    content: { type: String },
    type: { type: String, enum: ['privacy-policy', 'terms-and-condition','contact','about','rolebook','logo'] },
  },
  {
    timestamps: true,
  },
)

export const Public = model<IPublic, PublicModel>('Public', publicSchema)

const faqSchema = new Schema<IFaq, FaqModel>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    type: { type: String, enum: ['fan', 'driver'], default: 'fan', required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)


export const Faq = model<IFaq, FaqModel>('Faq', faqSchema)


const contactSchema = new Schema<IContact, ContactModel>(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String, optional: true },
    message: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

export const Contact = model<IContact, ContactModel>('Contact', contactSchema)
