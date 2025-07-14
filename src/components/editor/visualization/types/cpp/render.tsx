import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
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
import { HeapArrayNode, HeapObjectNode, HeapStringNode } from "./flow/HeapNode";
import { StackNode } from "./flow/StackNode";
import CppVisualizationService from "./service";

import { useEditor } from "@/components/editor/context";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import "@xyflow/react/dist/style.css";

export const CppVisualizationRender = () => {
  const { executionTrace, currentStep, error, result, viewMode } = useEditor();

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
                stdout={executionTrace?.trace?.[currentStep]?.stdout || ""}
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
  stack: StackNode,
  heapArray: HeapArrayNode,
  heapString: HeapStringNode,
  heapObject: HeapObjectNode,
};

const nodeColor = (node: Node) => {
  switch (node.type) {
    case "stack":
      return "#64748b";
    case "heapArray":
      return "#eab308";
    case "heapString":
      return "#22c55e";
    case "heapObject":
      return "#a855f7";
    default:
      return "#6b7280";
  }
};

export const cppEditorService = new CppVisualizationService();

const MainVisualizationRender = () => {
  const { currentStep, executionTrace } = useEditor();
  const [showMemory, setShowMemory] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (executionTrace) {
      if(executionTrace.status === "success") {
        const parsed = cppEditorService.parser(executionTrace.trace[currentStep]);
        setNodes(parsed.nodes as any);
        setEdges(parsed.edges as any);
      }
    }
  }, [currentStep, executionTrace, setEdges, setNodes]);

  return (
    <>
      <VisualizationCommon.Render.Container className="mb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            Variable Visualization (Step {currentStep + 1})
          </h4>
          <label className="flex items-center text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showMemory}
              onChange={(e) => setShowMemory(e.target.checked)}
              className="mr-1 w-3 h-3"
            />
            Show memory
          </label>
        </div>
      </VisualizationCommon.Render.Container>
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
          nodes={showMemory
            ? nodes
            : nodes.filter(
                (n: any) =>
                  n.type !== "heapArray" &&
                  n.type !== "heapString" &&
                  n.type !== "heapObject"
              )}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
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
    </>
  );
};
