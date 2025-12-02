import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const idea = await prisma.idea.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, image: true, email: true },
                },
                requests: {
                    include: {
                        user: {
                            select: { id: true, name: true, image: true, email: true },
                        },
                    },
                },
            },
        })

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 })
        }

        return NextResponse.json(idea)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch idea" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const idea = await prisma.idea.findUnique({
            where: { id },
        })

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 })
        }

        // @ts-ignore
        if (idea.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { title, description, tags } = body

        const updatedIdea = await prisma.idea.update({
            where: { id },
            data: {
                title,
                description,
                tags,
            },
        })

        return NextResponse.json(updatedIdea)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update idea" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const idea = await prisma.idea.findUnique({
            where: { id },
        })

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 })
        }

        // @ts-ignore
        if (idea.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.idea.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Idea deleted" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete idea" }, { status: 500 })
    }
}
