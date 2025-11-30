import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
    userId: string; // Clerk User ID
    googleId: string;
    name: string;
    section?: string;
    descriptionHeading?: string;
    alternateLink?: string;
    courseState?: string;
    syncStatus: 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR';
    lastSyncedAt?: Date;
}

const CourseSchema = new Schema<ICourse>(
    {
        userId: { type: String, required: true },
        googleId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        section: { type: String },
        descriptionHeading: { type: String },
        alternateLink: { type: String },
        courseState: { type: String },
        syncStatus: {
            type: String,
            enum: ['IDLE', 'SYNCING', 'SYNCED', 'ERROR'],
            default: 'IDLE',
        },
        lastSyncedAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models.Course ||
    mongoose.model<ICourse>('Course', CourseSchema);
