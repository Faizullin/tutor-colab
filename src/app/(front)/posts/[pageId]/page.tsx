import { notFound } from "next/navigation";
import PostArticle from "./_components/post-article";

/* ------------------------------------------------------------------ */
/* 1. Fake fetch helper - replace with tRPC query                     */
/* ------------------------------------------------------------------ */
type Post = {
    id: string;
    title: string;
    cover: string;
    date: string;
    author: string;
    tags: string[];
    body: string; // markdown or HTML
};

async function getPost(slug: string): Promise<Post | null> {
    const mock: Record<string, Post> = {
        "perf-tips": {
            id: "perf-tips",
            title: "Performance Tips for React",
            cover:
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=60",
            date: "2025‑07‑09",
            author: "Lisa P.",
            tags: ["performance"],
            body: `
### Why CodeX?

CodeX combines an **AI‑powered assistant** with a blazing‑fast monaco editor.

\`\`\`tsx
console.log("Hello world");
\`\`\`

1. Spin up a playground  
2. Invite collaborators  
3. Ship 🚀
`,
        },
    };
    return mock[slug] ?? null;
}


export default async function Page({
    params,
}: {
    params: Promise<{ pageId: string }>;
}) {
    const post = await getPost((await params).pageId);

    if (!post) notFound();

    // const router = useRouter();

    return <PostArticle post={post} />;
}
