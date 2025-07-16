import { Edge, Node } from "reactflow";

export type VisualDataType = {
  currentStep: number;
  flow: {
    nodes: Record<
      string,
      {
        relatedTraceStep: number;
        value: Node;
      }
    >;
    edges: Record<
      string,
      {
        relatedTraceStep: number;
        value: Edge;
      }
    >;
  };
};
