"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface RequestListProps {
    requests: any[]
}

export function RequestList({ requests }: RequestListProps) {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "REJECTED" }) => {
            const res = await fetch(`/api/team-requests/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })

            if (!res.ok) {
                throw new Error("Failed to update request")
            }

            return res.json()
        },
        onSuccess: () => {
            toast.success("Request updated")
            queryClient.invalidateQueries({ queryKey: ["idea"] })
        },
        onError: () => {
            toast.error("Failed to update request")
        },
    })

    if (requests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Team Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No requests yet.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Team Requests ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={request.user.image} />
                                <AvatarFallback>{request.user.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{request.user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>

                        {request.status === "PENDING" ? (
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                    onClick={() => mutation.mutate({ id: request.id, status: "ACCEPTED" })}
                                    disabled={mutation.isPending}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => mutation.mutate({ id: request.id, status: "REJECTED" })}
                                    disabled={mutation.isPending}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${request.status === "ACCEPTED"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                {request.status}
                            </span>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
