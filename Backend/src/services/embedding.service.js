import { pipeline } from "@xenova/transformers";

let embedder = null;

export default async function createEmbedding(text) {
    if (!embedder) {
        embedder = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }

    const output = await embedder(text, {
        pooling: "mean",
        normalize: true,
    });

    if (!output?.data) {
        throw new Error("Embedding generation failed");
    }

    return Array.from(output.data);
}
