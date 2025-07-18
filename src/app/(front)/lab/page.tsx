import { EditorProvider } from "@/components/editor/context";
import { EditorRender } from "@/components/editor/render";

export default function LabPage() {
  return (
    <EditorProvider>
      <EditorRender />
    </EditorProvider>
  );
}
