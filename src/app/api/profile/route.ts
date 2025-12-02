import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
    name: z.string().min(1).optional(),
    bio: z.string().nullish(),
    skills: z.array(z.string()).optional(),
    githubUrl: z.string().url().nullish().or(z.literal("")),
    linkedinUrl: z.string().url().nullish().or(z.literal("")),
    websiteUrl: z.string().url().nullish().or(z.literal("")),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // @ts-expect-error
    const userId = session.user.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                image: true,
                bio: true,
                skills: true,
                githubUrl: true,
                linkedinUrl: true,
                websiteUrl: true,
            },
        });
        return NextResponse.json(user);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // @ts-expect-error
    const userId = session.user.id;

    try {
        const json = await req.json();
        const body = profileSchema.parse(json);

        const user = await prisma.user.update({
            where: { id: userId },
            data: body,
        });

        return NextResponse.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}
