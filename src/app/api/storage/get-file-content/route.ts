import { authOptions } from "@/lib/options"
import { getFileContent } from "@/Supabase/supabaseFunctions";
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest){
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user.id;
        const {fileName} = await req.json();

        if(!userId){
            return NextResponse.json({
                message: "User must be loggeed in"
            }, {status: 404})
        }

        const fileContent = await getFileContent(fileName, userId);
        return NextResponse.json({
            message: "File fetched successfully",
            content: fileContent,
        }, {status: 200})
    } catch (error) {
        return NextResponse.json({
            message: "Internal Server Error"
        }, {status: 500})
    }
}