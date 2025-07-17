import { NextRequest, NextResponse } from "next/server";
import { createFile } from "@/Supabase/supabaseFunctions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/options";
import UserLimitModel from "@/models/User_limit";

const DEFAULT_MAX_FILES = 5;

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    //fetch user limit from db
    let userLimit = await UserLimitModel.findOne({userId});
    if(!userLimit){
      userLimit = await UserLimitModel.create({
        userId, fileCount: 0, maxFiles: DEFAULT_MAX_FILES})
    }

    if(userLimit.fileCount >= userLimit.maxFiles){
      return NextResponse.json({
        message: "File limit reached"
      }, {status: 403})
    }

    const fileUrl = await createFile(fileName, userId); 

    //increment after fileURL
    userLimit.fileCount += 1;
    await userLimit.save();

    return NextResponse.json({ message: "File created successfully!", fileUrl }, { status: 200 });
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json({ message: "An error occurred while creating the file!" }, { status: 500 });
  }
}
