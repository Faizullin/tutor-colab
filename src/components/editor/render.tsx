"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePythonTutorVisualizationEditor } from "./context";
import { CppVisualizationRender } from "./visualization/types/cpp/render";
// import { PyVisualizationRender } from "./visualization/types/py/render";

const RenderersDict = {
  cpp: CppVisualizationRender,
  // python: PyVisualizationRender,
};

export const EditorRender = () => {
  const { language } = usePythonTutorVisualizationEditor();
  const Renderer = RenderersDict[language as keyof typeof RenderersDict];
  if (!Renderer) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unsupported Language</AlertTitle>
        <AlertDescription>
          The visualization for {language} is not supported yet.
        </AlertDescription>
      </Alert>
    );
  }
  return <Renderer />;
};
