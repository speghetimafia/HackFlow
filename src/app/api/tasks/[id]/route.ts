import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const taskUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    status: z.enum(["todo", "in-progress", "completed"]).optional(),
    dueDate: z.string().optional().nullable(),
});

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
        const body = taskUpdateSchema.parse(json);

        const existingTask = await prisma.task.findUnique({
            where: { id: params.id },
        });

        if (!existingTask) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (existingTask.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const task = await prisma.task.update({
            where: { id: params.id },
            data: body,
        });

        return NextResponse.json(task);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

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
        const existingTask = await prisma.task.findUnique({
            where: { id: params.id },
        });

        if (!existingTask) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (existingTask.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.task.delete({
            where: { id: params.id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
