import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 1. Fetch incoming requests (people wanting to join user's ideas)
        const incomingRequests = await prisma.teamRequest.findMany({
            where: {
                idea: {
                    userId: user.id,
                },
                status: "PENDING",
            },
            include: {
                user: {
                    select: { name: true, image: true },
                },
                idea: {
                    select: { title: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // 2. Fetch updates on user's own requests (accepted/rejected)
        const myRequestUpdates = await prisma.teamRequest.findMany({
            where: {
                userId: user.id,
                status: {
                    in: ["ACCEPTED", "REJECTED"],
                },
            },
            include: {
                idea: {
                    select: { title: true },
                },
            },
            orderBy: { updatedAt: "desc" },
            take: 10, // Limit to last 10 updates
        });

        // Transform into a unified notification format
        const notifications = [
            ...incomingRequests.map((req: any) => ({
                id: req.id,
                type: "INCOMING_REQUEST",
                title: "New Team Request",
                message: `${req.user.name} requested to join "${req.idea.title}"`,
                date: req.createdAt,
                data: {
                    requestId: req.id,
                    userImage: req.user.image,
                },
            })),
            ...myRequestUpdates.map((req: any) => ({
                id: req.id,
                type: "REQUEST_UPDATE",
                title: "Request Update",
                message: `Your request to join "${req.idea.title}" was ${req.status.toLowerCase()}`,
                date: req.updatedAt,
                status: req.status,
            })),
        ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}
