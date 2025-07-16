import { Edge, MarkerType, Node } from "@xyflow/react";
import { VisualizationServiceBase } from "../../base/service-base";
import { ExecutionRequest, TraceStep } from "../../base/types";
import { HeapNodeType } from "./flow/HeapNode";
import { StackNodeType } from "./flow/StackNode";
import {
  CppGeneralVariableType,
  CppPointerVariableType,
  HexAddress,
  UNINITIALIZED,
} from "./types";
import CppUtils from "./utils";

export default class CppVisualizationService extends VisualizationServiceBase {
  async executeCode(request: Omit<ExecutionRequest, "language">) {
    return await super.executeCode({ ...request, language: "cpp" });
  }
  parseToData(inputJsonData: TraceStep) {
    const nodes: Node<any>[] = [];
    const edges: Edge[] = [];

    let heapNodeIndex = 0;
    Object.entries(inputJsonData.heap).forEach(([, heapData]) => {
      const heap = CppUtils.cppConvertHeap(heapData);
      const heapId = CppUtils.getHeapNodeId(heap);
      const heapNode: HeapNodeType = {
        id: heapId,
        type: "heap",
        position: {
          x: 400,
          y: 50 + heapNodeIndex * 250,
        },
        data: {
          heap,
        },
        zIndex: 1, // Lower z-index for nodes
      };
      nodes.push(heapNode);
      heapNodeIndex++;
    });

    if (
      inputJsonData.stack_to_render &&
      inputJsonData.stack_to_render.length > 0
    ) {
      inputJsonData.stack_to_render.forEach((stackFrame, frameIdx) => {
        const variables = (stackFrame.ordered_varnames || []).map((varName) => {
          const varData = stackFrame.encoded_locals[varName];
          const value = CppUtils.cppConvert(varData);
          return {
            variableName: varName,
            value,
          };
        });
        const frameNode: StackNodeType = {
          id: CppUtils.getFrameNodeId(stackFrame),
          data: {
            label: `${stackFrame.func_name}`,
            variables,
          },
          type: "stack",
          position: { x: 50, y: 100 + frameIdx * 220 },
          zIndex: 1,
        };
        nodes.push(frameNode);
      });
    }

    const addressToNodeIdMap = new Map<HexAddress, string>();
    nodes.forEach((nodeItem) => {
      if (nodeItem.type === "heap") {
        const typedNodeItem = nodeItem as HeapNodeType;
        if (CppUtils.isArray(typedNodeItem.data.heap.value)) {
          typedNodeItem.data.heap.value.value.forEach((element) => {
            addressToNodeIdMap.set(element.address, typedNodeItem.id);
          });
        }
      } else if (nodeItem.type === "stack") {
        const typedNodeItem = nodeItem.data as StackNodeType["data"];
        typedNodeItem.variables.forEach((variable) => {
          addressToNodeIdMap.set(variable.value.address, nodeItem.id);
        });
      }
    });
    nodes.forEach((nodeItem) => {
      if (nodeItem.type === "heap") {
        const typedNodeItem = nodeItem as HeapNodeType;
        generatePointerEdges(
          typedNodeItem.data.heap.value,
          {
            currentNodeId: nodeItem.id,
            variablePath: "value",
          },
          addressToNodeIdMap,
          edges
        );
      } else if (nodeItem.type === "stack") {
        const typedNodeItem = nodeItem.data as StackNodeType["data"];
        typedNodeItem.variables.forEach((variable) => {
          generatePointerEdges(
            variable.value,
            {
              currentNodeId: nodeItem.id,
              variablePath: variable.variableName,
            },
            addressToNodeIdMap,
            edges
          );
        });
      }
    });

    // edges.forEach((edge) => {
    //   console.log(
    //     `${edge.source}.${edge.sourceHandle} -> ${edge.target}.${edge.targetHandle}`
    //   );
    // });

    return {
      nodes,
      edges,
    };
  }
}

interface EdgeContext {
  currentNodeId: string;
  variablePath: string;
}

function generatePointerEdges(
  varValue: CppGeneralVariableType,
  ctx: EdgeContext,
  addressToNodeIdMap: Map<HexAddress, string>,
  edges: Edge[] = []
): void {
  if (varValue.kind === "C_STRUCT") {
    varValue.objects.forEach((obj) => {
      generatePointerEdges(
        obj.value,
        {
          ...ctx,
          variablePath: `${ctx.variablePath}.${obj.variableName}`,
        },
        addressToNodeIdMap,
        edges
      );
    });
    return;
  }
  if (!varValue || varValue.value === UNINITIALIZED) return;

  switch (varValue.kind) {
    case "C_DATA":
      if (varValue.type === "pointer") {
        const typedVarValue = varValue as CppPointerVariableType;
        const targetAddr = typedVarValue.value;
        if (targetAddr === UNINITIALIZED) {
          throw new Error("Pointer value is UNINITIALIZED");
        }
        const targetNodeId = addressToNodeIdMap.get(targetAddr);
        if (targetNodeId) {
          const sourceHandleId = CppUtils.getVariableNodeId(varValue);
          const targetHandleId = CppUtils.getVariableNodeId(targetAddr);
          edges.push({
            id: `edge-${ctx.currentNodeId}-${targetAddr}-${ctx.variablePath}`,
            source: ctx.currentNodeId,
            sourceHandle: sourceHandleId,
            target: targetNodeId,
            targetHandle: targetHandleId,
            animated: true,
            style: { strokeWidth: 1.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#2563eb",
              width: 15,
              height: 15,
            },
          });
        }
      }
      break;

    case "C_ARRAY":
      varValue.value.forEach((child, index) => {
        generatePointerEdges(
          child,
          {
            ...ctx,
            variablePath: `${ctx.variablePath}[${index}]`,
          },
          addressToNodeIdMap,
          edges
        );
      });
      break;
    default:
      throw new Error(`Unknown variable kind: ${(varValue as any).kind}`);
  }
}
