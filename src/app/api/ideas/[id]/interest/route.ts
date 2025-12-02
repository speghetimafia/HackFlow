import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const ideaId = id
        // @ts-ignore
        const userId = session.user.id

        // Check if idea exists
        const idea = await prisma.idea.findUnique({
            where: { id: ideaId },
        })

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 })
        }

        // Prevent creator from joining their own idea
        if (idea.userId === userId) {
            return NextResponse.json({ error: "Cannot join your own idea" }, { status: 400 })
        }

        // Check if request already exists
        const existingRequest = await prisma.teamRequest.findUnique({
            where: {
                ideaId_userId: {
                    ideaId,
                    userId,
                },
            },
        })

        if (existingRequest) {
            return NextResponse.json({ error: "Request already sent" }, { status: 400 })
        }

        const request = await prisma.teamRequest.create({
            data: {
                ideaId,
                userId,
                status: "PENDING",
            },
        })

        return NextResponse.json(request, { status: 201 })
    } catch (error) {
        console.error("Error creating team request:", error)
        return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
    }
}
