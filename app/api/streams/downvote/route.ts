import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { z } from "zod";

const downvoteSchema = z.object({
    streamId: z.string(),
    userId: z.string()
})

export async function POST(req: NextRequest) {
    try {
        const data = await downvoteSchema.safeParse(await req.json());
        if (!data.success) {
            return NextResponse.json({ 
                message: "Invalid data",
                error: data.error 
            }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: { id: data.data.userId }
        });
        if (!user) {
            return NextResponse.json({ 
                message: "User not found" 
            }, { status: 403 });
        }
        await prisma.upvote.delete({
            where: {
                userId_streamId: {
                    userId: data.data.userId,
                    streamId: data.data.streamId,
                }
            }
        });
        return NextResponse.json({ 
            message: "Downvoted successfully" 
        }, { status: 200 });

    } catch (error: any) {
        if (error?.code === 'P2025') {
            return NextResponse.json({ 
                message: "No upvote found to remove" 
            }, { status: 404 });
        }

        console.error('Error removing upvote:', error);
        return NextResponse.json({ 
            message: "Error removing upvote",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
