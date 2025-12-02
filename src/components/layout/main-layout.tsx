"use client"

import { Sidebar } from "./sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationsPopover } from "@/components/notifications-popover";

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const isMobile = useIsMobile();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: session } = useSession();

    if (isMobile) {
        return (
            <div className="min-h-screen bg-background">
                {/* Mobile Header */}
                <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-lg">
                    <div className="flex h-full items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Zap className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-display text-lg font-bold">HackFlow</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {session?.user && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={session.user.image || ""} />
                                    <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                                </Avatar>
                            )}
                            <NotificationsPopover />
                            <ThemeToggle />
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-muted-foreground hover:text-foreground"
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-background pt-14">
                        <nav className="p-4 space-y-2">
                            {[
                                { label: "Dashboard", path: "/dashboard" },
                                { label: "Idea Generator", path: "/ideas/generator" },
                                { label: "Task Board", path: "/tasks" },
                                { label: "Deadlines", path: "/deadlines" },
                                { label: "Resources", path: "/resources" },
                                { label: "Focus Mode", path: "/focus" },
                                { label: "AI Mentor", path: "/mentor" },
                                { label: "Profile", path: "/profile" },
                            ].map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block rounded-lg px-4 py-3 text-lg font-medium text-foreground hover:bg-secondary"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    signOut({ callbackUrl: "/" });
                                }}
                                className="block w-full text-left rounded-lg px-4 py-3 text-lg font-medium text-destructive hover:bg-destructive/10"
                            >
                                Sign Out
                            </button>
                        </nav>
                    </div>
                )}

                {/* Content */}
                <main className="pt-14 px-4 pb-8">{children}</main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className={cn("ml-64 min-h-screen transition-all duration-300 flex flex-col")}>
                <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b bg-background/80 px-6 backdrop-blur">
                    <NotificationsPopover />
                    {session?.user && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{session.user.name}</span>
                            <Avatar>
                                <AvatarImage src={session.user.image || ""} />
                                <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                </header>
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
