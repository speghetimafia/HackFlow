"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Search,
    ExternalLink,
    Bookmark,
    BookmarkCheck,
    Database,
    Code2,
    Palette,
    Server,
    Smartphone,
    Brain,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    category: string;
    tags: string[];
}

const categories = [
    { id: "all", label: "All", icon: BookOpen },
    { id: "apis", label: "APIs", icon: Server },
    { id: "datasets", label: "Datasets", icon: Database },
    { id: "tutorials", label: "Tutorials", icon: Code2 },
    { id: "design", label: "Design", icon: Palette },
    { id: "mobile", label: "Mobile", icon: Smartphone },
    { id: "ai-ml", label: "AI/ML", icon: Brain },
];

const resourcesData: Resource[] = [
    {
        id: "1",
        title: "OpenAI API",
        description: "Access GPT models for natural language processing tasks. Build chatbots, content generators, and more.",
        url: "https://openai.com/api",
        category: "apis",
        tags: ["AI", "NLP", "LLM"],
    },
    {
        id: "2",
        title: "Stripe API",
        description: "Payment processing infrastructure for the internet. Accept payments and manage subscriptions.",
        url: "https://stripe.com/docs",
        category: "apis",
        tags: ["Payments", "Finance"],
    },
    {
        id: "3",
        title: "Kaggle Datasets",
        description: "Massive collection of datasets for machine learning projects. From images to time series data.",
        url: "https://kaggle.com/datasets",
        category: "datasets",
        tags: ["ML", "Data Science"],
    },
    {
        id: "4",
        title: "FreeCodeCamp",
        description: "Learn to code for free with interactive tutorials covering web development, data science, and more.",
        url: "https://freecodecamp.org",
        category: "tutorials",
        tags: ["Learning", "Web Dev"],
    },
    {
        id: "5",
        title: "Figma Community",
        description: "Free design resources, UI kits, and templates from the Figma community.",
        url: "https://figma.com/community",
        category: "design",
        tags: ["UI/UX", "Design System"],
    },
    {
        id: "6",
        title: "React Native",
        description: "Build native mobile apps using React. Cross-platform development made easy.",
        url: "https://reactnative.dev",
        category: "mobile",
        tags: ["Mobile", "React"],
    },
    {
        id: "7",
        title: "Hugging Face",
        description: "Access thousands of pre-trained AI models for NLP, computer vision, and more.",
        url: "https://huggingface.co",
        category: "ai-ml",
        tags: ["AI", "Models"],
    },
    {
        id: "8",
        title: "Tailwind UI",
        description: "Beautiful UI components built with Tailwind CSS. Production-ready templates and examples.",
        url: "https://tailwindui.com",
        category: "design",
        tags: ["CSS", "Components"],
    },
    {
        id: "9",
        title: "Firebase",
        description: "Google's app development platform with authentication, database, and hosting services.",
        url: "https://firebase.google.com",
        category: "apis",
        tags: ["Backend", "Database"],
    },
    {
        id: "10",
        title: "TensorFlow Tutorials",
        description: "Official TensorFlow tutorials for machine learning and deep learning projects.",
        url: "https://tensorflow.org/tutorials",
        category: "tutorials",
        tags: ["AI", "ML", "Deep Learning"],
    },
    {
        id: "11",
        title: "Government Open Data",
        description: "Access public datasets from government sources worldwide for civic tech projects.",
        url: "https://data.gov",
        category: "datasets",
        tags: ["Civic Tech", "Public Data"],
    },
    {
        id: "12",
        title: "Expo",
        description: "Framework for building React Native apps with easy deployment and OTA updates.",
        url: "https://expo.dev",
        category: "mobile",
        tags: ["React Native", "Mobile"],
    },
];

export default function Resources() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const { data: bookmarked = [], refetch } = useQuery({
        queryKey: ["bookmarks"],
        queryFn: async () => {
            const res = await fetch("/api/bookmarks");
            if (!res.ok) throw new Error("Failed to fetch bookmarks");
            return res.json() as Promise<string[]>;
        },
    });

    const toggleBookmarkMutation = useMutation({
        mutationFn: async (resourceId: string) => {
            const res = await fetch("/api/bookmarks", {
                method: "POST",
                body: JSON.stringify({ resourceId }),
            });
            if (!res.ok) throw new Error("Failed to toggle bookmark");
            return res.json();
        },
        onSuccess: (data, resourceId) => {
            refetch();
            const resource = resourcesData.find((r) => r.id === resourceId);
            toast.success(data.bookmarked ? "Added to bookmarks" : "Removed from bookmarks", {
                description: resource?.title,
            });
        },
    });

    const filteredResources = resourcesData.filter((resource) => {
        const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
        const matchesSearch =
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const toggleBookmark = (id: string) => {
        toggleBookmarkMutation.mutate(id);
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold font-display flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-primary" />
                    Resource Library
                </h1>
                <p className="text-muted-foreground text-lg">
                    Curated tools, APIs, datasets, and tutorials for your hackathon project
                </p>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-secondary/50"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category.id)}
                                className={
                                    selectedCategory === category.id
                                        ? "bg-primary border-0"
                                        : ""
                                }
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {category.label}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource, index) => (
                    <div
                        key={resource.id}
                        className="group rounded-xl border border-border bg-card p-5 space-y-3 transition-all hover:border-primary/30 hover:shadow-lg animate-scale-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {resource.title}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBookmark(resource.id)}
                                className={bookmarked.includes(resource.id) ? "text-primary" : "text-muted-foreground"}
                            >
                                {bookmarked.includes(resource.id) ? (
                                    <BookmarkCheck className="h-4 w-4 fill-current" />
                                ) : (
                                    <Bookmark className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {resource.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {resource.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            Visit resource <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No resources found matching your criteria</p>
                </div>
            )}
        </div>
    );
}
