"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    Plus,
    MapPin,
    ExternalLink,
    Trash2,
    Bell,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";

interface Deadline {
    id: string;
    name: string;
    date: string;
    location?: string;
    url?: string;
    reminderSet: boolean;
}

function getTimeRemaining(deadline: string) {
    const now = new Date().getTime();
    const target = new Date(deadline).getTime();
    const diff = target - now;

    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { expired: false, days, hours, minutes, seconds };
}

const EMPTY_ARRAY: Deadline[] = [];

export default function Deadlines() {
    const { data: deadlines = EMPTY_ARRAY, refetch } = useQuery({
        queryKey: ["deadlines"],
        queryFn: async () => {
            const res = await fetch("/api/deadlines");
            if (!res.ok) throw new Error("Failed to fetch deadlines");
            return res.json() as Promise<Deadline[]>;
        },
    });

    const [timeRemaining, setTimeRemaining] = useState<Record<string, ReturnType<typeof getTimeRemaining>>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newDeadline, setNewDeadline] = useState({
        name: "",
        date: "",
        location: "",
        url: "",
    });

    const createDeadlineMutation = useMutation({
        mutationFn: async (data: Omit<Deadline, "id" | "reminderSet">) => {
            const res = await fetch("/api/deadlines", {
                method: "POST",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to create deadline");
            return res.json();
        },
        onSuccess: () => {
            refetch();
            toast.success("Deadline added!");
            setNewDeadline({ name: "", date: "", location: "", url: "" });
            setIsDialogOpen(false);
        },
    });

    const deleteDeadlineMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/deadlines/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete deadline");
        },
        onSuccess: () => {
            refetch();
            toast.success("Deadline removed");
        },
    });

    const toggleReminderMutation = useMutation({
        mutationFn: async ({ id, reminderSet }: { id: string; reminderSet: boolean }) => {
            const res = await fetch(`/api/deadlines/${id}`, {
                method: "PUT",
                body: JSON.stringify({ reminderSet }),
            });
            if (!res.ok) throw new Error("Failed to update deadline");
            return res.json();
        },
        onSuccess: (data) => {
            refetch();
            toast.success(data.reminderSet ? "Reminder set!" : "Reminder removed", {
                description: data.reminderSet
                    ? "You'll be notified before the deadline"
                    : undefined,
            });
        },
    });

    useEffect(() => {
        const updateCountdowns = () => {
            const newTimeRemaining: Record<string, ReturnType<typeof getTimeRemaining>> = {};
            deadlines.forEach((d) => {
                newTimeRemaining[d.id] = getTimeRemaining(d.date);
            });
            setTimeRemaining(newTimeRemaining);
        };

        updateCountdowns();
        const interval = setInterval(updateCountdowns, 1000);
        return () => clearInterval(interval);
    }, [deadlines]);

    const handleAddDeadline = () => {
        if (!newDeadline.name || !newDeadline.date) {
            toast.error("Missing information", {
                description: "Please enter a name and date",
            });
            return;
        }

        createDeadlineMutation.mutate({
            name: newDeadline.name,
            date: new Date(newDeadline.date).toISOString(),
            location: newDeadline.location,
            url: newDeadline.url,
        });
    };

    const handleDelete = (id: string) => {
        deleteDeadlineMutation.mutate(id);
    };

    const toggleReminder = (id: string) => {
        const deadline = deadlines.find((d) => d.id === id);
        if (deadline) {
            toggleReminderMutation.mutate({ id, reminderSet: !deadline.reminderSet });
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-bold font-display flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-primary" />
                        Deadline Planner
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Never miss a hackathon deadline with live countdowns
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:opacity-90">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Deadline
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Deadline</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Hackathon Name</Label>
                                <Input
                                    placeholder="e.g., HackMIT 2024"
                                    value={newDeadline.name}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={newDeadline.date}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Location (Optional)</Label>
                                <Input
                                    placeholder="e.g., MIT, Cambridge MA"
                                    value={newDeadline.location}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Website URL (Optional)</Label>
                                <Input
                                    placeholder="https://..."
                                    value={newDeadline.url}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, url: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleAddDeadline} className="w-full">
                                Add Deadline
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Deadlines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deadlines.map((deadline, index) => {
                    const time = timeRemaining[deadline.id] || { expired: false, days: 0, hours: 0, minutes: 0, seconds: 0 };
                    const isUrgent = time.days < 3 && !time.expired;

                    return (
                        <div
                            key={deadline.id}
                            className={`group rounded-xl border bg-card p-6 space-y-4 transition-all hover:shadow-lg animate-slide-up ${isUrgent ? "border-destructive/50" : "border-border hover:border-primary/30"
                                }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold font-display">{deadline.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(deadline.date).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleReminder(deadline.id)}
                                        className={deadline.reminderSet ? "text-primary" : "text-muted-foreground"}
                                    >
                                        <Bell className={`h-4 w-4 ${deadline.reminderSet ? "fill-current" : ""}`} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(deadline.id)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Countdown */}
                            {!time.expired ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { value: time.days, label: "Days" },
                                        { value: time.hours, label: "Hours" },
                                        { value: time.minutes, label: "Min" },
                                        { value: time.seconds, label: "Sec" },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className={`rounded-lg p-3 text-center ${isUrgent ? "bg-destructive/10" : "bg-secondary"
                                                }`}
                                        >
                                            <p className={`text-2xl font-bold font-display ${isUrgent ? "text-destructive" : ""}`}>
                                                {item.value.toString().padStart(2, "0")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg bg-muted p-4 text-center">
                                    <p className="text-muted-foreground">Deadline passed</p>
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 pt-2 border-t border-border">
                                {deadline.location && (
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {deadline.location}
                                    </span>
                                )}
                                {deadline.url && (
                                    <a
                                        href={deadline.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
