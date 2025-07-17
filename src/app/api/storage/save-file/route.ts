import { authOptions } from "@/lib/options";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import {savedFile} from '@/Supabase/supabaseFunctions'

export async function PUT(req: NextRequest){
    try {
        const {fileName, content} = await req.json();
        if(!fileName || !content){
            return NextResponse.json({
                message: "Filename and content is needed to save file"
            }, {status: 400})
        }
        const session = await getServerSession(authOptions);
        const userId = session?.user.id;

        if(!userId){
            return NextResponse.json({
                message: "User must login"
            }, {status: 404})
        }

        const saveFile = await savedFile(userId, fileName, content);
        return NextResponse.json({
            message: "File saved successfully",
            savedUserFile: saveFile,
        }, {status: 201})
        
    } catch (error) {
        return NextResponse.json({
            message: "Internal Server Error"
        }, {status: 500})
    }
}