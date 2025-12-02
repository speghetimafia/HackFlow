
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
        const requestId = id
        const body = await req.json()
        const { status } = body

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        const request = await prisma.teamRequest.findUnique({
            where: { id: requestId },
            include: {
                idea: true,
            },
        })

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        // Only idea owner can approve/reject
        // @ts-ignore
        if (request.idea.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updatedRequest = await prisma.teamRequest.update({
            where: { id: requestId },
            data: { status },
        })

        return NextResponse.json(updatedRequest)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
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
        const requestId = id

        const request = await prisma.teamRequest.findUnique({
            where: { id: requestId },
            include: {
                idea: true,
            },
        })

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        // Allow deletion if:
        // 1. User is the one who made the request (leaving team / cancelling request)
        // 2. User is the idea owner (removing member)
        // @ts-ignore
        const isRequester = request.userId === session.user.id
        // @ts-ignore
        const isIdeaOwner = request.idea.userId === session.user.id

        if (!isRequester && !isIdeaOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.teamRequest.delete({
            where: { id: requestId },
        })

        return NextResponse.json({ message: "Request deleted" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
    }
}
