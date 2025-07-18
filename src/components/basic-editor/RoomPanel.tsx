"use client";

import { UserAccount } from "@/generated/prisma";
import { Clipboard, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function RoomPanel() {
    const { data: session, status } = useSession();
    const [userId, setUserId] = useState<UserAccount["id"] | null>(null);
    const [userEnteredRoomId, setUserEnteredRoomId] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [roomIdState, setRoomIdState] = useState<string | null>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        if (status === "authenticated") {
            setUserId(session?.user?.id || null);
        }
    }, [session, status]);

    const createRoom = async () => {
        if (!userId) {
            alert("User ID is missing. Please log in again.");
            return;
        }
        const roomId = uuidv4();

        try {
            const res = await fetch(`${BACKEND_URL}/room/create-room`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, userId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create room");

            setRoomIdState(roomId);
            console.log("Room created successfully:", data.room);
        } catch (error) {
            console.error("Error in createRoom:", error);
        }
    };

    const joinRoom = async () => {
        if (!userId || !userEnteredRoomId) {
            alert("Enter a valid Room ID and ensure you are logged in.");
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/room/join-room`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: userEnteredRoomId, userId })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to join room");
            console.log("Joined room successfully:", data.room);
        } catch (error) {
            console.error("Error in joinRoom:", error);
        }
    };


    const copyToClipboard = () => {
        if (roomIdState) {
            navigator.clipboard.writeText(roomIdState);
            alert("Room ID copied to clipboard!");
        }
    };

    return (
        <div className="relative">
            <Button onClick={() => setIsOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2">
                Code Collaboration
            </Button>

            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg w-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-white text-lg font-bold">Create or Join a Room</h1>
                            <X className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setIsOpen(false)} />
                        </div>

                        {/* ✅ Show Room ID after creation */}
                        {roomIdState && (
                            <div className="mb-4 p-3 bg-gray-800 text-white rounded flex items-center justify-between">
                                <span className="text-sm">Room ID: {roomIdState}</span>
                                <Clipboard className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white" onClick={copyToClipboard} />
                            </div>
                        )}

                        <div className="mb-4">
                            <Button onClick={createRoom} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                                Create Room
                            </Button>
                        </div>

                        <div>
                            <Input
                                placeholder="Enter Room ID"
                                className="bg-gray-800 text-white border border-gray-700 px-3 py-2 w-full"
                                onChange={(e) => setUserEnteredRoomId(e.target.value)}
                            />
                            <Button onClick={joinRoom} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white">
                                Join Room
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomPanel;
