"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, LogOut } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TeamMembersProps {
    members: any[]
    ownerName: string
    ownerImage: string | null
}

export function TeamMembers({ members, ownerName, ownerImage }: TeamMembersProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const acceptedMembers = members.filter(m => m.status === "ACCEPTED")

    const handleLeave = async (requestId: string) => {
        try {
            const res = await fetch(`/api/team-requests/${requestId}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to leave team")

            toast.success("You have left the team")
            router.refresh()
        } catch (error) {
            toast.error("Failed to leave team")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members ({acceptedMembers.length + 1})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Owner */}
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5">
                    <Avatar>
                        <AvatarImage src={ownerImage || ""} />
                        <AvatarFallback>{ownerName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-medium text-sm">{ownerName}</p>
                        <p className="text-xs text-muted-foreground">Creator</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary text-primary-foreground">
                        Owner
                    </span>
                </div>

                {/* Accepted Members */}
                {acceptedMembers.map((member) => {
                    // @ts-ignore
                    const isCurrentUser = session?.user?.id === member.userId
                    return (
                        <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                            <Avatar>
                                <AvatarImage src={member.user.image} />
                                <AvatarFallback>{member.user.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{member.user.name}</p>
                                <p className="text-xs text-muted-foreground">{member.user.email}</p>
                            </div>
                            {isCurrentUser ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                                    onClick={() => handleLeave(member.id)}
                                >
                                    <LogOut className="h-4 w-4 mr-1" />
                                    Leave
                                </Button>
                            ) : (
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    Member
                                </span>
                            )}
                        </div>
                    )
                })}

                {acceptedMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No team members yet. Share your idea to find collaborators!
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
