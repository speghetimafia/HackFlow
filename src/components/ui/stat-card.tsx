import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: { value: number; positive: boolean };
    className?: string;
}

export function StatCard({ icon: Icon, label, value, trend, className }: StatCardProps) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold font-display">{value}</p>
                    {trend && (
                        <p
                            className={cn(
                                "text-sm font-medium",
                                trend.positive ? "text-green-500" : "text-red-500"
                            )}
                        >
                            {trend.positive ? "+" : "-"}{Math.abs(trend.value)}% from last week
                        </p>
                    )}
                </div>
                <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
