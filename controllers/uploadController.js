const pdfParse = require("pdf-parse");
const chunkText = require("../utils/chunkText");
const openai = require("../services/openai");


async function uploadController(req, res, collection) {
    try {
        console.log("FILE:", req.file);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Try PDF parse
        const data = await pdfParse(req.file.buffer);
        console.log("PDF parsed OK, length:", data.text.length);

        const chunks = chunkText(data.text);
        console.log("Chunks:", chunks.length);

        for (const chunk of chunks) {
            const emb = await openai.embeddings.create({
                model: "text-embedding-004",
                input: chunk,
            });

            await collection.insertOne({
                text: chunk,
                embedding: emb.data[0].embedding,
            });
        }

        res.json({ message: "Upload successful" });
    } catch (err) {
        console.error("UPLOAD ERROR FULL:", err); // 👈 this line is key
        res.status(500).json({ error: "Upload failed", details: err.message });
    }
}

module.exports = uploadController;
