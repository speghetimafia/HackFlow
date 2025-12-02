import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const deadlineSchema = z.object({
    name: z.string().min(1),
    date: z.string(),
    location: z.string().optional(),
    url: z.string().optional(),
    reminderSet: z.boolean().optional(),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // @ts-expect-error
    const userId = session.user.id;

    try {
        const deadlines = await prisma.deadline.findMany({
            where: { userId },
            orderBy: { date: "asc" },
        });
        return NextResponse.json(deadlines);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // @ts-expect-error
    const userId = session.user.id;

    try {
        const json = await req.json();
        const body = deadlineSchema.parse(json);

        const deadline = await prisma.deadline.create({
            data: {
                ...body,
                userId,
            },
        });

        return NextResponse.json(deadline);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
