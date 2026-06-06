import Chunk from "../models/chunk.model.js";
import generateEmbedding from "./embedding.service.js";
import mongoose from "mongoose"; // 🚨 ADDED: We need this to format the ID

export async function retrieveTopChunks(question, userId) { // 🚨 ADDED: userId parameter
    // 1. Convert the user's question into a vector
    const queryVector = await generateEmbedding(question);

    console.log("1. Query Vector Generated, length:", queryVector?.length);
    console.log("2. Searching for User ID:", userId); // Helpful for debugging

    if (!queryVector || queryVector.length === 0) {
        throw new Error("Failed to generate embedding for the question.");
    }

    // 2. Search the Chunk collection with the Privacy Filter
    const results = await Chunk.aggregate([
        {
            $vectorSearch: {
                index: "chunk_index",
                path: "embedding",
                queryVector: queryVector,
                numCandidates: 100,
                limit: 5,
                // 🚨 THE VIP BOUNCER: Only look at chunks owned by this user
                filter: {
                    userId: { $eq: new mongoose.Types.ObjectId(userId) }
                }
            },
        },
        {
            $project: {
                _id: 0,
                text: 1,
                chunkIndex: 1,
                source: 1,
                score: { $meta: "vectorSearchScore" },
            },
        },
    ]);

    console.log("MONGODB FOUND:", JSON.stringify(results, null, 2));

    return results;
}