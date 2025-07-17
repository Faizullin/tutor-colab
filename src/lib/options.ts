import { DEFAULT_FIREBASE_CREDENTIALS_PROVIDER_NAME } from "@/config/auth";
import { UserAccount } from "@/generated/prisma";
import { adminAuth } from "@/server/lib/firebaseAdmin";
import { prisma } from "@/server/lib/prisma";
import { NextAuthOptions, } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import z from "zod";


const AuthorizeFirebaseSchema = z.object({
    idToken: z.string().min(1, "ID Token is required"),
});

// Define the NextAuth options
// Dont use default FirestoreAdapter but use custom credentials provider
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: DEFAULT_FIREBASE_CREDENTIALS_PROVIDER_NAME,
            credentials: {
                idToken: { label: "Firebase ID Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.idToken) {
                    throw new Error("ID Token is required");
                }
                try {
                    const decoded = await adminAuth.verifyIdToken(credentials.idToken || "");

                    const email = decoded.email;

                    if (!email) {
                        throw new Error("Email is required in ID Token");
                    }

                    // Upsert user in PrimeDB (via Prisma)
                    const user = await prisma.userAccount.upsert({
                        where: { email },
                        update: { email },
                        create: {
                            email,
                            uid: decoded.uid,
                            username: decoded.name || null,
                            profileUrl: decoded.picture || null,
                            role: "user",
                            provider: DEFAULT_FIREBASE_CREDENTIALS_PROVIDER_NAME,
                        },
                    });

                    return {
                        id: String(user.id),
                        uid: user.uid,
                        email: user.email,
                        username: user.username,
                        profileUrl: user.profileUrl,
                        role: user.role,
                        provider: user.provider,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        lastLogin: user.lastLogin,
                    };
                } catch (error) {
                    console.error("Firebase auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.user = {
                    id: Number(user.id),
                    email: user.email!,
                    username: user.username || "",
                    profileUrl: user.profileUrl || "",
                    role: user.role || "user",
                    uid: user.uid || "",
                    provider: user.provider,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    lastLogin: user.lastLogin,
                };
            }

            return token;
        },

        session: async ({ session, token }) => {
            if (token) {
                session.user = token.user;
            }

            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
}

declare module "next-auth" {
    interface User extends UserAccount {
    }
    interface Session {
        user: UserAccount;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: UserAccount;
    }
}