import { PythonTutorVisualizationEditorProvider } from "./context";
import { EditorRender } from "./render";
import "./code-editor/styles.css"

const PythonTutorVisualizationEditor = {
  Root: PythonTutorVisualizationEditorProvider,
  RenderVisual: EditorRender,
};

export default PythonTutorVisualizationEditor;
