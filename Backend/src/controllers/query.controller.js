import { retrieveTopChunks } from "../services/retrieval.service.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Chat from "../models/chat.model.js";

// Helper to pause execution for exponential backoff
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Attempts to generate content and retries on 503 (High Traffic) or 429 (Rate Limit) errors.
 * @param {Object} model - The initialized Gemini model instance.
 * @param {String} prompt - The prompt to send.
 * @param {Number} maxRetries - Maximum number of attempts before failing.
 */
async function generateContentWithRetry(model, prompt, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await model.generateContent(prompt);
        } catch (error) {
            // Check if it's a 503 High Traffic or 429 Rate Limit error
            if (error.status === 503 || error.status === 429 || (error.message && error.message.includes("503"))) {
                // If we've reached max retries, throw the error to be caught by the main controller block
                if (attempt === maxRetries - 1) throw error;

                const waitTime = (2 ** attempt) * 1000; // 1s, 2s, 4s...
                console.warn(`[API Warning] Gemini API busy. Retrying in ${waitTime / 1000}s... (Attempt ${attempt + 1} of ${maxRetries})`);
                await wait(waitTime);
            } else {
                // For other errors (e.g., bad auth, bad request), throw immediately without retrying
                throw error;
            }
        }
    }
}

export async function askQuestion(req, res) {
    try {
        const { question } = req.body;
        const userId = req.user.id;

        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        const chunks = await retrieveTopChunks(question, userId);

        if (!chunks || chunks.length === 0) {
            return res.json({
                answer: ["I couldn't find an answer. Have you uploaded a document yet?"],
                sources: [],
            });
        }

        const contextText = chunks.map(c => c.text).join("\n\n---\n\n");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // The correct, modern model!
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Use the context to answer as a bulleted list. Context: ${contextText} Question: ${question}`;

        // === UPDATED: Use the retry mechanism here ===
        const result = await generateContentWithRetry(model, prompt);

        const rawAnswer = result.response.text();
        const answerArray = rawAnswer.split('\n').filter(p => p.trim().length > 0);
        const uniqueSources = [...new Set(chunks.map(c => c.source || "Manual"))];

        const newChat = await Chat.create({
            userId: userId,
            question: question,
            answer: answerArray,
            sources: uniqueSources
        });

        res.status(200).json({
            answer: answerArray,
            sources: uniqueSources,
            chatId: newChat._id
        });

    } catch (err) {
        console.error("CRASH ERROR:", err);

        // Safely catch the 503 High Traffic error without crashing the server!
        if (err.status === 503 || (err.message && err.message.includes("503"))) {
            return res.status(503).json({
                answer: ["Google's AI is currently experiencing high traffic. Please wait a few seconds and try asking again!"],
                sources: []
            });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function getChatHistory(req, res) {
    try {
        const history = await Chat.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (err) {
        console.error("Fetch History Error:", err);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
}

export async function deleteChat(req, res) {
    try {
        const { id } = req.params;
        await Chat.findByIdAndDelete(id);
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Failed to delete chat" });
    }
}