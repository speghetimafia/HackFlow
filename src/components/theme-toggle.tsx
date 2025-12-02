"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-12 h-6 rounded-full bg-muted" />
    }

    const isDark = theme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isDark ? "bg-slate-800" : "bg-sky-200"
            )}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span className="sr-only">Toggle theme</span>
            <span
                className={cn(
                    "absolute left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform duration-300 shadow-sm",
                    isDark ? "translate-x-7" : "translate-x-0"
                )}
            >
                {isDark ? (
                    <Moon className="h-3 w-3 text-slate-900" />
                ) : (
                    <Sun className="h-3 w-3 text-yellow-500" />
                )}
            </span>

            {/* Background Icons for decoration */}
            <span className={cn("absolute left-1.5 text-yellow-600 transition-opacity duration-300", isDark ? "opacity-0" : "opacity-0")}>
                {/* Hidden when active to avoid clutter, or can be used for background track icons */}
            </span>
        </button>
    )
}
