import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    try {
        const whereClause = search
            ? {
                OR: [
                    { title: { contains: search, mode: "insensitive" as const } },
                    { description: { contains: search, mode: "insensitive" as const } },
                    { tags: { hasSome: [search] } },
                ],
            }
            : {}

        const [ideas, total] = await Promise.all([
            prisma.idea.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { name: true, image: true },
                    },
                    _count: {
                        select: { requests: true },
                    },
                },
            }),
            prisma.idea.count({ where: whereClause }),
        ])

        return NextResponse.json({
            ideas,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        })
    } catch (error) {
        console.error("Error fetching ideas:", error)
        return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, description, tags } = body

        if (!title || !description) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const idea = await prisma.idea.create({
            data: {
                title,
                description,
                tags: tags || [],
                // @ts-expect-error - session.user.id is injected in auth options
                userId: session.user.id,
            },
        })

        return NextResponse.json(idea, { status: 201 })
    } catch (error) {
        console.error("Error creating idea:", error)
        return NextResponse.json({ error: "Failed to create idea" }, { status: 500 })
    }
}
