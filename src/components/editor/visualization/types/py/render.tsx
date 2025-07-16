import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  OnConnect,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import VisualizationCommon from "../../base/render";
import { FrameNode } from "./flow/FrameNode";

import { useEditor } from "@/components/editor/context";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import "@xyflow/react/dist/style.css";
import { TraceStep } from "../../base/types";
import { SettingsContextProvider } from "./context";
import PyVisualizationService from "./service";
import { HeapNode } from "./flow/HeapNode";

export const PyVisualizationRender = () => {
  const { executionTrace, currentVisualData, error, result, viewMode } =
    useEditor();

  if (error) {
    return <VisualizationCommon.ErrorAlert error={error} />;
  }

  if (executionTrace) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* className="space-y-6" */}
        <VisualizationCommon.Toolbar />
        <ResizablePanelGroup direction="vertical" className="h-full w-full">
          <ResizablePanel defaultSize={70} minSize={20} maxSize={90}>
            {viewMode === "json" ? (
              <VisualizationCommon.Render.Json />
            ) : (
              <MainVisualizationRender />
            )}
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className="bg-muted hover:bg-primary transition-colors"
          />
          <ResizablePanel defaultSize={30} minSize={10} maxSize={80}>
            {/* Console/output panel below */}
            <div className="h-full overflow-auto">
              <VisualizationCommon.ConsoleOutput
                stdout={
                  executionTrace?.trace?.[currentVisualData.currentStep]
                    ?.stdout || ""
                }
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  if (!result) {
    return <VisualizationCommon.RunAlert />;
  }

  return <VisualizationCommon.RawResponse result={result} />;
};

const nodeTypes = {
  frame: FrameNode,
  heap: HeapNode,
};

const nodeColor = (node: Node) => {
  switch (node.type) {
    case "stack":
      return "#64748b";
    case "heap":
      return "#eab308";
    default:
      return "#6b7280";
  }
};

export const pyEditorService = new PyVisualizationService();

const MainVisualizationRender = () => {
  const { currentVisualData, executionTrace } = useEditor();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const updateNodes = useCallback(
    (trace: TraceStep) => {
      const parsed = pyEditorService.parseToData(trace);
      console.log("Parsed nodes:", {
        ...parsed,
      });
      const updated = parsed.nodes.map((node) => {
        const existingNode = nodes.find((n) => n.id === node.id);
        if (existingNode) {
          return {
            ...node,
            position: existingNode.position,
          };
        }
        return node;
      });
      setNodes(updated);
      // setEdges(parsed.edges);
    },
    [nodes, setNodes]
  );

  const [lastProcessedStep, setLastProcessedStep] = useState(
    currentVisualData.currentStep
  );
  useEffect(() => {
    if (lastProcessedStep !== currentVisualData.currentStep) {
      if (executionTrace && executionTrace.status === "success") {
        updateNodes(executionTrace.trace[currentVisualData.currentStep]);
        setLastProcessedStep(currentVisualData.currentStep);
      }
    }
  }, [
    executionTrace,
    currentVisualData.currentStep,
    updateNodes,
    lastProcessedStep,
  ]);

  return (
    <SettingsContextProvider>
      <style jsx global>{`
        .react-flow__edge {
          z-index: 1000 !important;
        }
        .react-flow__edge-path {
          z-index: 1000 !important;
        }
        .react-flow__edge .react-flow__edge-path {
          stroke-width: 2px !important; /* Reduced stroke width */
        }
        .react-flow__arrowhead {
          z-index: 1001 !important;
        }
        .react-flow__edge-textwrapper {
          z-index: 1002 !important;
        }
        .react-flow__node {
          z-index: 1 !important;
        }
        /* Ensure arrow markers are visible */
        .react-flow svg defs marker {
          overflow: visible !important;
        }
        .react-flow svg defs marker path {
          fill: currentColor !important;
          stroke: currentColor !important;
        }
      `}</style>
      <div className="w-full h-full border rounded-md">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes as any}
          connectionMode={ConnectionMode.Loose}
          className="h-full"
          fitView
          fitViewOptions={{ padding: 0.1 }}
          defaultEdgeOptions={{
            animated: true,
            style: {
              strokeWidth: 2,
              zIndex: 1000,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
            },
            zIndex: 1000,
          }}
          nodesConnectable={false}
          edgesReconnectable={false}
          elementsSelectable={true}
        >
          <Controls />
          <MiniMap nodeColor={nodeColor} />
          <Background />
        </ReactFlow>
      </div>
    </SettingsContextProvider>
  );
};
