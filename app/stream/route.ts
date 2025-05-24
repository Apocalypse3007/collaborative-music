// import { NextResponse } from 'next/server';
// import {z} from 'zod';
// import {prisma} from "../lib/db"
// import { getServerSession } from "next-auth";

// const YT_regex = new RegExp("^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(\S*)?$/")
// const SPOTIFY_regex = new RegExp("^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist|artist)\/[A-Za-z0-9]+(\?si=[A-Za-z0-9]+)?$/")
// const StreamSchema = z.object({
//     creatorId: z.string(),
//     url: z.string().url().refine(val=>
//         val.includes('spotify.com') || val.includes('youtube.com'),
//     )
// })

// export async function POST(req: Request) {
//     try{
//         const session = await getServerSession();
//         if (!session?.user?.email) {
//         return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
//         }
//         const user = await prisma.user.findUnique({
//         where: { email: session.user.email },
//         });
//         if (!user) {
//         return NextResponse.json({ message: "User not found" }, { status: 403 });
//         }
//         const parsed = StreamSchema.safeParse(await req.json());
//         if (!parsed.success) {
//         return NextResponse.json({ message: "Invalid data" }, { status: 400 });
//         }
        
//         const data = StreamSchema.safeParse(await req.json());
//         const validYT = YT_regex.test(data.data?.url ?? "");
//         const validSpotify = SPOTIFY_regex.test(data.data?.url ?? "");
//         if(!data.success){
//             return NextResponse.json({
//                 message: "Invalid data",
//             })
//         }
//         if(!validYT || !validSpotify){
//             return NextResponse.json({
//                 message: "Invalid URL",
//             })
//         }

//         let extractedId = "";
//             if (validYT) {
//             const match = data.data?.url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
//             extractedId = match?.[1] ?? "";
//             } else if (validSpotify) {
//             const match = data.data?.url.match(/spotify\.com\/(?:track|album|playlist|artist)\/([A-Za-z0-9]+)/);
//             extractedId = match?.[1] ?? "";
//         }
//         enum StreamType {
//             Audio = "Audio",
//             Video = "Video"
//         }
        
//         await prisma.stream.create({
//             data: {
//                 userId: data.data.creatorId,
//                 url: data.data.url,
//                 extractedID: extractedId,
//                 type : validYT ? StreamType.Video : StreamType.Audio,
//             }
//         })        
//     }catch {
//         return NextResponse.json({
//             message: "Invalid data",
//         })
//     }
// }