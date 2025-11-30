import { hf, EMBEDDING_MODEL } from '@/lib/huggingface';
import DocumentChunk from '@/models/DocumentChunk';
import Material, { IMaterial } from '@/models/Material';
import Course from '@/models/Course';
import mongoose, { HydratedDocument } from 'mongoose';
import { DriveService } from './drive';
// const pdf = require('pdf-parse');

export class VectorService {
    static async generateEmbedding(text: string): Promise<number[]> {
        const output = await hf.featureExtraction({
            model: EMBEDDING_MODEL,
            inputs: text,
        });

        // HF featureExtraction returns (number | number[] | number[][])
        // For a single string input, it usually returns number[] (the embedding)
        if (Array.isArray(output) && typeof output[0] === 'number') {
            return output as number[];
        }
        // Handle potential nested array case (though unlikely for single input)
        else if (Array.isArray(output) && Array.isArray(output[0])) {
            return output[0] as number[];
        }

        throw new Error('Unexpected embedding format from Hugging Face');
    }

    static async processMaterial(
        material: HydratedDocument<IMaterial>,
        userEmail: string
    ) {
        if (material.isVectorized) return;

        try {
            const driveService = await DriveService.getClientForUser(userEmail);
            const buffer = await driveService.getFileContent(
                material.googleId,
                material.mimeType
            );

            let text = '';
            if (material.mimeType === 'application/pdf') {
                // const data = await pdf(buffer);
                // text = data.text;
                console.warn('PDF parsing temporarily disabled due to build issue');
            } else if (material.mimeType === 'text/plain') {
                text = buffer.toString('utf-8');
            } else {
                // Skip unsupported types for now
                return;
            }

            if (!text) return;

            // Chunking (Simple split by paragraphs or length)
            const chunks = text.match(/[\s\S]{1,1000}/g) || [];

            for (let i = 0; i < chunks.length; i++) {
                const chunkText = chunks[i];
                const embedding = await this.generateEmbedding(chunkText);

                await DocumentChunk.create({
                    materialId: material._id,
                    courseId: material.courseId,
                    text: chunkText,
                    embedding,
                    chunkIndex: i,
                });
            }

            // Update material status
            await Material.findByIdAndUpdate(material._id, { isVectorized: true });
        } catch (error) {
            console.error(`Failed to process material ${material.title}`, error);
        }
    }

    static cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    static async searchSimilarContent(
        query: string,
        courseGoogleId: string,
        limit: number = 5
    ) {
        // Find the internal Course ID using the Google ID
        const course = await Course.findOne({ googleId: courseGoogleId });
        if (!course) {
            console.error(`Course not found for Google ID: ${courseGoogleId}`);
            return [];
        }

        const queryEmbedding = await this.generateEmbedding(query);

        // Fetch all chunks for the course (In-memory search for local dev)
        // Note: For production with large datasets, use MongoDB Atlas Vector Search or a dedicated vector DB
        const chunks = await DocumentChunk.find({ courseId: course._id });

        if (!chunks.length) {
            return [];
        }

        // Calculate similarity scores
        const scoredChunks = chunks.map(chunk => ({
            _id: chunk._id,
            text: chunk.text,
            score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        // Sort by score descending and take top k
        scoredChunks.sort((a, b) => b.score - a.score);

        return scoredChunks.slice(0, limit);
    }
}
