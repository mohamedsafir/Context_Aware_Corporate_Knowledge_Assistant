export function buildPrompt(context, question) {
    return `
You are an AI assistant.

Use ONLY the context below to answer the question.
If the answer is not found, say "Not found in document."

--------------------
${context}
--------------------

Question:
${question}

Answer:
`;
}
