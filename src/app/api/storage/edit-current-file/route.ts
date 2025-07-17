import { authOptions } from "@/lib/options";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { editCurrentFile } from "@/Supabase/supabaseFunctions";

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user.id;

        if (!userId) {
            return NextResponse.json({ message: "User must be logged in" }, { status: 401 });
        }

        const { oldFileName, newFileName } = await req.json();
        if (!oldFileName || !newFileName) {
            return NextResponse.json({ message: "Both old and new file names are required" }, { status: 400 });
        }

        const updatedFile = await editCurrentFile(oldFileName, newFileName, userId);
        if (!updatedFile.success) {
            return NextResponse.json({ message: "Failed to rename the file", error: updatedFile.error }, { status: 400 });
        }

        return NextResponse.json({
            message: "File renamed successfully",
            updatedFile: updatedFile.data
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
