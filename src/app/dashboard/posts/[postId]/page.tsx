import { Breadcrumb } from "@/components/ui/breadcrumb";
import { trpcCaller } from "@/server/api/caller";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostFormView } from "../_components/form-view";

export const metadata: Metadata = {
  title: "Edit Post",
  description: "Edit your post details here.",
};

type PageProps = { params: Promise<{ postId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  let data = null;
  if (params.postId !== "new") {
    const postId = parseInt(params.postId, 10);
    data = await trpcCaller.post.adminDetail(postId);
    if (!data) {
      notFound();
    }
  }
  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        <Breadcrumb />
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
          <PostFormView initialData={data} />
        </div>
      </div>
    </>
  );
}
