"use client";

/* -------------------------------------------------------------------------- */
/*  Projects Page (compact cards + skeleton loaders)                          */
/* -------------------------------------------------------------------------- */

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Project } from "@/generated/prisma";
import { trpc } from "@/utils/trpc";
import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

// -----------------------------------------------------------------------------
// Card shown once data is loaded
// -----------------------------------------------------------------------------
interface CardProps {
  project: Project;
}

function ProjectCard({ project }: CardProps) {
  const card: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  return (
    <motion.div variants={card} layout>
      <Link
        href={`/projects/${project.slug}/editor`}
        className="block rounded-lg border border-gray-800 bg-[#252525] p-4 hover:border-emerald-500 transition-colors"
      >
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{project.name}</h3>
        <p className="text-sm text-gray-400 line-clamp-3">{project.description}</p>
        <span className="inline-flex items-center text-emerald-400 text-sm mt-2">
          View <ArrowRight size={14} className="ml-1" />
        </span>
      </Link>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Skeleton placeholder while loading
// -----------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#252525] p-4 animate-pulse space-y-3">
      <div className="h-5 bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-700 rounded w-5/6" />
    </div>
  );
}

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// -----------------------------------------------------------------------------
// Page component
// -----------------------------------------------------------------------------
export default function ProjectsPage() {
  const projectsQuery = trpc.project.userProjectsList.useQuery();

  // Convert date strings coming from the API to Date objects once loaded
  const parsed = useMemo(() => {
    return projectsQuery.data?.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  }, [projectsQuery.data]);

  const isLoading = projectsQuery.isLoading || !parsed;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#1e1e1e] text-gray-100 flex flex-col">
        <section className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Projects
          </motion.h1>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
              : parsed!.map((project) => <ProjectCard key={project.id} project={project} />)}
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
