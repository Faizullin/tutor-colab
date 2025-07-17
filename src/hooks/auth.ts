"use client";

import { firebaseAuth } from "@/lib/auth/firebase";
import { ApiError } from "@/lib/exception";
import { useMutation } from "@tanstack/react-query";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, User } from "firebase/auth";
import { signIn } from "next-auth/react";

type Variables =
    | { email: string; password: string; provider: "email-password" }
    | { provider: "google" };

export function useFirebaseLogin() {
    return useMutation({
        mutationKey: ["firebaseLogin"],
        mutationFn: async (vars: Variables) => {
            // 1.  Authenticate with Firebase
            let user: User | null = null
            try {
                if (vars.provider === "google") {
                    const response = await signInWithPopup(
                        firebaseAuth,
                        new GoogleAuthProvider()
                    );
                    user = response.user;
                } else {
                    const response = await signInWithEmailAndPassword(
                        firebaseAuth,
                        vars.email,
                        vars.password
                    );
                    user = response.user;
                }
            } catch (error) {
                if (isFirebaseError(error)) {
                    throw new ApiError(
                        "firebase-auth-error",
                        error.message,
                        400,
                        { code: error.code, message: error.message }
                    );

                }
                throw error;
            }

            const idToken = await user.getIdToken()
            // 2.  Forward ID‑token to Next‑Auth credentials provider
            const res = await signIn("credentials", {
                idToken, redirect: false,
            });
            if (res?.error) throw new ApiError(
                "next-auth-error",
                res.error,
                400,
                { message: res.error, }
            );
            return res; // returns { ok: true, url, status }
        },
    });
}


function isFirebaseError(error: unknown): error is Error & { code: string } {
    return error instanceof Error && (typeof error === 'object' && error !== null && 'code' in error);
}