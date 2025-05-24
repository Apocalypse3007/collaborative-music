import { NextResponse } from 'next/server';
import {z} from 'zod';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const YT_regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
const SPOTIFY_regex = /^https?:\/\/(?:open|play)\.spotify\.com\/track\/[a-zA-Z0-9]{22}(?:\?[a-zA-Z0-9=&]+)?$/i;
const StreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
})

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json({
                message: "Content-Type must be application/json",
            }, { status: 400 });
        }
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({
                message: "Invalid JSON in request body",
                error: e instanceof Error ? e.message : "Unknown error"
            }, { status: 400 });
        }
        const data = StreamSchema.safeParse(body);
        if (!data.success) {
            return NextResponse.json({
                message: "Invalid request data",
                error: data.error
            }, { status: 400 });
        }
        const validYT = data.data.url.match(YT_regex);
        const validSpotify = SPOTIFY_regex.test(data.data.url);
        if (!validYT && !validSpotify) {
            return NextResponse.json({
                message: "Invalid URL - must be a valid YouTube or Spotify track URL",
            }, { status: 400 });
        }

 
        let extractedId = "";
        if (validYT) {
            const match = data.data.url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
            extractedId = match?.[1] ?? "";
        } else if (validSpotify) {
            const match = data.data.url.match(/spotify\.com\/(?:track|album|playlist|artist)\/([A-Za-z0-9]+)/);
            extractedId = match?.[1] ?? "";
        }
        enum StreamType {
            Audio = "Audio",
            Video = "Video"
        }
        const stream = await prisma.stream.create({
            data: {
                userId: data.data.creatorId,
                url: data.data.url,
                extractedID: extractedId,
                type: validYT ? StreamType.Video : StreamType.Audio,
            }
        });
        return NextResponse.json({
            message: "Stream created successfully",
            stream
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error creating stream:', error);
        return NextResponse.json({
            message: "Error creating stream",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const creatorId = searchParams.get('creatorId');
        
        if (!creatorId) {
            return NextResponse.json({
                message: "creatorId is required"
            }, { status: 400 });
        }
        const streams = await prisma.stream.findMany({
            where: {
                userId: creatorId
            }
        });
        return NextResponse.json({
            message: "Streams fetched successfully",
            streams
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching streams:', error);
        return NextResponse.json({
            message: "Error fetching streams",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}