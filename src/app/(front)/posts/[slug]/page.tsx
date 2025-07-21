import { Post } from "@/generated/prisma";
import { trpcCaller } from "@/server/api/caller";
import { notFound } from "next/navigation";
import PostArticle from "./_components/post-article";

async function getPost(slug: string): Promise<Post | null> {
  const post = await trpcCaller.post.publicGetBySlug(slug);
  if (!post) {
    notFound();
  }
  return post;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await getPost((await params).slug);

  if (!post) notFound();

  // const router = useRouter();

  return <PostArticle post={post} />;
}
