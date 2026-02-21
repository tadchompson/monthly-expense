import { Schema, model, Document } from 'mongoose';

export interface ISubscriptionExclusion extends Document {
  description: string;
  patternKey: string;
  label: string;
}

const subscriptionExclusionSchema = new Schema<ISubscriptionExclusion>(
  {
    description: { type: String, required: true, unique: true },
    patternKey: { type: String, required: true },
    label: { type: String, required: true },
  },
  { timestamps: true }
);

export const SubscriptionExclusion = model<ISubscriptionExclusion>(
  'SubscriptionExclusion',
  subscriptionExclusionSchema
);
