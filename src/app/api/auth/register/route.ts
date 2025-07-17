import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/UserModel";
import { ConnectoDatabase } from "@/lib/db";

export async function POST(req: NextRequest){
    try {
        await ConnectoDatabase();

        const body = await req.json();
        const {username, email, password} = body;

        if(!username || !email || !password){
            return NextResponse.json({
                message: "Please provide all the fields"
            }, {status: 400})
        }

        const user = await User.findOne({email});
        if(user){
            return NextResponse.json({
                message: "User already exists"
            }, {status: 400})
        }

        const userNameCheck = await User.findOne({username});
        if(userNameCheck){
            return NextResponse.json({
                message: "Username already exists"
            }, {status: 400})
        }

        if(password.length < 6){
            return NextResponse.json({
             message: "Password must be longer than 6 characters"
            }, {status: 400})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isAdmin: false,
            provider: "credentials",
        })

        await newUser.save();

        return NextResponse.json({
            message: "User registered successfully",
            user: newUser
        }, {status: 201})
    } catch (error) {
        return NextResponse.json({
            message: "Internal Server Error"
        }, {status: 500})
    }
}