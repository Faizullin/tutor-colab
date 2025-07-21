import { PythonTutorVisualizationEditorProvider } from "@/components/editor/context";
import { EditorRender } from "@/components/editor/render";

export default function LabPage() {
  return (
    <PythonTutorVisualizationEditorProvider>
      <EditorRender />
    </PythonTutorVisualizationEditorProvider>
  );
}
