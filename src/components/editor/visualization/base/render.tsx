import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Code,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { PropsWithChildren } from "react";
import { usePythonTutorVisualizationEditor } from "../../context";

const VisualizationRunAlert = () => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
      <p className="text-sm">Click &quot;Run&quot; to execute your program</p>
      <p className="text-sm">
        Click &quot;Debug&quot; to visualize execution step by step
      </p>
    </div>
  );
};

const VisualizationRawResponse = ({ result }: { result: string }) => {
  return (
    <div className="border-t pt-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold">Raw Response</h4>
      </div>
      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-96 whitespace-pre-wrap border">
        {result.length > 1000
          ? `${result.substring(0, 1000)}...\n\n[Response truncated]`
          : result}
      </pre>
    </div>
  );
};

const VisualizationErrorAlert = ({ error }: { error: string }) => {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="text-xs">
        {error || "An unexpected error occurred."}
      </AlertDescription>
    </Alert>
  );
};

const VisualizationConsoleOutput = ({ stdout }: { stdout: string }) => {
  return (
    <div className="border-t pt-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Output
        </h4>
      </div>
      <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-auto max-h-32 border">
        {stdout}
      </pre>
    </div>
  );
};

const VisualizationToolbar = () => {
  const { executionTrace, currentVisualData, goToStep, viewMode, setViewMode } =
    usePythonTutorVisualizationEditor();

  if (!executionTrace) return null;

  return (
    <div className="border-b pb-4 mb-4 space-y-4">
      {/* View Mode Tabs - Moved to top */}
      <div className="flex items-center gap-1 border-b">
        <button
          onClick={() => setViewMode("visual")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "visual"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Visual
        </button>
        <button
          onClick={() => setViewMode("json")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === "json"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          JSON
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToStep(0)}
            disabled={currentVisualData.currentStep === 0}
          >
            <SkipBack className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToStep(currentVisualData.currentStep - 1)}
            disabled={currentVisualData.currentStep === 0}
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
          <Badge variant="secondary" className="mx-2">
            Step {currentVisualData.currentStep + 1} of{" "}
            {executionTrace.trace.length}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToStep(currentVisualData.currentStep + 1)}
            disabled={
              currentVisualData.currentStep === executionTrace.trace.length - 1
            }
          >
            <ArrowRight className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToStep(executionTrace.trace.length - 1)}
            disabled={
              currentVisualData.currentStep === executionTrace.trace.length - 1
            }
          >
            <SkipForward className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span>Next to execute</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>Executed</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Line:{" "}
              {executionTrace.trace[currentVisualData.currentStep]?.line ||
                "N/A"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

const VisualizationRenderJson = () => {
  const { executionTrace, currentVisualData } =
    usePythonTutorVisualizationEditor();
  if (!executionTrace) return null;
  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          Execution Trace (Step {currentVisualData.currentStep + 1})
        </h4>
      </div>
      <div className="h-96 overflow-auto border rounded-md">
        <pre className="text-xs font-mono p-4 whitespace-pre-wrap">
          {JSON.stringify(
            executionTrace.trace[currentVisualData.currentStep],
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

const VisualizationRenderContainer = ({
  children,
  className,
}: PropsWithChildren<{
  className?: ReturnType<typeof cn>;
}>) => {
  return <div className={cn("px-4", className)}>{children}</div>;
};

const VisualizationRender = {
  Json: VisualizationRenderJson,
  Container: VisualizationRenderContainer,
};

const VisualizationCommon = {
  RunAlert: VisualizationRunAlert,
  RawResponse: VisualizationRawResponse,
  ErrorAlert: VisualizationErrorAlert,
  ConsoleOutput: VisualizationConsoleOutput,
  Toolbar: VisualizationToolbar,
  Render: VisualizationRender,
};

export default VisualizationCommon;
