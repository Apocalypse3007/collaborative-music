import { getServerSession } from "next-auth";
import { NextResponse,NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { z } from "zod";

const upvoteSchema = z.object({
    streamId: z.string(),
})


export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 403 });
    }

    try{
    const data = await upvoteSchema.safeParse(await req.json());
    if (!data.success) {
        return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }
    await prisma.upvote.delete({
        where: {
            userId_streamId: {
                userId: user.id,
                streamId: data.data.streamId,
            }
        }
    });
    return NextResponse.json({ message: "Downvoted" }, { status: 200 });
    } catch {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

}
