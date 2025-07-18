"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAccount } from "@/generated/prisma";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const editProfileSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileDialogProps {
  user: UserAccount;
  isOpen: boolean;
  onCloseAction: () => void;
  onUserUpdateAction: (user: UserAccount) => void;
}

export function EditProfileDialog({
  user,
  isOpen,
  onCloseAction,
  onUserUpdateAction,
}: EditProfileDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: user.username || "",
    },
  });
  const updateUserMutation = trpc.auth.updateProfile.useMutation();


  const onSubmit = async (data: EditProfileFormData) => {
    try {
      const result = await updateUserMutation.mutateAsync({ username: data.username });
      if (result?.userAccount) {
        onUserUpdateAction(result.userAccount);
      }
      onCloseAction();
    } catch (error) {
      // Optionally handle error, e.g. show toast
    }
  };

  useEffect(() => {
    reset({ username: user.username || "" });
  }, [user, isOpen, reset]);


  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="bg-[#252525] border border-gray-800 text-white sm:max-w-md w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Username</Label>
            <Input
              id="username"
              {...register("username")}
              className="bg-[#1e1e1e] border-gray-800 text-white w-full"
              placeholder="Username"
              disabled={isSubmitting || updateUserMutation.isPending}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
            {updateUserMutation.error && (
              <p className="text-sm text-red-500">
                {updateUserMutation.error.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCloseAction}
              className="bg-transparent border-gray-800 text-white hover:bg-[#1e1e1e]"
              disabled={isSubmitting || updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting || updateUserMutation.isPending}
            >
              {isSubmitting || updateUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}