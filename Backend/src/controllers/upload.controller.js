import extractText from "../services/pdf.service.js";
import chunkText from "../services/chunk.service.js";
import createEmbedding from "../services/embedding.service.js";
import Chunk from "../models/chunk.model.js";


export async function uploadPDF(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF file uploaded" });
        }

        const text = await extractText(req.file.path);
        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "Failed to extract text." });
        }

        const chunks = chunkText(text);
        if (!chunks || chunks.length === 0) {
            return res.status(400).json({ error: "Chunking failed." });
        }

        let processedCount = 0;

        for (let i = 0; i < chunks.length; i++) {
            if (!chunks[i] || chunks[i].length < 20) continue;

            const embedding = await createEmbedding(chunks[i]);
            if (!embedding || embedding.length === 0) continue;

            await Chunk.create({
                userId: req.user.id, // 🚨 ADDED: Saves the employee's ID from the verifyToken middleware
                text: chunks[i],
                chunkIndex: i,
                embedding,
                source: req.file.originalname
            });

            processedCount++;
        }

        if (processedCount === 0) {
            return res.status(500).json({ error: "No valid chunks saved to the database." });
        }

        res.status(200).json({
            message: "✅ PDF uploaded and processed successfully",
            chunksSaved: processedCount
        });

    } catch (err) {
        console.error("UPLOAD ERROR 👉", err);
        res.status(500).json({ error: "PDF processing failed", details: err.message });
    }
}

// Fetch all unique documents uploaded by this user
export async function getUserDocuments(req, res) {
    try {
        // This asks MongoDB for a list of unique 'source' (filenames) for this specific user
        const documents = await Chunk.distinct("source", { userId: req.user.id });
        res.status(200).json(documents);
    } catch (err) {
        console.error("Fetch Docs Error:", err);
        res.status(500).json({ error: "Failed to fetch connected documents" });
    }
}

// Delete a document and all its associated chunks
export async function deleteUserDocument(req, res) {
    try {
        const { filename } = req.params;
        // Wipes all chunks from the database that match this user and this filename
        await Chunk.deleteMany({ userId: req.user.id, source: filename });
        res.status(200).json({ message: "Document chunks deleted successfully" });
    } catch (err) {
        console.error("Delete Doc Error:", err);
        res.status(500).json({ error: "Failed to delete document chunks" });
    }
}

// controllers/upload.controller.js
export async function uploadDocument(req, res) {
    try {
        const file = req.file;
        const userId = req.user.id; // Get the ID from the Auth Token

        // 1. Extract text from PDF
        const rawText = await extractTextFromPDF(file.buffer);

        // 2. Split text into chunks
        const chunks = splitIntoChunks(rawText);

        // 3. Generate vectors and SAVE WITH USER ID
        for (let i = 0; i < chunks.length; i++) {
            const vector = await generateVector(chunks[i]);

            await Chunk.create({
                userId: userId, // 🚨 Stamping the chunk!
                text: chunks[i],
                embedding: vector,
                source: file.originalname,
                chunkIndex: i
            });
        }

        res.status(200).json({ message: "Upload secure and complete!" });
    } catch (err) {
        // handle error
    }
}