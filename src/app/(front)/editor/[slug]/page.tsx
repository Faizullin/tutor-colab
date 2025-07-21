import { trpcCaller } from "@/server/api/caller";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorView from "../_components/editor-view";

export const metadata: Metadata = {
  title: "Editor",
  description: "Edit your project files here.",
};

type PageProps = { params: Promise<{ slug: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  if (params.slug === "demo") {
    return <EditorView demo={true} />;
  }
  const data = await trpcCaller.project.protectedUserProjectDetailBySlug(
    params.slug
  );
  if (!data) {
    notFound();
  }
  return <EditorView initialData={data} />;
}
