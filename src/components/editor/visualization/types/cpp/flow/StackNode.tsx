import { cn } from "@/lib/utils";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { useSettingsContext } from "../context";
import {
  CppPointerVariableType,
  CppValueContainerType,
  UNINITIALIZED,
} from "../types";
import CppUtils from "../utils";

interface StackVariableData extends Record<string, any> {
  label: string;
  variables: CppValueContainerType[];
}

export type StackNodeType = Node<StackVariableData>;

export function StackNode({ data }: NodeProps<StackNodeType>) {
  const { showMemory } = useSettingsContext();

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
          const uniqueIdentifier = `${item.value.address}`;
          const nodeId = CppUtils.getVariableNodeId(item.value);
          return (
            <div
              key={`${uniqueIdentifier}-${index}`}
              className="bg-slate-100 border border-slate-300 rounded p-2 relative"
            >
              <div className="flex justify-between items-center">
                <span className={"font-semibold text-slate-800 cursor-pointer"}>
                  {item.variableName}
                </span>
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
              </div>
              <StackType value={item.value} />
              {item.value.kind === "C_STRUCT" && (
                <div className="mt-2 ml-2 p-2 bg-white border border-slate-300 rounded shadow">
                  {item.value.objects && (
                    <>
                      <div className="font-bold text-xs mb-1 text-slate-700">
                        Fields:
                      </div>
                      <table className="w-full text-xs text-slate-700 border-collapse">
                        <tbody>
                          {item.value.objects.map((field, idx) => {
                            const val = field.value as any;
                            const handleId = CppUtils.getVariableNodeId(
                              field.value
                            );
                            return (
                              <tr
                                key={`${uniqueIdentifier}-${idx}`}
                                className={cn(
                                  idx % 2 === 0
                                    ? "bg-yellow-50"
                                    : "bg-yellow-100",
                                  "relative"
                                )}
                              >
                                <td className="font-semibold px-2 py-1 border border-yellow-200 align-top min-w-[60px]">
                                  {field.variableName}
                                  <Handle
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
                                  />
                                </td>
                                {showMemory && (
                                  <td className="px-2 py-1 border border-yellow-200 align-top text-gray-500 min-w-[80px]">
                                    {val.address}
                                  </td>
                                )}
                                <td className="px-2 py-1 border border-yellow-200 align-top text-slate-500 min-w-[60px]">
                                  {val?.type || ""}
                                </td>
                                <td className="font-mono px-2 py-1 border border-yellow-200 align-top text-blue-700 min-w-[60px]">
                                  {val?.type === "pointer"
                                    ? val.value
                                    : val?.value !== undefined
                                    ? val.value.toString()
                                    : JSON.stringify(val)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const StackType = ({ value }: { value: CppValueContainerType["value"] }) => {
  const { showMemory } = useSettingsContext();
  if (value.kind === "C_STRUCT") {
    return (
      <div className="text-xs text-slate-600 mt-1">
        {showMemory && <div className="font-mono">{value.address}</div>}
        <div>Object {value.metadata.name}</div>
      </div>
    );
  } else if (value.kind === "C_ARRAY") {
    return (
      <div className="text-xs text-slate-600 mt-1">
        {showMemory && <div className="font-mono">{value.address}</div>}
        <div>array</div>
        <div className="mt-2 ml-2 p-2 bg-white border border-slate-300 rounded shadow">
          {value.value.map((item, index) => (
            <div key={`${value.address}-${index}`} className="flex">
              {showMemory && (
                <span className="ml-2 text-gray-500">{item.address}</span>
              )}
              {item.type && (
                <span className="ml-2 text-slate-500">({item.type})</span>
              )}
              <span className="font-mono text-blue-600">
                {item.value.toString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (value.kind === "C_DATA") {
    if (value.type === "pointer") {
      const v = value as CppPointerVariableType;
      return (
        <div className="text-xs text-slate-600 mt-1">
          {showMemory && <div className="font-mono">{v.address}</div>}
          <div>pointer to {v.metadata.target_type}</div>
        </div>
      );
    } else {
      return (
        <div className="text-xs text-slate-600 mt-1">
          {showMemory && <div className="font-mono">{value.address}</div>}
          <div>{value.type}</div>
          <div
            className={cn(
              value.value === UNINITIALIZED ? "text-gray-500" : "text-blue-600"
            )}
          >
            → {value.value === UNINITIALIZED ? "?" : value.value}
          </div>
        </div>
      );
    }
  } else {
    return (
      <div className="text-xs text-slate-600 mt-1">
        <div>Unknown type</div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    );
  }
};
