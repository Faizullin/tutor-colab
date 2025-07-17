import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/options";
import { supabase } from "@/Supabase/supabaseClient";

export async function POST(req: NextRequest) {
    try {
        const { fileName } = await req.json();
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId || !fileName) {
            return NextResponse.json({ message: "User ID and fileName are required!" }, { status: 400 });
        }

        // Fetch the file content from Supabase
        const filePath = `files/${userId}/${fileName}`;
        const { data, error } = await supabase.storage.from("ide-files").download(filePath);

        if (error) {
            return NextResponse.json({ message: "Error fetching file content!", error }, { status: 500 });
        }

        // Read file content as text
        const fileText = await data.text();

        return NextResponse.json({
            message: "File content retrieved successfully!",
            fileName,
            content: fileText,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: "An error occurred!", error }, { status: 500 });
    }
}
