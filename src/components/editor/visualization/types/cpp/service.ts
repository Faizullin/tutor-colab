import { Edge, MarkerType, Node } from "@xyflow/react";
import { VisualizationServiceBase } from "../../base/service-base";
import { ExecutionRequest, TraceStep } from "../../base/types";
import { HeapBlockData } from "./flow/HeapNode";
import { StackVariableData } from "./flow/StackNode";

interface MemoryData {
  event: string;
  func_name: string;
  line: number;
  stack_to_render: Array<{
    encoded_locals: Record<string, any>;
    func_name: string;
    ordered_varnames: string[];
    frame_id: string;
  }>;
  heap: Record<string, any>;
  stdout?: string;
}

interface ArrayInfo {
  nodeId: string;
  baseAddress: string;
  elementSize: number;
  elements: Array<{
    index: number;
    address: string;
    value: string;
    isPointer: boolean;
  }>;
}

export default class CppVisualizationService extends VisualizationServiceBase {
  async executeCode(request: Omit<ExecutionRequest, "language">) {
    return await super.executeCode({ ...request, language: "cpp" });
  }
  parser(inputJsonData: TraceStep) {
    const jsonData: MemoryData = inputJsonData as MemoryData;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const addressToElementMap = new Map<
      string,
      { nodeId: string; elementAddress: string; elementIndex: number }
    >();
    const arrayInfoMap = new Map<string, ArrayInfo>();

    // Parse Heap first to build address mapping and array info
    let heapNodeIndex = 0;
    Object.entries(jsonData.heap).forEach(([address, heapData]) => {
      
      // Handle different heapData structures
      let actualData: any[];
      if (heapData && typeof heapData === 'object' && 'kind' in heapData && 'val' in heapData) {
        // New structure: {kind: 'readonly_memory', val: Array}
        actualData = heapData.val as any[];
      } else {
        // Original structure: direct array
        actualData = heapData as any[];
      }
      
      const [objectType, , metadata, ...elements] = actualData;

      if (objectType === "C_ARRAY") {
        const parsedElements = elements.map((element: any[], index: number) => {
          const [, elemAddress, elemType, elemValue] = element;
          const elementData = {
            index,
            value:
              elemValue === "<UNINITIALIZED>"
                ? "?"
                : typeof elemValue === "string" && elemValue.startsWith("0x")
                ? elemValue
                : elemValue?.toString() || "?",
            address: elemAddress,
            isPointer:
              elemType === "pointer" ||
              (typeof elemValue === "string" && elemValue.startsWith("0x")),
          };

          // Map each element address to its node and element info
          addressToElementMap.set(elemAddress, {
            nodeId: `heap-${address}`,
            elementAddress: elemAddress,
            elementIndex: index,
          });

          return elementData;
        });

        // Store array info for offset calculations
        arrayInfoMap.set(address, {
          nodeId: `heap-${address}`,
          baseAddress: address,
          elementSize: metadata.elt_bytes || 1,
          elements: parsedElements,
        });

        // Determine node type based on content
        const hasPointers = parsedElements.some((elem) => elem.isPointer);
        const nodeType = hasPointers
          ? "heapArray"
          : metadata.elt_bytes === 1
          ? "heapString"
          : "heapArray";

        // Determine if this is readonly memory
        const isReadonly = heapData && typeof heapData === 'object' && 'kind' in heapData && heapData.kind === 'readonly_memory';
        const labelPrefix = isReadonly ? "readonly " : "";

        const heapNode: Node<HeapBlockData> = {
          id: `heap-${address}`,
          type: nodeType,
          position: {
            x: 400,
            y: 50 + heapNodeIndex * 250, // Stack vertically, 250px apart
          },
          data: {
            label: `${labelPrefix}array (${metadata.elt_bytes}B elements)`,
            address: address,
            type: "array",
            size: elements.length,
            elements: parsedElements,
          },
          zIndex: 1, // Lower z-index for nodes
        };
        nodes.push(heapNode);

        heapNodeIndex++;
      }
    });

    // Function to find target element by address or offset calculation
    function findTargetElement(
      targetAddress: string
    ): { nodeId: string; elementAddress: string; elementIndex: number } | null {
      // First, try direct address match
      const directMatch = addressToElementMap.get(targetAddress);
      if (directMatch) {
        return directMatch;
      }

      // If no direct match, try to find by calculating offset within arrays
      for (const [baseAddress, arrayInfo] of arrayInfoMap.entries()) {
        const baseAddr = Number.parseInt(baseAddress, 16);
        const targetAddr = Number.parseInt(targetAddress, 16);

        if (targetAddr >= baseAddr) {
          const offset = targetAddr - baseAddr;
          const elementIndex = Math.floor(offset / arrayInfo.elementSize);

          // Check if this offset corresponds to a valid element in this array
          if (elementIndex >= 0 && elementIndex < arrayInfo.elements.length) {
            const element = arrayInfo.elements[elementIndex];
            return {
              nodeId: arrayInfo.nodeId,
              elementAddress: element.address,
              elementIndex: elementIndex,
            };
          }
        }
      }

      return null;
    }

    // Parse Stack and create connections
    if (jsonData.stack_to_render && jsonData.stack_to_render.length > 0) {
      const stackFrame = jsonData.stack_to_render[0];
      const variables = stackFrame.ordered_varnames
        .map((varName) => {
          const varData = stackFrame.encoded_locals[varName];
          if (varData) {
            const [, address, type, value, metadata] = varData;
            return {
              id: varName,
              name: varName,
              type: metadata?.target_type || type,
              address: address,
              value:
                typeof value === "string" && value.startsWith("0x")
                  ? value
                  : undefined,
            };
          }
          return null;
        })
        .filter(Boolean);

      const stackNode: Node<StackVariableData> = {
        id: "stack-main",
        type: "stack",
        position: { x: 50, y: 100 },
        data: {
          label: `Stack (${stackFrame.func_name})`,
          variables: variables as any[],
        },
        zIndex: 1, // Lower z-index for nodes
      };
      nodes.push(stackNode);

      // Create edges from stack to specific heap elements
      variables.forEach((variable) => {
        if (variable?.value && variable.value.startsWith("0x")) {
          const targetAddress = variable.value;
          const targetInfo = findTargetElement(targetAddress);

          if (targetInfo) {
            // Connect to specific element
            edges.push({
              id: `stack-${variable.id}-to-elem-${targetAddress}`,
              source: "stack-main",
              sourceHandle: `stack-main-${variable.id}`,
              target: targetInfo.nodeId,
              targetHandle: `${targetInfo.nodeId}-elem-${targetInfo.elementAddress}`,
              animated: true,
              style: {
                stroke: "#2563eb",
                strokeWidth: 2, // Reduced stroke width
                zIndex: 1000, // High z-index for edges
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#2563eb",
                width: 15, // Reduced arrow size
                height: 15, // Reduced arrow size
              },
              zIndex: 1000,
            });
          } else {
            // Fallback to node-level connection if element not found
            const targetHeapId = `heap-${targetAddress}`;
            edges.push({
              id: `stack-${variable.id}-to-${targetHeapId}`,
              source: "stack-main",
              sourceHandle: `stack-main-${variable.id}`,
              target: targetHeapId,
              targetHandle: `${targetHeapId}-input`,
              animated: true,
              style: {
                stroke: "#2563eb",
                strokeWidth: 2, // Reduced stroke width
                zIndex: 1000,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#2563eb",
                width: 15, // Reduced arrow size
                height: 15, // Reduced arrow size
              },
              zIndex: 1000,
            });
          }
        }
      });
    }

    // Create heap-to-heap connections
    Object.entries(jsonData.heap).forEach(([address, heapData]) => {
      // Handle different heapData structures
      let actualData: any[];
      if (heapData && typeof heapData === 'object' && 'kind' in heapData && 'val' in heapData) {
        // New structure: {kind: 'readonly_memory', val: Array}
        actualData = heapData.val as any[];
      } else {
        // Original structure: direct array
        actualData = heapData as any[];
      }
      
      const [objectType, , , ...elements] = actualData;

      if (objectType === "C_ARRAY") {
        elements.forEach((element: any[]) => {
          const [, elemAddress, elemType, elemValue] = element;

          if (
            elemType === "pointer" &&
            typeof elemValue === "string" &&
            elemValue.startsWith("0x") &&
            elemValue !== "<UNINITIALIZED>"
          ) {
            const targetAddress = elemValue;
            const targetInfo = findTargetElement(targetAddress);

            if (targetInfo) {
              // Connect to specific target element
              edges.push({
                id: `heap-${address}-elem-${elemAddress}-to-elem-${targetAddress}`,
                source: `heap-${address}`,
                sourceHandle: `heap-${address}-elem-${elemAddress}-output`,
                target: targetInfo.nodeId,
                targetHandle: `${targetInfo.nodeId}-elem-${targetInfo.elementAddress}`,
                animated: true,
                style: {
                  stroke: "#dc2626",
                  strokeWidth: 2, // Reduced stroke width
                  zIndex: 1000,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#dc2626",
                  width: 15, // Reduced arrow size
                  height: 15, // Reduced arrow size
                },
                zIndex: 1000,
              });
            } else {
              // Fallback to node-level connection
              const targetHeapId = `heap-${targetAddress}`;
              edges.push({
                id: `heap-${address}-elem-${elemAddress}-to-${targetHeapId}`,
                source: `heap-${address}`,
                sourceHandle: `heap-${address}-elem-${elemAddress}-output`,
                target: targetHeapId,
                targetHandle: `${targetHeapId}-input`,
                animated: true,
                style: {
                  stroke: "#dc2626",
                  strokeWidth: 2, // Reduced stroke width
                  zIndex: 1000,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: "#dc2626",
                  width: 15, // Reduced arrow size
                  height: 15, // Reduced arrow size
                },
                zIndex: 1000,
              });
            }
          }
        });
      }
    });

    return { nodes, edges };
  }
}
