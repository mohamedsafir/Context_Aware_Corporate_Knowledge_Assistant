import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    embedding: { type: [Number], required: true },
    source: { type: String }
}, { timestamps: true });

export default mongoose.model("Chunk", chunkSchema);