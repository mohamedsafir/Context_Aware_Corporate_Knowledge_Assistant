/**
 * Split plain text into chunks
 */
export default function chunkText(text, chunkSize = 500, overlap = 50) {
    if (!text || typeof text !== "string") {
        throw new Error("chunkText expects text input");
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunkSize;
        chunks.push(text.slice(start, end));
        start = end - overlap;
    }

    return chunks;
}
