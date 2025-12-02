import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // @ts-expect-error
    const userId = session.user.id;

    try {
        const existingDeadline = await prisma.deadline.findUnique({
            where: { id: params.id },
        });

        if (!existingDeadline) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (existingDeadline.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.deadline.delete({
            where: { id: params.id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // @ts-expect-error
    const userId = session.user.id;

    try {
        const json = await req.json();
        const existingDeadline = await prisma.deadline.findUnique({
            where: { id: params.id },
        });

        if (!existingDeadline) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (existingDeadline.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const deadline = await prisma.deadline.update({
            where: { id: params.id },
            data: json,
        });

        return NextResponse.json(deadline);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
