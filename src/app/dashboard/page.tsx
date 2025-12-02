import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle2,
    Clock,
    Flame,
    Target,
    TrendingUp,
    Lightbulb,
    Calendar,
    ArrowRight,
    LayoutDashboard,
} from "lucide-react";



export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/dashboard");
    }

    // @ts-expect-error
    const userId = session.user.id;

    let myIdeas: any[] = [];
    let joinedIdeas: any[] = [];
    let deadlines: any[] = [];

    try {
        [myIdeas, joinedIdeas, deadlines] = await Promise.all([
            prisma.idea.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.teamRequest.findMany({
                where: {
                    userId,
                    status: "ACCEPTED",
                },
                include: {
                    idea: true,
                },
                take: 5,
            }),
            prisma.deadline.findMany({
                where: { userId },
                orderBy: { date: "asc" },
                take: 3,
            }),
        ]);
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Fallback to empty arrays is already handled by initialization
    }

    const ideasCount = myIdeas.length;
    const joinedCount = joinedIdeas.length;

    return (
        <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold font-display">
                    Welcome back, <span className="text-primary">{session.user?.name || "Hacker"}</span> 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    Here&apos;s your productivity overview for today
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Lightbulb}
                    label="Ideas Created"
                    value={ideasCount}
                    trend={{ value: ideasCount, positive: true }}
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Joined Projects"
                    value={joinedCount}
                    trend={{ value: joinedCount, positive: true }}
                />
                <StatCard
                    icon={Flame}
                    label="Day Streak"
                    value={1}
                    trend={{ value: 0, positive: true }}
                />
                <StatCard
                    icon={Target}
                    label="Weekly Goal"
                    value={`${Math.min(100, Math.round((ideasCount / 3) * 100))}%`}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Ideas (My Ideas) */}
                <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold font-display">My Recent Ideas</h2>
                        <Link href="/ideas/new">
                            <Button variant="ghost" size="sm" className="text-primary">
                                Create New <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {myIdeas.length === 0 ? (
                            <p className="text-muted-foreground">No ideas created yet.</p>
                        ) : (
                            myIdeas.map((idea: any) => (
                                <Link
                                    key={idea.id}
                                    href={`/ideas/${idea.id}`}
                                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:bg-secondary/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="font-medium">{idea.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(idea.createdAt).toLocaleDateString()}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold font-display">Deadlines</h2>
                        <Link href="/deadlines">
                            <Button variant="ghost" size="sm" className="text-primary">
                                <Calendar className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {deadlines.length === 0 ? (
                            <p className="text-muted-foreground">No upcoming deadlines.</p>
                        ) : (
                            deadlines.map((deadline: any) => {
                                const daysLeft = Math.ceil(
                                    (new Date(deadline.date).getTime() - new Date().getTime()) /
                                    (1000 * 60 * 60 * 24)
                                );
                                return (
                                    <div key={deadline.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{deadline.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {daysLeft > 0 ? `${daysLeft} days` : "Today"}
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.max(0, 100 - daysLeft * 3)}
                                            className="h-2"
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Team Projects - Ideas where user is an accepted member */}
            {joinedIdeas.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold font-display">My Team Projects</h2>
                        <span className="text-sm text-muted-foreground">{joinedIdeas.length} projects</span>
                    </div>
                    <div className="space-y-3">
                        {joinedIdeas.map((request: any) => (
                            <Link
                                key={request.id}
                                href={`/ideas/${request.idea.id}`}
                                className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:bg-secondary/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <div>
                                        <span className="font-medium">{request.idea.title}</span>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Team Member
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    Joined {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/ideas/generator" className="group">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg">
                        <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                            <Lightbulb className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Generate Ideas</h3>
                            <p className="text-sm text-muted-foreground">
                                Get AI-powered project suggestions
                            </p>
                        </div>
                        <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </Link>

                <Link href="/focus" className="group">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg">
                        <div className="rounded-lg bg-accent/10 p-3 group-hover:bg-accent/20 transition-colors">
                            <Clock className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Start Focus Session</h3>
                            <p className="text-sm text-muted-foreground">
                                Deep work with Pomodoro timer
                            </p>
                        </div>
                        <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                </Link>

                <Link href="/mentor" className="group">
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg">
                        <div className="rounded-lg bg-purple-500/10 p-3 group-hover:bg-purple-500/20 transition-colors">
                            <TrendingUp className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Ask AI Mentor</h3>
                            <p className="text-sm text-muted-foreground">
                                Get feedback on your ideas
                            </p>
                        </div>
                        <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                    </div>
                </Link>
            </div>
        </div >
    );
}
