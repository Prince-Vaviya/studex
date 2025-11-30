import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
    courseId: mongoose.Types.ObjectId;
    googleId: string;
    title: string;
    mimeType: string;
    alternateLink?: string;
    contentHash?: string;
    isVectorized: boolean;
}

const MaterialSchema = new Schema<IMaterial>(
    {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        googleId: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        mimeType: { type: String },
        alternateLink: { type: String },
        contentHash: { type: String },
        isVectorized: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.Material ||
    mongoose.model<IMaterial>('Material', MaterialSchema);
