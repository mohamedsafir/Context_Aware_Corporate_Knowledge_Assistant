import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema({
    chunkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chunk",
    },
    vector: {
        type: [Number],
        required: true,
    },
});

export default mongoose.model("Embedding", embeddingSchema);
