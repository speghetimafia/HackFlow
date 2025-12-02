"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    User,
    Github,
    Linkedin,
    Globe,
    Save,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";

interface UserProfile {
    name: string;
    email: string;
    image: string;
    bio: string;
    skills: string[];
    githubUrl: string;
    linkedinUrl: string;
    websiteUrl: string;
}

export default function ProfilePage() {
    const { data: profile, isLoading, refetch } = useQuery<UserProfile>({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await fetch("/api/profile");
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        },
    });

    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [newSkill, setNewSkill] = useState("");

    useEffect(() => {
        if (profile) {
            setFormData(profile);
        }
    }, [profile]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: Partial<UserProfile>) => {
            const res = await fetch("/api/profile", {
                method: "PUT",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update profile");
            return res.json();
        },
        onSuccess: () => {
            refetch();
            toast.success("Profile updated successfully");
        },
        onError: () => {
            toast.error("Failed to update profile");
        },
    });

    const handleSave = () => {
        updateProfileMutation.mutate(formData);
    };

    const addSkill = () => {
        if (newSkill.trim()) {
            setFormData((prev) => ({
                ...prev,
                skills: [...(prev.skills || []), newSkill.trim()],
            }));
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            skills: (prev.skills || []).filter((s) => s !== skillToRemove),
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                    <User className="h-8 w-8 text-primary" />
                    Your Profile
                </h1>
                <p className="text-muted-foreground">
                    Manage your personal information and public profile
                </p>
            </div>

            <div className="grid gap-8">
                {/* Basic Info */}
                <div className="space-y-4 rounded-xl border bg-card p-6">
                    <h2 className="text-xl font-semibold">Basic Information</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={formData.email || ""} disabled className="bg-muted" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                            value={formData.bio || ""}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Skills */}
                <div className="space-y-4 rounded-xl border bg-card p-6">
                    <h2 className="text-xl font-semibold">Skills</h2>
                    <div className="flex gap-2">
                        <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addSkill()}
                            placeholder="Add a skill (e.g. React, Python)"
                        />
                        <Button onClick={addSkill} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {formData.skills?.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                            >
                                {skill}
                                <button
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 hover:text-destructive"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4 rounded-xl border bg-card p-6">
                    <h2 className="text-xl font-semibold">Social Links</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Github className="h-5 w-5 text-muted-foreground" />
                            <Input
                                value={formData.githubUrl || ""}
                                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                placeholder="GitHub Profile URL"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Linkedin className="h-5 w-5 text-muted-foreground" />
                            <Input
                                value={formData.linkedinUrl || ""}
                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                placeholder="LinkedIn Profile URL"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <Input
                                value={formData.websiteUrl || ""}
                                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                placeholder="Personal Website URL"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                        className="w-full md:w-auto"
                    >
                        {updateProfileMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
