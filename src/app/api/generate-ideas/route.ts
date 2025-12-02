import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { keywords, difficulty, teamSize } = await req.json();

        const prompt = `
            Generate 3 unique and innovative hackathon project ideas based on the following criteria:
            - Keywords/Topics: ${keywords || "General, Technology, Innovation"}
            - Difficulty Level: ${difficulty || "Medium"}
            - Ideal Team Size: ${teamSize || "2-4"} people

            For each idea, provide the following in a strictly valid JSON format array:
            [
                {
                    "title": "Idea Title",
                    "description": "A compelling 2-3 sentence description of the problem and solution.",
                    "tags": ["Tag1", "Tag2", "Tag3"],
                    "techStack": ["Tech1", "Tech2", "Tech3"],
                    "difficulty": "Easy/Medium/Hard"
                }
            ]
            
            Do not include any markdown formatting (like \`\`\`json). Just return the raw JSON array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response if it contains markdown code blocks
        let cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // Sometimes the model adds text before or after the JSON
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            cleanedText = jsonMatch[0];
        }

        const ideas = JSON.parse(cleanedText);

        return NextResponse.json({ ideas });
    } catch (error) {
        console.error("AI Generation Error:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        return NextResponse.json(
            { error: "Failed to generate ideas. Please try again.", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
