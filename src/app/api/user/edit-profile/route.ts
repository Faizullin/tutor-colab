import { NextResponse, NextRequest } from "next/server";
import User from "@/models/UserModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/options";
import { ConnectoDatabase } from "@/lib/db";

export async function PATCH(req: NextRequest) {
    try {
        await ConnectoDatabase();

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { firstName, lastName, username } = await req.json();

        // Check if the username is already taken (by another user)
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return NextResponse.json(
                { message: "Username is not available, it should be unique" },
                { status: 400 }
            );
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, username },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "User updated successfully", user: updatedUser },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
