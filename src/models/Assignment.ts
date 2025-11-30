import mongoose, { Schema, Model } from 'mongoose';

export interface IStudyStep {
    stepNumber: number;
    description: string;
    estimatedTime?: string; // e.g., "30 mins"
    isCompleted: boolean;
    quiz?: {
        questions: {
            question: string;
            options: string[];
            correctAnswer: number; // index
            explanation?: string;
        }[];
        isCompleted: boolean;
        score?: number;
    };
}

export interface IAssignment {
    googleId: string;
    courseId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    dueDate?: Date;
    alternateLink: string;
    status: 'ASSIGNED' | 'TURNED_IN' | 'RETURNED'; // Classroom status
    studyPlan?: IStudyStep[];
    isDecomposed: boolean;
}

const AssignmentSchema = new Schema<IAssignment>(
    {
        googleId: { type: String, required: true, unique: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date },
        alternateLink: { type: String },
        status: { type: String },
        studyPlan: [
            {
                stepNumber: { type: Number },
                description: { type: String },
                estimatedTime: { type: String },
                isCompleted: { type: Boolean, default: false },
                quiz: {
                    questions: [{
                        question: String,
                        options: [String],
                        correctAnswer: Number,
                        explanation: String
                    }],
                    isCompleted: { type: Boolean, default: false },
                    score: Number
                }
            },
        ],
        isDecomposed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Assignment: Model<IAssignment> =
    mongoose.models.Assignment ||
    mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
