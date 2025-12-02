import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
import { InterestButton } from "@/components/interest-button"
import { RequestList } from "@/components/request-list"
import Link from "next/link"
import { DeleteIdeaButton } from "@/components/delete-idea-button"
import { ShareIdeaButton } from "@/components/share-idea-button"
import { TeamMembers } from "@/components/team-members"

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const idea = await prisma.idea.findUnique({
        where: { id },
        include: {
            user: true,
            requests: {
                include: {
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    })

    if (!idea) {
        notFound()
    }

    // @ts-ignore
    const isOwner = session?.user?.id === idea.userId
    // @ts-ignore
    const hasRequested = idea.requests.some((req) => req.userId === session?.user?.id)
    // @ts-ignore
    const isAcceptedMember = idea.requests.some((req) => req.userId === session?.user?.id && req.status === "ACCEPTED")

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl md:text-4xl font-bold">{idea.title}</h1>
                    {isOwner && (
                        <div className="flex gap-2">
                            <ShareIdeaButton ideaId={idea.id} ideaTitle={idea.title} />
                            <Link href={`/ideas/${idea.id}/edit`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <DeleteIdeaButton id={idea.id} />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={idea.user.image || ""} />
                            <AvatarFallback>{idea.user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{idea.user.name}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(idea.createdAt), "PPP")}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-lg leading-relaxed">
                    {idea.description}
                </p>
            </div>

            <div className="border-t pt-8 space-y-6">
                {/* Team Members - visible to everyone */}
                <TeamMembers
                    members={idea.requests}
                    ownerName={idea.user.name || "Anonymous"}
                    ownerImage={idea.user.image}
                />

                {/* Request management - only for owner */}
                {isOwner && (
                    <RequestList requests={idea.requests.filter((r: any) => r.status === "PENDING")} />
                )}

                {/* Join button - only for non-owners and non-members */}
                {!isOwner && !isAcceptedMember && (
                    <div className="bg-muted/30 p-6 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Interested in this project?</h3>
                            <p className="text-muted-foreground">
                                Send a request to join the team. The owner will review your profile.
                            </p>
                        </div>
                        {session ? (
                            <InterestButton ideaId={idea.id} hasRequested={hasRequested} />
                        ) : (
                            <Link href="/api/auth/signin">
                                <Button>Sign in to Join</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
