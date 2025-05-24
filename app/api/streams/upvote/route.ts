import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { z } from "zod";

const upvoteSchema = z.object({
    streamId: z.string(),
    userId: z.string()
})

export async function POST(req: NextRequest) {
    try {
        const data = await upvoteSchema.safeParse(await req.json());
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

        const upvote = await prisma.upvote.create({
            data: {
                userId: data.data.userId,
                streamId: data.data.streamId,
            }
        });

        return NextResponse.json({ 
            message: "Upvoted successfully",
            upvote 
        }, { status: 201 });

    } catch (error: any) {
        // Handle unique constraint violation (user trying to upvote same stream twice)
        if (error?.code === 'P2002') {
            return NextResponse.json({ 
                message: "Already upvoted this stream" 
            }, { status: 400 });
        }

        console.error('Error creating upvote:', error);
        return NextResponse.json({ 
            message: "Error creating upvote",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
