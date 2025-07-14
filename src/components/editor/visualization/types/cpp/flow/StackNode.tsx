import { Handle, Node, NodeProps, Position } from "@xyflow/react";

export interface StackVariableData extends Record<string, unknown> {
  label: string;
  variables: Array<{
    id: string;
    name: string;
    type: string;
    address: string;
    value?: string;
  }>;
}

export function StackNode({ data, id }: NodeProps<Node<StackVariableData>>) {
  return (
    <div
      className="bg-slate-200 border-2 border-slate-400 rounded-lg shadow-lg min-w-[200px] relative"
      style={{ zIndex: 1 }}
    >
      {/* Stack Header */}
      <div className="bg-slate-600 text-white px-4 py-2 rounded-t-lg font-bold text-center">
        {data.label}
      </div>

      {/* Stack Variables */}
      <div className="p-3 space-y-2">
        {data.variables.map((variable) => (
          <div
            key={variable.id}
            className="bg-slate-100 border border-slate-300 rounded p-2 relative"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">
                {variable.name}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={`${id}-${variable.id}`}
                className="!w-3 !h-3 !bg-blue-600 !border-2 !border-blue-700 !rounded-full"
                style={{
                  right: -6, // Adjusted handle position
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1001, // Higher z-index for handles
                }}
              />
            </div>
            <div className="text-xs text-slate-600 mt-1">
              <div>{variable.type}</div>
              <div className="font-mono">{variable.address}</div>
              {variable.value && (
                <div className="text-blue-600">→ {variable.value}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
