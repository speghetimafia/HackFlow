import { IdeaForm } from "@/components/idea-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NewIdeaPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/ideas/new")
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Post a New Idea</h1>
                <p className="text-muted-foreground">
                    Share your concept and find the perfect team to build it with.
                </p>
            </div>
            <IdeaForm />
        </div>
    )
}
