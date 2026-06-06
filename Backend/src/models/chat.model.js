import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    question: {
        type: String,
        required: true
    },
    // We store the answer as an array of strings so bullet points render nicely
    answer: {
        type: [String],
        required: true
    },
    // Array of unique filenames used to answer the question
    sources: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);