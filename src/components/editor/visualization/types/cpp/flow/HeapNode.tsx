import { Handle, Node, NodeProps, Position } from "@xyflow/react";

export interface HeapBlockData extends Record<string, unknown> {
  label: string;
  address: string;
  type: "array" | "object" | "string";
  size: number;
  elements?: Array<{
    index: number;
    value: string;
    address: string;
    isPointer?: boolean;
  }>;
}

export function HeapArrayNode({ data, id }: NodeProps<Node<HeapBlockData>>) {
  return (
    <div
      className="bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg min-w-[250px] relative"
      style={{ zIndex: 1 }}
    >
      {/* Heap Header */}
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-t-lg font-bold">
        <div className="flex justify-between items-center">
          <span>{data.label}</span>
          {/* Main node input handle - hidden but available for fallback connections */}
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-input`}
            className="!w-0 !h-0 !opacity-0"
            style={{ left: -6, zIndex: 1001 }}
          />
        </div>
        <div className="text-xs font-mono">{data.address}</div>
      </div>

      {/* Array Elements */}
      <div className="p-2">
        <div className="grid grid-cols-3 gap-1">
          {data.elements?.map((element, index) => (
            <div
              key={index}
              className="bg-yellow-200 border border-yellow-400 rounded p-1 text-center relative"
            >
              {/* Input handle for each element - now a small point inside */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-elem-${element.address}`}
                className="!w-1 !h-1 !bg-gray-700 !rounded-full !border-none" // Small, dark point
                style={{
                  left: 2, // Adjusted to be inside the border
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1001, // Higher z-index for handles
                }}
              />

              <div className="text-xs font-mono text-gray-600 font-bold">
                [{index}]
              </div>
              <div className="font-semibold text-sm">{element.value}</div>
              <div className="text-xs font-mono text-gray-500">
                {element.address}
              </div>

              {/* Output handle for pointer elements - positioned at center with higher z-index */}
              {element.isPointer &&
                element.value.startsWith("0x") &&
                element.value !== "?" && (
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${id}-elem-${element.address}-output`}
                    className="!w-3 !h-3 !bg-red-600 !border-2 !border-red-700 !rounded-full"
                    style={{
                      right: -6, // Adjusted handle position
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 1001, // Higher z-index for handles
                    }}
                  />
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeapStringNode({ data, id }: NodeProps<Node<HeapBlockData>>) {
  return (
    <div
      className="bg-green-100 border-2 border-green-400 rounded-lg shadow-lg min-w-[300px] relative"
      style={{ zIndex: 1 }}
    >
      {/* Heap Header */}
      <div className="bg-green-500 text-white px-4 py-2 rounded-t-lg font-bold">
        <div className="flex justify-between items-center">
          <span>{data.label}</span>
          {/* Main node input handle - hidden but available for fallback connections */}
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-input`}
            className="!w-0 !h-0 !opacity-0"
            style={{ left: -6, zIndex: 1001 }}
          />
        </div>
        <div className="text-xs font-mono">{data.address}</div>
      </div>

      {/* String Characters */}
      <div className="p-2">
        <div className="flex flex-wrap gap-1">
          {data.elements?.map((element, index) => (
            <div
              key={index}
              className="bg-green-200 border border-green-400 rounded p-1 text-center min-w-[40px] relative"
            >
              {/* Input handle for each character - now a small point inside */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-elem-${element.address}`}
                className="!w-1 !h-1 !bg-gray-700 !rounded-full !border-none" // Small, dark point
                style={{
                  left: 2, // Adjusted to be inside the border
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1001, // Higher z-index for handles
                }}
              />

              <div className="text-xs font-mono text-gray-600 font-bold">
                [{index}]
              </div>
              <div className="font-semibold text-sm">
                &apos;{element.value}&apos;
              </div>
              <div className="text-xs font-mono text-gray-500">
                {element.address}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-red-600 mt-2 italic">
          (this is in read-only storage, not the heap)
        </div>
      </div>
    </div>
  );
}

export function HeapObjectNode({ data, id }: NodeProps<Node<HeapBlockData>>) {
  return (
    <div
      className="bg-purple-100 border-2 border-purple-400 rounded-lg shadow-lg min-w-[200px] relative"
      style={{ zIndex: 1 }}
    >
      {/* Heap Header */}
      <div className="bg-purple-500 text-white px-4 py-2 rounded-t-lg font-bold">
        <div className="flex justify-between items-center">
          <span>{data.label}</span>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-input`}
            className="!w-1 !h-1 !bg-gray-700 !rounded-full !border-none" // Small, dark point
            style={{
              left: 2, // Adjusted to be inside the border
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1001,
            }}
          />
        </div>
        <div className="text-xs font-mono">{data.address}</div>
      </div>

      {/* Object Properties */}
      <div className="p-2 space-y-1">
        {data.elements?.map((element, index) => (
          <div
            key={index}
            className="bg-purple-200 border border-purple-400 rounded p-1 relative"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${id}-elem-${element.address}`}
              className="!w-1 !h-1 !bg-gray-700 !rounded-full !border-none" // Small, dark point
              style={{
                left: 2, // Adjusted to be inside the border
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1001,
              }}
            />
            <div className="text-xs font-mono text-gray-600 font-bold">
              [{index}]
            </div>
            <div className="font-semibold text-sm">{element.value}</div>
            <div className="text-xs font-mono text-gray-500">
              {element.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
