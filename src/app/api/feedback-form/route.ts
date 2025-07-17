import { NextResponse, NextRequest } from "next/server";
import FeedbackModel from "@/models/feedbackModel";
import { ConnectoDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/options";


export async function POST(req: NextRequest) {
    try {
        await ConnectoDatabase();
        const session = await getServerSession(authOptions);
        const userId = session?.user.id;

        if (!userId) {
            return NextResponse.json({
                message: "User is unauthorized"
            }, { status: 404 })
        }

        const { name, message } = await req.json();
        if (!name || !message) {
            return NextResponse.json({
                message: "Name and message is required"
            }, { status: 400 })
        }

        const newFeedback = await FeedbackModel.create({
            userId, name, message
        })

        return NextResponse.json({
            message: "Feedback submitted successfully",
            feedback: newFeedback
        }, { status: 201 })

    } catch (error) {
        console.error("Error submitting feedback:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}