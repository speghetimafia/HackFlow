import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface IdeaCardProps {
    idea: {
        id: string
        title: string
        description: string
        tags: string[]
        createdAt: string | Date
        user: {
            name: string | null
            image: string | null
        }
        _count?: {
            teamRequests: number
        }
    }
}

export function IdeaCard({ idea }: IdeaCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <CardTitle className="line-clamp-1 text-xl">{idea.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={idea.user.image || ""} />
                                <AvatarFallback>{idea.user.name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <span>{idea.user.name || "Anonymous"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-3 mb-4">
                    {idea.description}
                </p>
                <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{idea._count?.teamRequests || 0} interested</span>
                </div>
                <Link href={`/ideas/${idea.id}`}>
                    <Button className="w-full sm:w-auto">
                        More Details
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
