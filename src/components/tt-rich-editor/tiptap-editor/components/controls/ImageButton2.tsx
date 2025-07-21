import MediaLibraryNiceDialog from "@/components/attachment/media-gallery/media-library-nice-dialog";
import { Attachment } from "@/generated/prisma";
import { showComponentNiceDialog } from "@/lib/nice-dialog";
import { useEditorState } from "@tiptap/react";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

const getPublicUrl = (image: any) => {
  return image?.secure_url || image?.url || "";
};

const ImageButton = () => {
  const { editor } = useTiptapContext();
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        active: ctx.editor.isActive("image"),
        disabled: !ctx.editor.isEditable,
      };
    },
  });

  // Handler for image upload
  const handleUpload = () => {
    showComponentNiceDialog<{
      record: Attachment;
      reason?: string;
    }>(MediaLibraryNiceDialog, {
      args: {
        objectType: "InfoCard",
      },
    }).then((result) => {
      if (result?.result.record) {
        const image = result?.result.record;
        if (image) {
          const url = getPublicUrl(image);
          editor
            .chain()
            .focus()
            .insertImage({
              src: url,
              // width: image.width,
              // height: image.height,
            })
            .run();
        }
      }
    });
  };

  return (
    <>
      <MenuButton
        icon="Image"
        tooltip="Image"
        {...state}
        onClick={handleUpload}
      />
      {/* <CldUploadWidget
        uploadPreset="kaz-game-publo"
        onUploadAdded={console.log}
        onSuccess={(result) => {
          const image = result?.info;
          if (result.event === "success") {
            const url = getPublicUrl(image);
            editor
              .chain()
              .focus()
              .insertImage({
                src: url,
                // width: image.width,
                // height: image.height,
              })
              .run();
          }
        }}
      >
        {({ open }) => {
          return (
            <MenuButton
              icon="Image"
              tooltip="Image"
              {...state}
              onClick={() => open()}
            />
          );
        }}
      </CldUploadWidget> */}
    </>
  );
};

export default ImageButton;
