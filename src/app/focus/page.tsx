"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Timer,
    Play,
    Pause,
    RotateCcw,
    Coffee,
    Target,
    Flame,
    Clock,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";

type TimerMode = "focus" | "short-break" | "long-break";

const TIMER_CONFIGS = {
    focus: { duration: 25 * 60, label: "Focus Time", color: "text-primary" },
    "short-break": { duration: 5 * 60, label: "Short Break", color: "text-green-500" },
    "long-break": { duration: 15 * 60, label: "Long Break", color: "text-accent" },
};

interface Session {
    id: string;
    type: TimerMode;
    duration: number;
    completedAt: Date;
}

export default function FocusMode() {
    const { data: sessions = [], refetch } = useQuery<Session[]>({
        queryKey: ["focus-sessions"],
        queryFn: async () => {
            const res = await fetch("/api/focus-sessions");
            if (!res.ok) throw new Error("Failed to fetch sessions");
            return res.json();
        },
    });

    const createSessionMutation = useMutation({
        mutationFn: async (data: { type: TimerMode; duration: number }) => {
            const res = await fetch("/api/focus-sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save session");
            return res.json();
        },
        onSuccess: () => {
            refetch();
        },
    });

    const [mode, setMode] = useState<TimerMode>("focus");
    const [timeLeft, setTimeLeft] = useState(TIMER_CONFIGS.focus.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [focusStreak, setFocusStreak] = useState(0);

    const config = TIMER_CONFIGS[mode];

    useEffect(() => {
        setTimeLeft(TIMER_CONFIGS[mode].duration);
        setIsRunning(false);
    }, [mode]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            handleSessionComplete();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const handleSessionComplete = () => {
        createSessionMutation.mutate({
            type: mode,
            duration: TIMER_CONFIGS[mode].duration,
        });

        if (mode === "focus") {
            setFocusStreak((prev) => prev + 1);
            toast.success("Great work! 🎉", {
                description: "Focus session completed. Take a break!",
            });
        } else {
            toast.success("Break over!", {
                description: "Ready to get back to work?",
            });
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = ((TIMER_CONFIGS[mode].duration - timeLeft) / TIMER_CONFIGS[mode].duration) * 100;

    const totalFocusTime = sessions
        .filter((s) => s.type === "focus")
        .reduce((acc, s) => acc + s.duration, 0);

    const todaySessions = sessions.filter(
        (s) => new Date(s.completedAt).toDateString() === new Date().toDateString()
    ).length;

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold font-display flex items-center gap-3">
                    <Timer className="h-8 w-8 text-primary" />
                    Focus Mode
                </h1>
                <p className="text-muted-foreground text-lg">
                    Stay productive with Pomodoro technique and track your progress
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timer */}
                <div className="lg:col-span-2 rounded-xl border border-border bg-card p-8 space-y-8">
                    {/* Mode Selector */}
                    <div className="flex justify-center gap-2">
                        {(Object.keys(TIMER_CONFIGS) as TimerMode[]).map((m) => (
                            <Button
                                key={m}
                                variant={mode === m ? "default" : "outline"}
                                onClick={() => setMode(m)}
                                className={mode === m ? "bg-primary border-0" : ""}
                            >
                                {m === "focus" && <Target className="mr-2 h-4 w-4" />}
                                {m === "short-break" && <Coffee className="mr-2 h-4 w-4" />}
                                {m === "long-break" && <Coffee className="mr-2 h-4 w-4" />}
                                {TIMER_CONFIGS[m].label}
                            </Button>
                        ))}
                    </div>

                    {/* Timer Display */}
                    <div className="relative flex flex-col items-center justify-center py-8">
                        <div className="relative">
                            <svg className="w-64 h-64 -rotate-90">
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-secondary"
                                />
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 120}
                                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                                    className={config.color}
                                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-6xl font-bold font-display ${config.color}`}>
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="text-muted-foreground mt-2">{config.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => setTimeLeft(TIMER_CONFIGS[mode].duration)}
                            disabled={isRunning}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            className="w-32 bg-primary hover:opacity-90"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? (
                                <>
                                    <Pause className="mr-2 h-5 w-5" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-5 w-5" />
                                    Start
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Stats & Sessions */}
                <div className="space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-border bg-card p-4 text-center">
                            <Flame className="h-6 w-6 text-accent mx-auto mb-2" />
                            <p className="text-2xl font-bold font-display">{focusStreak}</p>
                            <p className="text-xs text-muted-foreground">Focus Streak</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4 text-center">
                            <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold font-display">
                                {Math.floor(totalFocusTime / 60)}m
                            </p>
                            <p className="text-xs text-muted-foreground">Total Focus</p>
                        </div>
                    </div>

                    {/* Today's Progress */}
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <h3 className="font-semibold">Today's Progress</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sessions</span>
                                <span className="font-medium">{todaySessions} / 8</span>
                            </div>
                            <Progress value={(todaySessions / 8) * 100} className="h-2" />
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <h3 className="font-semibold">Recent Sessions</h3>
                        {sessions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No sessions yet. Start your first focus session!
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {sessions.slice(0, 5).map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between rounded-lg bg-secondary/50 p-2 text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>{TIMER_CONFIGS[session.type as TimerMode].label}</span>
                                        </div>
                                        <span className="text-muted-foreground">
                                            {new Date(session.completedAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
