"use client";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Post } from "@/generated/prisma";
import { trpc } from "@/utils/trpc";
import { motion, Variants } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* 2.  Individual card                                                */
/* ------------------------------------------------------------------ */
function PostCard({ post }: { post: Post }) {
  const router = useRouter();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-800/50 bg-[#252525]/40 backdrop-blur-lg"
    >
      {/* Cover */}
      {/* <Link href={`/posts/${post.id}`} className="block relative w-full pt-[56%] bg-gray-900">
                <Image
                    src={post.thumbnail}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            </Link> */}

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="mb-2 text-xl font-semibold leading-snug text-white">
          {post.title}
        </h3>
        {/* <p className="mb-4 flex-1 text-gray-400">{post.excerpt}</p> */}

        {/* Meta */}
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          {/* <span className="flex items-center gap-1">
            <User size={14} /> {post.ownerId}
          </span> */}
          <span className="flex items-center gap-1">
            <CalendarDays size={14} />
            {post.createdAt.toLocaleDateString()}
          </span>
        </div>

        {/* Tags */}
        {/* <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-600/10 px-2 py-0.5 text-xs text-emerald-300"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div> */}

        {/* CTA */}
        <motion.button
          onClick={() => router.push(`/posts/${post.slug}`)}
          whileHover={{ x: 4 }}
          className="mt-5 inline-flex items-center text-emerald-400 hover:text-emerald-300"
        >
          Read more
          <ArrowRight size={16} className="ml-1" />
        </motion.button>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* 3.  Page container                                                 */
/* ------------------------------------------------------------------ */
const grid: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};
export default function PostsPage() {
  const loadPostsQuery = trpc.post.publicList.useQuery();
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#1e1e1e] text-white">
        {/* You already have <Header /> / <Footer /> – import if needed */}
        <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          {/* heading */}
          <motion.h1
            className="mb-12 text-4xl font-bold md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
          >
            Latest <span className="text-emerald-400">Posts</span>
          </motion.h1>

          {/* grid */}
          <motion.div
            variants={grid}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {loadPostsQuery.data?.items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </motion.div>
        </main>
      </div>
      <Footer />
    </>
  );
}
