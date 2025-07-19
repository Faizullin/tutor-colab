"use client";

import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useControlDialog } from "@/hooks/use-control-dialog";
import { useMemo, useTransition } from "react";

interface DeleteConfirmDialogProps {
  control: ReturnType<typeof useDeleteConfirmDialogControl<any>>;
}

export default function DeleteConfirmDialog({
  control,
}: DeleteConfirmDialogProps) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const isDesktop = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 768; // Adjust based on your breakpoint for desktop
  }, []);

  function onDelete() {
    startDeleteTransition(async () => {
      control.additional?.onConfirm(control.data as any);
    });
  }

  const titleMsg = control?.data?.title || "Are you absolutely sure?";
  const descriptionMsg = useMemo(() => {
    if (control.data?.message) {
      return control.data.message;
    }
    if (control.data?.multiple && control.data?.items && control.data.items.length > 0) {
      return `This action cannot be undone. This will permanently delete your ${control.data.items.length
        } ${control.data.items.length === 1 ? "item" : "items"} from our servers.`;
    }
    return "This action cannot be undone. This will permanently delete the selected items from our servers.";
  }, [control.data]);

  if (isDesktop) {
    return (
      <Dialog
        open={control.isOpen}
        onOpenChange={(v) => {
          if (!v) {
            control.close();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{titleMsg}</DialogTitle>
            <DialogDescription>{descriptionMsg}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              aria-label="Delete selected rows"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeletePending}
            >
              {isDeletePending && (
                <Loader
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    );
  }

  return (
    <Drawer
      open={control?.isOpen}
      onOpenChange={(v) => {
        if (!v) {
          control.close();
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{titleMsg}</DrawerTitle>
          <DrawerDescription>{descriptionMsg}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="gap-2 sm:space-x-0">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            aria-label="Delete selected rows"
            variant="destructive"
            onClick={onDelete}
            disabled={isDeletePending}
          >
            {isDeletePending && (
              <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
            )}
            Delete
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}


type ControlDataType<TData> = {
  multiple?: boolean;
  items?: TData[];
  title?: string;
  message?: string;
}

type TProps<TData> = {
  onConfirm: (props: ControlDataType<TData>) => void;
  onSuccess?: () => void;
}

export const useDeleteConfirmDialogControl = <TData,>(props: TProps<TData>) => {
  const _props = props;
  const control = useControlDialog
    <{
      multiple?: boolean;
      items?: TData[];
      title?: string;
      message?: string;
    }, TProps<TData>>(undefined, {
      onConfirm: (props) => {
        _props.onConfirm?.(props);
      },
      onSuccess: () => {
        _props.onSuccess?.();
      },
    });

  return control;
}