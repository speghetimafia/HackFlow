"use client"

import { useState, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    type: "INCOMING_REQUEST" | "REQUEST_UPDATE";
    title: string;
    message: string;
    date: string;
    status?: string;
    data?: {
        requestId: string;
        userImage?: string;
    };
}

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                // For simplicity, assuming all fetched are "unread" until opened or we track read state
                setUnreadCount(data.notifications.length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (requestId: string) => {
        try {
            const res = await fetch(`/api/team-requests/${requestId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACCEPTED" }),
            });
            if (!res.ok) throw new Error("Failed to accept");
            toast.success("Request Accepted");
            fetchNotifications();
        } catch (error) {
            toast.error("Failed to accept request");
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            const res = await fetch(`/api/team-requests/${requestId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED" }),
            });
            if (!res.ok) throw new Error("Failed to reject");
            toast.success("Request Rejected");
            fetchNotifications();
        } catch (error) {
            toast.error("Failed to reject request");
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                            {unreadCount} new
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loading && notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                    </div>
                ) : (
                    <div className="space-y-1">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="p-3 hover:bg-muted/50 transition-colors rounded-md">
                                <div className="flex gap-3">
                                    {notification.type === "INCOMING_REQUEST" && (
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={notification.data?.userImage} />
                                            <AvatarFallback>?</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                                        </p>

                                        {notification.type === "INCOMING_REQUEST" && notification.data && (
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    className="h-7 px-2 bg-green-600 hover:bg-green-700"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAccept(notification.data!.requestId);
                                                    }}
                                                >
                                                    <Check className="h-3 w-3 mr-1" /> Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleReject(notification.data!.requestId);
                                                    }}
                                                >
                                                    <X className="h-3 w-3 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
