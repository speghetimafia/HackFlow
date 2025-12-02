import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const sessionSchema = z.object({
    type: z.enum(["focus", "short-break", "long-break"]),
    duration: z.number(),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // @ts-expect-error
    const userId = session.user.id;

    try {
        const sessions = await prisma.focusSession.findMany({
            where: { userId },
            orderBy: { completedAt: "desc" },
            take: 50, // Limit to last 50 sessions
        });
        return NextResponse.json(sessions);
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
        const body = sessionSchema.parse(json);

        const focusSession = await prisma.focusSession.create({
            data: {
                ...body,
                userId,
            },
        });

        return NextResponse.json(focusSession);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
