import { NextRequest, NextResponse } from "next/server";
import { deleteWholeProject } from "@/Supabase/supabaseFunctions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/options";

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ message: "User ID is required!" }, { status: 400 });
        }

        const result = await deleteWholeProject(userId);

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message || "An error occurred!" }, { status: 500 });
    }
}
