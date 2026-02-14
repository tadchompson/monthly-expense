import { Schema, model, Document } from 'mongoose';

export interface IExpense extends Document {
  date: Date;
  description: string;
  amount: number;
  category: string;
  merchant: string;
  cardLast4?: string;
  uploadBatchId: string;
}

const expenseSchema = new Schema<IExpense>(
  {
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: 'Uncategorized' },
    merchant: { type: String, default: '' },
    cardLast4: { type: String },
    uploadBatchId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Expense = model<IExpense>('Expense', expenseSchema);
