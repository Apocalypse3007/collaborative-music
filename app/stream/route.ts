import { NextResponse } from 'next/server';
import {z} from 'zod';

const StreamSchema = z.object({
    creatorId: z.string(),
    url: z.string().url().refine(val=>
        val.includes('spotify.com') || val.includes('youtube.com'),
    )
})

export async function POST(req: Request) {
    try{
        const data = StreamSchema.safeParse(await req.json());
        if(!data.success){
            return NextResponse.json({
                message: "Invalid data",
            })
        }
    }catch (e){
        return NextResponse.json({
            message: "Invalid data",
        })
    }
}