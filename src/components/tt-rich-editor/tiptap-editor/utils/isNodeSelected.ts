import { Editor, isNodeSelection } from "@tiptap/react";
import { ImageFigure, Link } from "../extensions";

export const isNodeSelected = (editor: Editor) => {
  const customNodes = [ImageFigure.name, Link.name];

  return (
    customNodes.some((type) => editor.isActive(type)) ||
    isNodeSelection(editor.state.selection)
  );
};
