"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useControlDialog } from "@/hooks/use-control-dialog";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Project name must be at least 3 characters." })
    .max(255),
  slug: z
    .string()
    .min(3, { message: "Project slug must be at least 3 characters." })
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must be lowercase and can only contain letters, numbers, and hyphens.",
    }),
  description: z.string().optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

type CreateProjectDialogProps = {
  control: ReturnType<typeof useCreateProjectDialogControl>;
};

export function CreateProjectDialog(props: CreateProjectDialogProps) {
  const trpcUtils = trpc.useUtils();

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // tRPC mutation for creating a project
  const createProjectMutation = trpc.project.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!", {
        description: "Your new project has been added.",
      });
      trpcUtils.project.adminList.invalidate(); // Invalidate the project list cache
      form.reset(); // Reset form fields
      props.control.close();
    },
    onError: (error) => {
      toast.error("Failed to create project", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });

  const onSubmit = async (data: CreateProjectFormValues) => {
    try {
      // Call tRPC mutation
      await createProjectMutation.mutateAsync(data);
    } catch (error: any) {
      // General catch for issues not handled by mutation onError (e.g., initial file upload errors)
      toast.error("Project creation failed", {
        description:
          error.message || "An unexpected error occurred during the process.",
      });
    }
  };

  return (
    <Dialog
      open={props.control.isOpen}
      onOpenChange={(v) => {
        if (!v) {
          props.control.close();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be the display name of your project.
                    </FormDescription>
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
                      A unique, URL-friendly identifier for your project (e.g.,
                      my-awesome-project).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your project..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of what your project is
                    about.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Create Project
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const useCreateProjectDialogControl = () => {
  const control = useControlDialog();
  return control;
};
