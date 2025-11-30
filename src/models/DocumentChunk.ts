import mongoose, { Schema, Model } from 'mongoose';

export interface IDocumentChunk {
    materialId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    text: string;
    embedding: number[];
    chunkIndex: number;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>(
    {
        materialId: { type: Schema.Types.ObjectId, ref: 'Material', required: true },
        courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
        text: { type: String, required: true },
        embedding: { type: [Number], required: true }, // Vector field
        chunkIndex: { type: Number, required: true },
    },
    { timestamps: true }
);

// Create a compound index for vector search if needed, 
// but Atlas Vector Search uses a separate index definition.
// We can add a standard index for filtering.
DocumentChunkSchema.index({ materialId: 1 });
DocumentChunkSchema.index({ courseId: 1 });

const DocumentChunk: Model<IDocumentChunk> =
    mongoose.models.DocumentChunk ||
    mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);

export default DocumentChunk;
