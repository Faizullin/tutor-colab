import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { PyVariableWrapperType } from "../types";
import PyUtils from "../utils";

interface FrameVariableData extends Record<string, any> {
  name: string;
  label: string;
  variables: PyVariableWrapperType[];
}

export type PyFrameNodeType = Node<FrameVariableData>;

export function FrameNode({ data }: NodeProps<PyFrameNodeType>) {
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
        {data.variables.map((item, index) => {
          const uniqueIdentifier =
            item.value.type === "REF"
              ? `${item.value.ref}`
              : `${item.variableName}`;
          return (
            <div
              key={`${uniqueIdentifier}-${index}`}
              className="bg-slate-100 border border-slate-300 rounded p-2 relative"
            >
              <div className="flex justify-between items-center">
                <span className={"font-semibold text-slate-800 cursor-pointer"}>
                  {item.variableName}
                </span>
                {(() => {
                  if (item.value.type === "PRIMITIVE") {
                    return;
                  }
                  const nodeId = PyUtils.getVariableNodeId(item.value.ref);
                  return (
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={nodeId}
                      className="!w-3 !h-3 !bg-blue-600 !border-2 !border-blue-700 !rounded-full"
                      style={{
                        left: -6,
                        top: "10%",
                        transform: "translateY(-50%)",
                        zIndex: 1001,
                      }}
                    />
                  );
                })()}
              </div>
              <StackType value={item} />
              {item.value.type === "REF" && (
                <div className="text-xs text-slate-500 mt-1">
                  {/* <Handle
                    type="source"
                    id={handleId}
                    position={Position.Right}
                    className="!w-2.5 !h-2.5 !bg-indigo-600 !border-2 !border-indigo-700 !rounded-full absolute"
                    style={{
                      right: -6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                    }}
                  /> */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const StackType = ({ value }: { value: PyVariableWrapperType }) => {
  if (value.value.type === "REF") {
    return (
      <div className="text-xs text-slate-600 mt-1">
        <div>[REF] {value.variableName}</div>
      </div>
    );
  } else if (value.value.type === "PRIMITIVE") {
    return (
      <div className="text-xs text-slate-600 mt-1">
        <div>[PRIMITIVE] {value.variableName}</div>
        <div className="mt-2 ml-2 p-2 bg-white border border-slate-300 rounded shadow">
          {value.value.value}
        </div>
      </div>
    );
  } else {
    return (
      <div className="text-xs text-slate-600 mt-1">
        <div>Unknown type</div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  }
};
