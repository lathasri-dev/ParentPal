const connectPinecone = require("../config/pinecone");
const { getEmbedding } = require("./aiService");

const indexName =
    process.env.PINECONE_INDEX || "parentpal";


// ============================================================
// QUERY PINECONE
// ============================================================

exports.queryVectorDB = async (
    queryText,
    topK = 3,
    filter = {}
) => {

    const pc = connectPinecone();

    if (!pc) {
        throw new Error(
            "Pinecone client not initialized"
        );
    }

    const index = pc.index(indexName);

    try {

        console.log("\n[Embedding]");
        console.log(
            "Generating query embedding..."
        );

        const vector =
            await getEmbedding(queryText);

        console.log(
            `Embedding success: true`
        );

        console.log(
            `Vector dimension: ${vector.length}`
        );


        // --------------------------------------------------------
        // Pinecone query
        // --------------------------------------------------------

        const queryParams = {
            vector: vector,
            topK: topK,
            includeMetadata: true
        };


        // Add metadata filter if provided
        if (
            filter &&
            Object.keys(filter).length > 0
        ) {

            queryParams.filter = filter;
        }


        const queryResponse =
            await index.query(queryParams);


        console.log("\n[Pinecone]");
        console.log(
            "Filter applied:",
            JSON.stringify(filter)
        );

        console.log(
            "Number of vectors/results returned:",
            queryResponse.matches.length
        );


        return queryResponse.matches.map(
            (match) => ({
                ...match.metadata,
                score: match.score
            })
        );

    } catch (error) {

        console.error(
            "\n[Pinecone/Embedding] Error:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// UPSERT DATA INTO PINECONE
// ============================================================

exports.upsertVectorDB = async (
    id,
    text,
    metadata
) => {

    const pc = connectPinecone();

    if (!pc) {

        console.warn(
            "Pinecone not connected, skipping upsert."
        );

        return;
    }

    const index = pc.index(indexName);

    try {

        console.log(
            "\n[Embedding] (Upsert)"
        );

        console.log(
            "Generating embedding for Pinecone..."
        );


        // --------------------------------------------------------
        // Generate embedding
        // --------------------------------------------------------

        const vector =
            await getEmbedding(text);


        console.log(
            "Embedding success: true"
        );

        console.log(
            `Vector dimension: ${vector.length}`
        );


        // --------------------------------------------------------
        // Safety check
        // --------------------------------------------------------

        if (vector.length !== 768) {

            throw new Error(
                `Pinecone dimension mismatch. Expected 768, received ${vector.length}.`
            );
        }


        // --------------------------------------------------------
        // Upsert into Pinecone
        // --------------------------------------------------------

        await index.upsert([
            {
                id: String(id),

                values: vector,

                metadata: {
                    ...metadata,

                    // Store original text
                    text: text,

                    timestamp:
                        new Date().toISOString()
                }
            }
        ]);


        console.log(
            `✅ Pinecone Upsert Success: ${id} (${metadata.type || "unknown"})`
        );

    } catch (error) {

        console.error(
            "\n[Pinecone/Embedding Upsert] Error:",
            error.message
        );

        throw error;
    }
};