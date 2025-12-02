import { NextResponse } from "next/server";
import { model as geminiModel } from "@/lib/gemini";
import { chatWithOpenRouter } from "@/lib/openrouter";

export async function POST(req: Request) {
    try {
        const { message, history, provider } = await req.json();

        // Determine which provider to use
        // Default to Grok if key is present, otherwise Gemini
        const useGrok = process.env.OPENROUTER_API_KEY && (provider === "grok" || !provider);

        if (useGrok) {
            try {
                const messages = history.map((msg: any) => ({
                    role: msg.role === "user" ? "user" : "assistant",
                    content: msg.content
                }));
                messages.push({ role: "user", content: message });

                const data = await chatWithOpenRouter(messages);
                const responseText = data.choices[0].message.content;
                return NextResponse.json({ response: responseText });
            } catch (grokError) {
                console.error("Grok Error, falling back to Gemini if available:", grokError);
                // Fallback to Gemini if Grok fails and Gemini is available
                if (!process.env.GEMINI_API_KEY) throw grokError;
            }
        }

        // Gemini Implementation
        const chat = geminiModel.startChat({
            history: history.map((msg: any) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("AI Mentor Error:", error);
        return NextResponse.json(
            { error: "Failed to get response from AI Mentor." },
            { status: 500 }
        );
    }
}
