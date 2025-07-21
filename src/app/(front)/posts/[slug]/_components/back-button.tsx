"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
    const router = useRouter();
    return (
        <motion.button
            onClick={() => router.back()}
            whileHover={{ x: -4 }}
            className="mb-10 inline-flex items-center text-emerald-400 hover:text-emerald-300"
        >
            <ArrowLeft size={18} className="mr-1" />
            Back
        </motion.button>
    );
}
