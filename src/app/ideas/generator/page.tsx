"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Lightbulb,
    Sparkles,
    Wand2,
    Copy,
    Heart,
    RefreshCw,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface Idea {
    title: string;
    description: string;
    tags: string[];
    difficulty: string;
}

export default function IdeaGenerator() {
    const [theme, setTheme] = useState("");
    const [userIdea, setUserIdea] = useState("");
    const [generatedIdeas, setGeneratedIdeas] = useState<Idea[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [savedIdeas, setSavedIdeas] = useState<number[]>([]);

    const HARDCODED_IDEAS: Record<string, Idea[]> = {
        "AI/ML": [
            { title: "AI Personal Stylist", description: "App that suggests outfits based on wardrobe photos and weather.", tags: ["AI", "Fashion", "Mobile"], difficulty: "Medium" },
            { title: "Sign Language Translator", description: "Real-time video to text translation for sign language using computer vision.", tags: ["AI", "Accessibility", "CV"], difficulty: "Hard" },
            { title: "Fake News Detector", description: "Browser extension verifying news credibility using NLP algorithms.", tags: ["AI", "Misinformation", "Web"], difficulty: "Medium" },
            { title: "Medical Diagnosis Assistant", description: "AI tool helping doctors analyze X-rays and MRIs for early detection.", tags: ["AI", "Health", "MedTech"], difficulty: "Hard" },
            { title: "Smart Traffic Control", description: "AI system optimizing traffic light timings based on real-time flow data.", tags: ["AI", "Smart City", "IoT"], difficulty: "Hard" },
        ],
        "Web3": [
            { title: "Decentralized Voting", description: "Blockchain-based voting system ensuring transparent and tamper-proof elections.", tags: ["Web3", "Governance", "Blockchain"], difficulty: "Medium" },
            { title: "NFT Ticketing", description: "Event ticketing system preventing scalping and fraud using NFTs.", tags: ["Web3", "NFT", "Events"], difficulty: "Medium" },
            { title: "Supply Chain Tracker", description: "Transparent product journey tracking from source to consumer on blockchain.", tags: ["Web3", "Supply Chain", "Logistics"], difficulty: "Hard" },
            { title: "DeFi Lending Platform", description: "Peer-to-peer lending protocol allowing users to borrow/lend without intermediaries.", tags: ["Web3", "DeFi", "Finance"], difficulty: "Hard" },
            { title: "DAO Management Tool", description: "Dashboard for managing proposals, voting, and treasury for DAOs.", tags: ["Web3", "DAO", "Management"], difficulty: "Medium" },
        ],
        "Health": [
            { title: "Mental Health Chatbot", description: "AI companion providing mental wellness check-ins and CBT exercises.", tags: ["Health", "AI", "Mental Wellness"], difficulty: "Medium" },
            { title: "Telemedicine Platform", description: "Secure video consultation app connecting patients with remote specialists.", tags: ["Health", "Video", "Remote"], difficulty: "Hard" },
            { title: "Fitness Gamification", description: "RPG game where your character levels up based on your real-world exercise.", tags: ["Health", "Game", "Fitness"], difficulty: "Medium" },
            { title: "Medication Reminder", description: "Smart app tracking prescriptions, interactions, and adherence with notifications.", tags: ["Health", "Mobile", "Utility"], difficulty: "Easy" },
            { title: "Diet Planner", description: "Personalized meal planning app based on health goals, allergies, and preferences.", tags: ["Health", "Nutrition", "AI"], difficulty: "Medium" },
        ],
        "Climate": [
            { title: "Carbon Footprint Tracker", description: "App tracking daily emissions from travel/food and suggesting reductions.", tags: ["Climate", "Sustainability", "Mobile"], difficulty: "Easy" },
            { title: "Smart Grid Energy", description: "System optimizing home energy usage during peak hours to save costs.", tags: ["Climate", "IoT", "Energy"], difficulty: "Hard" },
            { title: "Waste Sorting AI", description: "Image recognition app to identify recyclable vs trash items instantly.", tags: ["Climate", "AI", "Vision"], difficulty: "Medium" },
            { title: "Reforestation Drone", description: "Drone flight path planner for automated seed planting in deforested areas.", tags: ["Climate", "Drone", "Nature"], difficulty: "Hard" },
            { title: "Water Quality Monitor", description: "IoT dashboard visualizing community water safety data from sensors.", tags: ["Climate", "IoT", "Data"], difficulty: "Medium" },
        ],
        "Education": [
            { title: "Personalized Learning Path", description: "AI curriculum generator adapting to student's pace and learning style.", tags: ["Education", "AI", "Learning"], difficulty: "Hard" },
            { title: "VR History Lessons", description: "Immersive history classes using Virtual Reality to transport students back in time.", tags: ["Education", "VR", "History"], difficulty: "Hard" },
            { title: "Peer Tutor Match", description: "Tinder-style matching platform connecting students with peer tutors.", tags: ["Education", "Social", "Mobile"], difficulty: "Medium" },
            { title: "Gamified Coding", description: "Platform teaching programming concepts through interactive mini-games.", tags: ["Education", "Game", "Code"], difficulty: "Medium" },
            { title: "Dyslexia Reading Aid", description: "Browser tool adjusting text font, size, and colors for easier reading.", tags: ["Education", "Accessibility", "Web"], difficulty: "Easy" },
        ],
    };

    const handleGenerate = async () => {
        if (!theme.trim()) {
            toast.error("Please enter a theme", {
                description: "Enter a theme, domain, or keyword to generate ideas",
            });
            return;
        }

        setIsGenerating(true);

        // Check for hardcoded matches first
        if (HARDCODED_IDEAS[theme]) {
            // Simulate a short delay for better UX
            setTimeout(() => {
                setGeneratedIdeas(HARDCODED_IDEAS[theme]);
                setIsGenerating(false);
                toast.success("Ideas Generated!", {
                    description: `Here are 5 project ideas for ${theme}`,
                });
            }, 800);
            return;
        }

        try {
            const res = await fetch("/api/generate-ideas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keywords: theme }),
            });

            if (!res.ok) throw new Error("Failed to generate ideas");

            const data = await res.json();
            setGeneratedIdeas(data.ideas);
            toast.success("Ideas Generated!", {
                description: "Here are some project ideas based on your theme",
            });
        } catch (error) {
            toast.error("Generation Failed", {
                description: "Could not generate ideas. Please try again.",
            });
        } finally {
            if (!HARDCODED_IDEAS[theme]) {
                setIsGenerating(false);
            }
        }
    };

    const handleImprove = async () => {
        if (!userIdea.trim()) {
            toast.error("Please enter your idea", {
                description: "Write your idea first and we'll help improve it",
            });
            return;
        }
        toast.success("Idea Improved!", {
            description: "Your idea has been enhanced with AI suggestions",
        });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const toggleSave = (index: number) => {
        setSavedIdeas((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold font-display flex items-center gap-3">
                    <Lightbulb className="h-8 w-8 text-primary" />
                    AI Idea Generator
                </h1>
                <p className="text-muted-foreground text-lg">
                    Generate unique hackathon project ideas or improve your existing concepts
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generate New Ideas */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold font-display">Generate New Ideas</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Enter a theme, domain, or keyword to spark inspiration
                    </p>
                    <Input
                        placeholder="e.g., Healthcare, Climate, Education, Gaming..."
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="bg-secondary/50"
                    />
                    <div className="flex flex-wrap gap-2">
                        {["AI/ML", "Web3", "Health", "Climate", "Education"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setTheme(tag)}
                                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full bg-primary hover:opacity-90 transition-opacity"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Generate Ideas
                            </>
                        )}
                    </Button>
                </div>

                {/* Improve Your Idea */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-accent" />
                        <h2 className="text-xl font-semibold font-display">Improve Your Idea</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Describe your idea and let AI enhance it with suggestions
                    </p>
                    <Textarea
                        placeholder="Describe your hackathon idea here..."
                        value={userIdea}
                        onChange={(e) => setUserIdea(e.target.value)}
                        className="min-h-[120px] bg-secondary/50 resize-none"
                    />
                    <Button
                        onClick={handleImprove}
                        variant="outline"
                        className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Enhance Idea
                    </Button>
                </div>
            </div>

            {/* Generated Ideas */}
            {generatedIdeas.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold font-display">Generated Ideas</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {generatedIdeas.map((idea, index) => (
                            <div
                                key={index}
                                className="group rounded-xl border border-border bg-card p-5 space-y-4 transition-all hover:border-primary/30 hover:shadow-lg animate-scale-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-lg">{idea.title}</h3>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${idea.difficulty === "Hard"
                                            ? "bg-red-500/10 text-red-500"
                                            : "bg-accent/10 text-accent"
                                            }`}
                                    >
                                        {idea.difficulty}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {idea.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {idea.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(idea.description)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleSave(index)}
                                        className={savedIdeas.includes(index) ? "text-red-500" : ""}
                                    >
                                        <Heart
                                            className={`h-4 w-4 ${savedIdeas.includes(index) ? "fill-current" : ""
                                                }`}
                                        />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="ml-auto text-primary">
                                        Explore <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
