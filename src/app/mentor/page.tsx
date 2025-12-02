"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Sparkles,
    Send,
    User,
    Bot,
    Lightbulb,
    Code2,
    Palette,
    Rocket,
    RefreshCw,
} from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const suggestedPrompts = [
    {
        icon: Lightbulb,
        label: "Improve my idea",
        prompt: "I have an idea for a hackathon project. Can you help me improve it and identify potential challenges?",
    },
    {
        icon: Code2,
        label: "Tech stack advice",
        prompt: "What tech stack would you recommend for building a real-time collaborative web application?",
    },
    {
        icon: Palette,
        label: "UI/UX feedback",
        prompt: "How can I make my hackathon project's user interface more engaging and user-friendly?",
    },
    {
        icon: Rocket,
        label: "Pitch help",
        prompt: "Help me craft a compelling 2-minute pitch for my hackathon project.",
    },
];

const mockResponses: Record<string, string> = {
    idea: `Great question! Here's how I'd suggest improving your hackathon idea:

**1. Problem Clarity**
Make sure you can articulate the problem in one sentence. "We solve X for Y by doing Z."

**2. Unique Value Proposition**
What makes your solution different? Consider:
- Novel technology approach
- Underserved user segment
- Creative combination of existing solutions

**3. Technical Feasibility**
For a 24-48 hour hackathon:
- Start with core features only (MVP)
- Use existing APIs and libraries
- Have fallback options ready

**4. Demo Impact**
Design with the demo in mind:
- Clear visual progress indicators
- Impressive "wow" moments
- Prepare for offline scenarios

Would you like me to help with any specific aspect?`,

    tech: `Here's my recommended tech stack for a real-time collaborative web app:

**Frontend:**
- React with TypeScript for type safety
- Tailwind CSS for rapid styling
- Zustand or Jotai for state management

**Real-time:**
- Socket.io or Supabase Realtime for websockets
- CRDT libraries like Yjs for conflict resolution

**Backend:**
- Node.js with Express or Fastify
- PostgreSQL with Prisma ORM
- Redis for caching and pub/sub

**Deployment:**
- Vercel for frontend
- Railway or Render for backend
- Supabase for database + auth

**Quick Wins:**
- Use Shadcn/ui for pre-built components
- Implement Optimistic UI updates
- Add presence indicators early

This stack balances hackathon speed with production readiness!`,

    default: `I'd be happy to help with that! Here are some thoughts:

**Key Considerations:**
1. Focus on the core problem you're solving
2. Keep the scope manageable for the hackathon timeline
3. Prioritize features that showcase your innovation

**Action Items:**
- Define your MVP features clearly
- Identify potential technical blockers early
- Practice your demo and pitch

Would you like me to dive deeper into any of these areas?`,
};

export default function AIMentor() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response
        await new Promise((resolve) => setTimeout(resolve, 1500));

        let response = mockResponses.default;
        if (messageText.toLowerCase().includes("idea") || messageText.toLowerCase().includes("improve")) {
            response = mockResponses.idea;
        } else if (messageText.toLowerCase().includes("tech") || messageText.toLowerCase().includes("stack")) {
            response = mockResponses.tech;
        }

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-6 lg:p-8 h-[calc(100vh-2rem)] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="space-y-2 pb-4 border-b border-border">
                <h1 className="text-3xl lg:text-4xl font-bold font-display flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                    AI Mentor
                </h1>
                <p className="text-muted-foreground text-lg">
                    Get feedback on your ideas, solve challenges, and level up your project
                </p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-8">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <h2 className="text-2xl font-semibold font-display">How can I help you today?</h2>
                            <p className="text-muted-foreground max-w-md">
                                I'm your AI hackathon mentor. Ask me about improving ideas, technical decisions, or strategies for success.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                            {suggestedPrompts.map((prompt) => {
                                const Icon = prompt.icon;
                                return (
                                    <button
                                        key={prompt.label}
                                        onClick={() => handleSend(prompt.prompt)}
                                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md"
                                    >
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <span className="font-medium">{prompt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
                        >
                            {message.role === "assistant" && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-primary-foreground" />
                                </div>
                            )}
                            <div
                                className={`rounded-xl p-4 max-w-2xl ${message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {message.content}
                                </p>
                            </div>
                            {message.role === "user" && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                    <User className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Bot className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="rounded-xl bg-secondary p-4">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="pt-4 border-t border-border">
                <div className="flex gap-3">
                    <Textarea
                        placeholder="Ask me anything about your hackathon project..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[60px] max-h-[200px] resize-none bg-secondary/50"
                    />
                    <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="h-auto bg-primary hover:opacity-90"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
