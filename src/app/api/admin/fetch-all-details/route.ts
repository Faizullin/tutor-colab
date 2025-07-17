import { NextResponse, NextRequest } from "next/server";
import User from "@/models/UserModel";
import { ConnectoDatabase } from "@/lib/db";
import FeedbackModel from "@/models/feedbackModel";

export async function GET(req: NextRequest) {
    try {
        await ConnectoDatabase();

        // Fetch all users
        const users = await User.find({});
        const userCount = await User.countDocuments();

        // Fetch all feedbacks
        const feedbacks = await FeedbackModel.find({});

        return NextResponse.json({
            success: true,
            users,
            userCount,
            feedbacks,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Error fetching data",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}