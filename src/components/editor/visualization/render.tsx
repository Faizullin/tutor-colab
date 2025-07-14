import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEditor } from "../context";
import { CppVisualizationRender } from "./types/cpp/render";

const RenderersDict = {
  cpp: CppVisualizationRender,
};

export const VisualizationRender = () => {
  const { language } = useEditor();
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
