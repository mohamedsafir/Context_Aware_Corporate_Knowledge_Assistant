export function buildContext(chunks) {
    return chunks
        .map((chunk, i) => `Context ${i + 1}:\n${chunk.text}`)
        .join("\n\n");
}
