import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const bookmarkSchema = z.object({
    resourceId: z.string().min(1),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // @ts-expect-error
    const userId = session.user.id;

    try {
        const bookmarks = await prisma.resourceBookmark.findMany({
            where: { userId },
            select: { resourceId: true },
        });
        return NextResponse.json(bookmarks.map((b) => b.resourceId));
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
        const body = bookmarkSchema.parse(json);

        const existingBookmark = await prisma.resourceBookmark.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId: body.resourceId,
                },
            },
        });

        if (existingBookmark) {
            // Toggle off if exists
            await prisma.resourceBookmark.delete({
                where: { id: existingBookmark.id },
            });
            return NextResponse.json({ bookmarked: false });
        } else {
            // Toggle on if not exists
            await prisma.resourceBookmark.create({
                data: {
                    userId,
                    resourceId: body.resourceId,
                },
            });
            return NextResponse.json({ bookmarked: true });
        }
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
