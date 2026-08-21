const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // There is no direct "listModels" in the SDK usually, 
    // but we can try to fetch them via the REST endpoint if we wanted.
    // However, let's just try to hit "gemini-pro" which is very stable.

    console.log("Testing gemini-1.5-flash...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const res = await model.generateContent("test");
        console.log("gemini-1.5-flash works!");
    } catch (e) {
        console.log("gemini-1.5-flash failed:", e.message);
    }

    console.log("Testing gemini-pro...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const res = await model.generateContent("test");
        console.log("gemini-pro works!");
    } catch (e) {
        console.log("gemini-pro failed:", e.message);
    }
}
listModels();
