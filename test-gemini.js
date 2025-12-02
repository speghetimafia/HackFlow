const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyDQPVexjPzjHpYNMpVNQ-ALre8bHSeSJ4k";
const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
    try {
        console.log("Testing Gemini API key...");

        // Try gemini-1.5-flash first
        console.log("\n1. Testing gemini-1.5-flash...");
        const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result1 = await model1.generateContent("Say hello in one word");
        const response1 = await result1.response;
        console.log("✅ gemini-1.5-flash works!");
        console.log("Response:", response1.text());

    } catch (error) {
        console.log("❌ gemini-1.5-flash failed:", error.message);

        // Try gemini-pro as fallback
        try {
            console.log("\n2. Testing gemini-pro...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Say hello in one word");
            const response2 = await result2.response;
            console.log("✅ gemini-pro works!");
            console.log("Response:", response2.text());
        } catch (error2) {
            console.log("❌ gemini-pro also failed:", error2.message);
            console.log("\n⚠️  API key might be invalid or not activated.");
        }
    }
}

testGemini();
