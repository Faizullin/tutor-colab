"use client";

import TiptapEditor, {
  TiptapEditorRef,
} from "@/components/tt-rich-editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Post } from "@/generated/prisma";
import { useControlledToggle } from "@/hooks/use-controlled-toggle";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateHTML } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const postFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  slug: z
    .string()
    .min(3, { message: "Project slug must be at least 3 characters." })
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must be lowercase and can only contain letters, numbers, and hyphens.",
    }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export function PostFormView({ initialData }: { initialData?: Post | null }) {
  const trpcUtils = trpc.useUtils();
  const router = useRouter();
  const isEditMode = !!initialData; // Determine if in edit mode

  const defaultValues: PostFormValues = {
    title: initialData?.title || "",
    content: initialData?.content || "",
    slug: initialData?.slug || "",
  };

  const editorRef = useRef<TiptapEditorRef>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: defaultValues, // Use defaultValues initially
    mode: "onSubmit",
  });

  // tRPC Mutations
  const createPostMutation = trpc.post.adminCreate.useMutation({
    onSuccess: (response) => {
      toast.success(`Post "${response.post.title}" created successfully!`);
      form.reset(defaultValues);
      trpcUtils.post.adminDetail.invalidate();
      router.push(`/dashboard/posts/${response.post.id}`);
    },
    onError: (error) => {
      toast.error(`Error creating post: ${error.message}`);
    },
  });

  const updatePostMutation = trpc.post.adminUpdate.useMutation({
    onSuccess: (response) => {
      toast.success(`Post "${response.post.title}" updated successfully!`);
      // After update, reset the form with the new data to mark it as "clean" again
      form.reset({
        title: response.post.title,
        content: response.post.content || "",
      });
      trpcUtils.post.adminDetail.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating post: ${error.message}`);
    },
  });

  const isSubmitting =
    createPostMutation.isPending || updatePostMutation.isPending;
  const canSubmit = form.formState.isDirty && !isSubmitting;

  function onSubmit(values: PostFormValues) {
    if (isEditMode) {
      if (!initialData?.id) {
        toast.error("Error: Post ID is missing for update.");
        return;
      }
      updatePostMutation.mutate({
        id: initialData.id,
        ...values,
      });
    } else {
      createPostMutation.mutate(values);
    }
  }

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content || "",
      });
    } else {
      form.reset({ title: "", content: "" });
    }
  }, [initialData, form]);

  const controlledToggle = useControlledToggle({
    defaultValue: false,
  });

  useEffect(() => {
    // Reset the editor content when the infoCard changes
    if (editorRef.current && controlledToggle.value && initialData) {
      const instance = editorRef.current.getInstance()!;
      const conv = (data: any): string => {
        if (!data) return "";
        const ext = instance.extensionManager.extensions;
        let html: string = "";
        try {
          html = generateHTML(JSON.parse(data), ext);
        } catch {
          toast.error("Error parsing content data. Please check the format.");
          html = `<p>Error parsing content data. Please check the format.</p><br />${data}`;
        }
        return html;
      };
      form.setValue("content", conv(initialData.content));
    }
  }, [controlledToggle.value, form, initialData]);

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEditMode ? "Edit Post" : "Create Post"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="my-awesome-project" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique, URL-friendly identifier for your post (e.g.,
                      my-awesome-post).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter post content"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <Controller
              control={form.control}
              name={"content"}
              render={({ field }) => (
                <div className="tiptap-content">
                  <TiptapEditor
                    ref={(ref) => {
                      const instance = ref?.getInstance();
                      if (instance && !editorRef.current) {
                        editorRef.current = ref;
                        let data: any = "";
                        try {
                          data = JSON.parse(field.value || "{}");
                        } catch {
                          toast.error(
                            "Error parsing content data. Please check the format."
                          );
                          data = `<p>Error parsing content data. Please check the format.</p><br />${field.value}`;
                        }
                        instance.commands.setContent(data);
                        controlledToggle.setTrue();
                      }
                    }}
                    ssr={true}
                    output="html"
                    placeholder={{
                      paragraph: "Type your content here...",
                      imageCaption: "Type caption for image (optional)",
                    }}
                    contentMinHeight={256}
                    contentMaxHeight={640}
                    onContentChange={field.onChange}
                    initialContent={field.value}
                  />
                </div>
              )}
            />
            <div className="flex justify-start gap-4">
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Save Changes"
                  : "Create Post"}
              </Button>
              {initialData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    router.push(`/posts/${initialData.slug}`);
                  }}
                >
                  Preview
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
