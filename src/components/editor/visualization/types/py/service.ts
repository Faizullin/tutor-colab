import { Edge, Node } from "@xyflow/react";
import { VisualizationServiceBase } from "../../base/service-base";
import { ExecutionRequest, TraceStep } from "../../base/types";
import { PyFrameNodeType } from "./flow/FrameNode";
import { PyHeapNodeType } from "./flow/HeapNode";
import { PyGlobalReferenceVariableType, PyVariableWrapperType } from "./types";
import PyUtils from "./utils";

export default class PyVisualizationService extends VisualizationServiceBase {
  async executeCode(request: Omit<ExecutionRequest, "language">) {
    return await super.executeCode({ ...request, language: "python3" });
  }
  parseToData(inputJsonData: TraceStep) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let heapNodeIndex = 0;
    const globalFramesVariables: Array<PyVariableWrapperType> = [];
    Object.entries(inputJsonData.globals!).forEach(([key, globalData]) => {
      const globalItem = PyUtils.pyConvert(globalData);
      if (globalItem.type !== "PRIMITIVE" && globalItem.type !== "REF") {
        throw new Error(
          `Global variable ${key} is not a primitive or reference type`
        );
      }
      globalFramesVariables.push({
        variableName: key,
        value: globalItem,
      });
    });
    const globalFrameId = PyUtils.getFrameNodeId("globals");
    const globalFrameNode: PyFrameNodeType = {
      id: globalFrameId,
      type: "frame",
      position: {
        x: 400,
        y: 50 + heapNodeIndex * 250,
      },
      data: {
        name: "globals",
        label: "Global frame",
        variables: globalFramesVariables,
      },
      zIndex: 1,
    };
    nodes.push(globalFrameNode as Node<any>);
    heapNodeIndex++;

    Object.entries(inputJsonData.heap || {}).forEach(
      ([keyRefAddress, data]) => {
        const heapItem = PyUtils.pyConvert(data, {
          refAddress: `${Number(keyRefAddress)}`,
        });
        if (heapItem.type === "FUNCTION") {
          if (
            !globalFramesVariables
              .filter((v) => v.value.type === "REF")
              .map((v) => (v.value as PyGlobalReferenceVariableType).ref)
              .some((v) => v === heapItem.refAddress)
          ) {
            return;
          }
        }
        const nodeId = PyUtils.getVariableNodeId(heapItem);

        const heapNode: PyHeapNodeType = {
          id: nodeId,
          type: "heap",
          position: {
            x: 400,
            y: 50 + heapNodeIndex * 250,
          },
          data: {
            heap: heapItem,
          },
          zIndex: 1,
        };
        nodes.push(heapNode);
        heapNodeIndex++;
      }
    );

    if (
      inputJsonData.stack_to_render &&
      inputJsonData.stack_to_render.length > 0
    ) {
      inputJsonData.stack_to_render.forEach((stackFrame, frameIdx) => {
        const variables = (stackFrame.ordered_varnames || []).map((varName) => {
          const varData = stackFrame.encoded_locals[varName];
          const value = PyUtils.pyConvert(varData);
          if (value.type !== "PRIMITIVE" && value.type !== "REF") {
            throw new Error(
              `Variable ${varName} in frame ${stackFrame.func_name} is not a primitive or reference type`
            );
          }
          return {
            variableName: varName,
            value,
          };
        });
        const frameNode: PyFrameNodeType = {
          id: PyUtils.getFrameNodeId(stackFrame),
          type: "frame",
          data: {
            name: stackFrame.func_name,
            label: `${stackFrame.func_name}`,
            variables,
          },
          position: { x: 50, y: 100 + frameIdx * 220 },
          zIndex: 1,
        };
        nodes.push(frameNode);
      });
    }

