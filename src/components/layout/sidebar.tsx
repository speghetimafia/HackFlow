"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Lightbulb,
    KanbanSquare,
    Calendar,
    BookOpen,
    Timer,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Zap,
    User,
    LogOut,
    LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession, signIn } from "next-auth/react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Lightbulb, label: "Idea Generator", path: "/ideas/generator" },
    { icon: KanbanSquare, label: "Task Board", path: "/tasks" },
    { icon: Calendar, label: "Deadlines", path: "/deadlines" },
    { icon: BookOpen, label: "Resources", path: "/resources" },
    { icon: Timer, label: "Focus Mode", path: "/focus" },
    { icon: Sparkles, label: "AI Mentor", path: "/mentor" },
    { icon: User, label: "Profile", path: "/profile" },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { data: session, status } = useSession();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 ease-in-out bg-background",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        {!collapsed && (
                            <span className="font-display text-xl font-bold">HackFlow</span>
                        )}
                    </div>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="border-t border-border p-4 flex items-center justify-between gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => status === "authenticated" ? signOut({ callbackUrl: "/" }) : signIn("google", { callbackUrl: "/dashboard" })}
                        className={cn(
                            "flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors",
                            status === "authenticated"
                                ? "hover:bg-destructive/10 hover:text-destructive"
                                : "hover:bg-primary/10 hover:text-primary",
                            collapsed ? "w-full" : "flex-1 gap-2"
                        )}
                        title={status === "authenticated" ? "Sign Out" : "Sign In"}
                    >
                        {status === "authenticated" ? (
                            <>
                                <LogOut className="h-5 w-5" />
                                {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
                            </>
                        ) : (
                            <>
                                <LogIn className="h-5 w-5" />
                                {!collapsed && <span className="text-sm font-medium">Sign In</span>}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
