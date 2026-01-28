const openai = require("../services/openai");

async function askController(req, res, collection) {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        // 1. Create embedding
        const embed = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });

        const vector = embed.data[0].embedding;

        // 2. Vector search
        const results = await collection
            .aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: vector,
                        numCandidates: 100,
                        limit: 3,
                    },
                },
            ])
            .toArray();

        // 3. Format response
        const retrievedText = results.map((r, i) => ({
            chunk: i + 1,
            text: r.text,
        }));

        res.json({
            query,
            matches: retrievedText,
        });
    } catch (err) {
        console.error("ASK ERROR FULL:", err);
        res.status(500).json({
            error: "Ask failed",
            details: err.message,
        });
    }
}

module.exports = askController;
