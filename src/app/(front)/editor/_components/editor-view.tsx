"use client";

import { ProjectEditorContentProvider, ProjectEditorProvider } from "./context";
import { EditorRender } from "./editor-render";
import { ProjectRouterOutputs } from "./types";

export default function EditorView(props: {
  initialData?: ProjectRouterOutputs;
  demo?: boolean;
}) {
  return (
    <ProjectEditorProvider initialData={props.initialData} demo={props.demo}>
      <ProjectEditorContentProvider>
        <EditorRender />
      </ProjectEditorContentProvider>
    </ProjectEditorProvider>
  );
}
