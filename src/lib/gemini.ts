import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
// You need to add GEMINI_API_KEY to your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use the Gemini 1.5 Flash model for speed and efficiency
if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
}
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
