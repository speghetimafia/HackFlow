import { IdeaForm } from "@/components/idea-form"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"

export default async function EditIdeaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect(`/api/auth/signin?callbackUrl=/ideas/${id}/edit`)
    }

    const idea = await prisma.idea.findUnique({
        where: { id },
    })

    if (!idea) {
        notFound()
    }

    // @ts-ignore
    if (idea.userId !== session.user.id) {
        redirect("/")
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Edit Idea</h1>
                <p className="text-muted-foreground">
                    Update your project details.
                </p>
            </div>
            <IdeaForm
                isEditing
                initialData={{
                    id: idea.id,
                    title: idea.title,
                    description: idea.description,
                    tags: idea.tags,
                }}
            />
        </div>
    )
}
