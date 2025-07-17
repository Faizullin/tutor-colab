import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/options";
import { deleteFile } from "@/Supabase/supabaseFunctions";
import UserLimitModel from "@/models/User_limit";

export async function DELETE(req: NextRequest){
    try {
        const { fileName } = await req.json();
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId || !fileName) {
            return NextResponse.json({ message: "User ID and fileName are required!" }, { status: 400 });
        }

        const deletedFile = await deleteFile(fileName, userId);

        await UserLimitModel.findOneAndUpdate({
            userId
        }, {$inc: {fileCount: -1}})
        if(!deletedFile!){
            return NextResponse.json({ message: "Error deleting file!" }, { status: 500 });
        }

        return NextResponse.json({ message: "File deleted successfully!", deletedFile }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "An error occurred!", error }, { status: 500 });
    }
}