    const addressToNodeIdMap = new Map<string, string>();
    nodes.forEach((nodeItem) => {
      if (nodeItem.type === "heap") {
        const typedNodeItem = nodeItem as PyHeapNodeType;
        if (typedNodeItem.data.heap.type === "COLLECTION") {
          // console.log(`Collection found: ${{...typedNodeItem.data.heap}}`);
          // typedNodeItem.data.heap.fields.forEach((element) => {
          //   addressToNodeIdMap.set(`${element.key}`, typedNodeItem.id);
          // });
        }
      } else if (nodeItem.type === "frame") {
        const typedNodeItem = nodeItem as PyFrameNodeType;
        typedNodeItem.data.variables.forEach((variable) => {
          if (variable.value.type === "REF") {
            addressToNodeIdMap.set(
              `${(variable.value as PyGlobalReferenceVariableType).ref}`,
              nodeItem.id
            );
          } else if (variable.value.type === "PRIMITIVE") {
            addressToNodeIdMap.set(
              `primitive.${variable.variableName}`,
              nodeItem.id
            );
          } else {
            throw new Error(
              `Variable ${variable.variableName} in frame ${typedNodeItem.data.name} is not a primitive or reference type`
            );
          }
        });
      }
    });
    console.log("Nodes:", nodes);
    addressToNodeIdMap.entries().forEach(([address, nodeId]) => {
      console.log(`[${address}]: ${nodeId}`);
    });
    // nodes.forEach((nodeItem) => {
    //   if (nodeItem.type === "heap") {
    //     const typedNodeItem = nodeItem as PyHeapNodeType;
    //     generatePointerEdges(
    //       typedNodeItem.data.heap,
    //       {
    //         currentNodeId: nodeItem.id,
    //         variablePath: "value",
    //       },
    //       addressToNodeIdMap,
    //       edges
    //     );
    //   } else if (nodeItem.type === "stack") {
    //     const typedNodeItem = nodeItem as PyFrameNodeType;
    //     typedNodeItem.data.variables.forEach((variable) => {
    //       generatePointerEdges(
    //         variable,
    //         {
    //           currentNodeId: nodeItem.id,
    //           variablePath: variable.key,
    //         },
    //         addressToNodeIdMap,
    //         edges
    //       );
    //     });
    //   }
    // });

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

// interface EdgeContext {
//   currentNodeId: string;
//   variablePath: string;
// }

// function generatePointerEdges(
//   varValue: PyGeneralVariableType,
//   ctx: EdgeContext,
//   addressToNodeIdMap: Map<string, string>,
//   edges: Edge[] = []
// ): void {
//   if (varValue.type === "CLASS") {
//     varValue.fields.forEach((obj) => {
//       generatePointerEdges(
//         obj,
//         {
//           ...ctx,
//           variablePath: `${ctx.variablePath}.${obj.key}`,
//         },
//         addressToNodeIdMap,
//         edges
//       );
//     });
//     return;
//   } else if (!varValue || varValue === null) {
//     return;
//   } else if (varValue.type === "PRIMITIVE") {
//     return; // No edges for primitive types
//   } else if (varValue.type === "REF") {
//     const targetAddr = varValue.ref;
//     console.log(
//       `Reference found: ${targetAddr}`,
//       { ...varValue },
//       addressToNodeIdMap.get(targetAddr)
//     );
//     if (targetAddr === null) {
//       throw new Error("Pointer value is UNINITIALIZED");
//     }
//     const targetNodeId = addressToNodeIdMap.get(`${targetAddr}`);
//     if (targetNodeId) {
//       const sourceHandleId = PyUtils.getVariableNodeId(varValue);
//       const targetHandleId = PyUtils.getVariableNodeId(targetAddr);
//       edges.push({
//         id: `edge-${ctx.currentNodeId}-${targetAddr}-${ctx.variablePath}`,
//         source: ctx.currentNodeId,
//         sourceHandle: sourceHandleId,
//         target: targetNodeId,
//         targetHandle: targetHandleId,
//         animated: true,
//         style: { strokeWidth: 1.5 },
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           color: "#2563eb",
//           width: 15,
//           height: 15,
//         },
//       });
//     }
//     return;
//   } else if (varValue.type === "COLLECTION") {
//     return;
//     // Handle collections (arrays, lists, etc.)
//     // varValue.fields.forEach((item) => {
//     //   generatePointerEdges(
//     //     item.value,
//     //     {
//     //       ...ctx,
//     //       variablePath: `${ctx.variablePath}[${item.key}]`,
//     //     },
//     //     addressToNodeIdMap,
//     //     edges
//     //   );
//     // });
//     return;
//   } else if (varValue.type === "INSTANCE") {
//     varValue.fields.forEach((obj) => {
//       generatePointerEdges(
//         obj,
//         {
//           ...ctx,
//           variablePath: `${ctx.variablePath}.${obj.key}`,
//         },
//         addressToNodeIdMap,
//         edges
//       );
//     });
//     return;
//   } else if (varValue.type === "FUNCTION") {
//     // Functions do not have edges, but we can log or handle them if needed
//     console.log(`Function found: ${varValue.name}`);
//     return;
//   }

//   console.log(`Unhandled Python variable: ${varValue as any}`);
//   // If we reach here
//   throw new Error(`Unhandled Python variable type: ${(varValue as any).type}`);
// }
