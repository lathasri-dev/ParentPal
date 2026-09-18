const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GOOGLE_API_KEY;

console.log(
    "DEBUG: Google API Key loaded?",
    apiKey
        ? "YES (Starts with " + apiKey.substring(0, 4) + "...)"
        : "NO"
);

if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({
    apiKey: apiKey
});

// ============================================================
// MODELS
// ============================================================

// Text generation model
const GENERATION_MODEL = "gemini-3.8-flash";

// Current Gemini embedding model
const EMBEDDING_MODEL = "gemini-embedding-001";

// Your Pinecone index dimension is 768
const EMBEDDING_DIMENSION = 768;


// ============================================================
// HELPER
// ============================================================

const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));


// ============================================================
// GEMINI TEXT GENERATION
// ============================================================

exports.generateContent = async (prompt, retries = 3) => {
    try {
        console.log(
            `\n[Gemini/Generate] Model: ${GENERATION_MODEL}`
        );

        const response = await ai.models.generateContent({
            model: GENERATION_MODEL,
            contents: prompt
        });

        if (!response || !response.text) {
            throw new Error(
                "Gemini returned an empty response."
            );
        }

        return response.text;

    } catch (error) {

        const message =
            error?.message || String(error);

        console.error(
            `[Gemini/Generate] Error: ${message}`
        );

        // Retry temporary API errors
        if (
            (
                message.includes("429") ||
                message.includes("503") ||
                message.includes("fetch") ||
                message.includes("overloaded")
            ) &&
            retries > 0
        ) {

            const backoff =
                2000 * Math.pow(2, 3 - retries);

            console.warn(
                `⚠️ Gemini API Error. Retrying in ${backoff}ms... (${retries} attempts left)`
            );

            await delay(backoff);

            return exports.generateContent(
                prompt,
                retries - 1
            );
        }

        throw new Error(
            `AI generation failed: ${message}`
        );
    }
};


// ============================================================
// GEMINI EMBEDDING
// ============================================================

exports.getEmbedding = async (text, retries = 3) => {

    try {

        console.log(
            `\n[Embedding] Model: ${EMBEDDING_MODEL}`
        );

        const response =
            await ai.models.embedContent({
                model: EMBEDDING_MODEL,
                contents: text,
                config: {
                    outputDimensionality:
                        EMBEDDING_DIMENSION
                }
            });

        if (
            !response ||
            !response.embeddings ||
            response.embeddings.length === 0 ||
            !response.embeddings[0].values
        ) {
            throw new Error(
                "Gemini returned an empty embedding."
            );
        }

        const embedding =
            response.embeddings[0].values;

        console.log(
            `[Embedding] Generated vector dimension: ${embedding.length}`
        );

        // Safety check for Pinecone
        if (
            embedding.length !==
            EMBEDDING_DIMENSION
        ) {
            throw new Error(
                `Embedding dimension mismatch. Expected ${EMBEDDING_DIMENSION}, received ${embedding.length}.`
            );
        }

        return embedding;

    } catch (error) {

        const message =
            error?.message || String(error);

        console.error(
            `⚠️ Gemini Embedding Error: ${message}`
        );

        // Retry temporary errors
        if (
            (
                message.includes("429") ||
                message.includes("503") ||
                message.includes("fetch") ||
                message.includes("overloaded")
            ) &&
            retries > 0
        ) {

            const backoff =
                2000 * Math.pow(2, 3 - retries);

            console.warn(
                `⚠️ Embedding API Error. Retrying in ${backoff}ms... (${retries} attempts left)`
            );

            await delay(backoff);

            return exports.getEmbedding(
                text,
                retries - 1
            );
        }

        // Do NOT use the old embedding-001 fallback.
        console.error(
            "❌ Gemini Embedding Failed permanently."
        );

        throw new Error(
            `Embedding generation failed: ${message}`
        );
    }
};