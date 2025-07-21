"use client";

import useTiptapEditor, {
  UseTiptapEditorOptions,
} from "@/components/tt-rich-editor/tiptap-editor/hooks/useTiptapEditor";
import ExtensionKit from "@/components/tt-rich-editor/tiptap-editor/kit";
import { EditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";

export default function RenderContent({ md }: { md: string }) {
  const contentElement = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const editorOptions: UseTiptapEditorOptions = {
    ref: editorRef,
    // placeholder,
    extensions: ExtensionKit,
    content: md,
    editable: false,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    autofocus: false,
  };
  const editor = useTiptapEditor(editorOptions);
  useEffect(() => {
    if (editor && contentElement.current) {
      editor.commands.setContent(md);
      contentElement.current.style.display = "flex";
      setTimeout(() => {
        contentElement.current!.style.display = "";
      }, 0);
    }
  }, [editor, md]);
  return (
    <EditorContent
      ref={contentElement}
      editor={editor}
      className="rte-editor__content"
    />
  );
  // swap for `react-markdown` later if you like
  // return (
  //     <pre className="whitespace-pre-wrap leading-relaxed text-gray-300">
  //         {md}
  //     </pre>
  // );
}
