import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React, { useMemo } from "react";
import { useSettingsContext } from "../context";
import {
  CppArrayVariableType,
  CppCharVariableType,
  CppGeneralVariableType,
  CppPointerVariableType,
  CppPrimitiveVariableType,
  CppStructVariableType,
  UNINITIALIZED,
} from "../types";
import CppUtils from "../utils";

const valueToString = (v: CppGeneralVariableType): string => {
  if (CppUtils.isPointer(v)) {
    return v.value === UNINITIALIZED ? "?" : (v.value as string);
  }
  switch (v.kind) {
    case "C_DATA":
      return String((v as CppPrimitiveVariableType).value);
    case "C_ARRAY":
      return `[${(v as CppArrayVariableType<any>).value.length}]`;
    case "C_STRUCT":
      return `{${(v as CppStructVariableType).metadata.name}}`;
    default:
      return "?";
  }
};

const buildClasses = (colour: string) => ({
  container: `bg-${colour}-100 border-2 border-${colour}-400 rounded-lg shadow-lg min-w-[250px] relative`,
  header: `bg-${colour}-500 text-white px-4 py-2 rounded-t-lg font-bold`,
  elem: `bg-${colour}-200 border border-${colour}-400 rounded`,
});

/** *************************************************************
 * Sub‑components                                                *
 ***************************************************************/
interface ElemHandleProps {
  anchorId: string;
  position: Position;
  small?: boolean;
  isSource?: boolean;
}
const ElemHandle: React.FC<ElemHandleProps> = ({
  anchorId,
  position,
  small = true,
  isSource = false,
}) => (
  <Handle
    type={isSource ? "source" : "target"}
    position={position}
    id={anchorId}
    className={
      small
        ? "!w-1 !h-1 !bg-gray-700 !rounded-full !border-none"
        : "!w-3 !h-3 !bg-red-600 !border-2 !border-red-700 !rounded-full"
    }
    style={
      position === Position.Left
        ? { left: 2, top: "50%", transform: "translateY(-50%)", zIndex: 1001 }
        : { right: -6, top: "50%", transform: "translateY(-50%)", zIndex: 1001 }
    }
  />
);

const ArrayRenderer: React.FC<{
  arr: CppArrayVariableType<any>;
  id: string;
  elemCls: string;
  isReadOnly: boolean;
}> = ({ arr, elemCls, isReadOnly }) => {
  const { showMemory } = useSettingsContext();
  return (
    <div className="p-2">
      <div className="grid grid-cols-3 gap-1">
        {arr.value.map((el, idx) => {
          const isPtr = CppUtils.isPointer(el);
          const ptrVal = isPtr ? (el as CppPointerVariableType).value : null;
          const handleBase = CppUtils.getVariableNodeId(el);
          return (
            <div key={idx} className={`${elemCls} p-1 text-center relative`}>
              <ElemHandle anchorId={handleBase} position={Position.Left} />

              <div className="text-xs font-mono text-gray-600 font-bold">
                [{idx}]
              </div>
              {showMemory && (
                <div className="text-xs font-mono text-gray-500">
                  {el.address}
                </div>
              )}
              <div className="font-semibold text-sm">
                {isPtr ? ptrVal : valueToString(el)}
              </div>

              {isPtr && ptrVal && ptrVal !== UNINITIALIZED && (
                <ElemHandle
                  anchorId={handleBase}
                  position={Position.Right}
                  small={false}
                  isSource={true}
                />
              )}
            </div>
          );
        })}
      </div>
      {isReadOnly && (
        <div className="text-xs text-red-600 mt-2 italic">
          (this is in read-only storage, not the heap)
        </div>
      )}
    </div>
  );
};

const PrimitiveRenderer: React.FC<{
  prim: CppPrimitiveVariableType | CppCharVariableType | CppPointerVariableType;
}> = ({ prim }) => (
  <div className="p-2">
    <div className="flex flex-col gap-1 items-start">
      <div className="text-xs font-mono text-gray-600">
        {(prim as any).type}
      </div>
      <div className="font-semibold text-sm">{String(prim.value)}</div>
    </div>
  </div>
);

/** *************************************************************
 * Main component                                                *
 ***************************************************************/
interface HeapVariableData extends Record<string, any> {
  heap: ReturnType<typeof CppUtils.cppConvertHeap>;
}
export type HeapNodeType = Node<HeapVariableData>;

export const HeapNode: React.FC<NodeProps<HeapNodeType>> = ({ data, id }) => {
  const { value: variable, kind: heapKind } = data.heap;
  const { showMemory } = useSettingsContext();
  const isReadOnly = heapKind === "readonly_memory";

  // Palette & classes -------------------------------------------------------
  const colour = useMemo(() => {
    if (isReadOnly) return "green";
    if (variable.kind === "C_ARRAY") return "yellow";
    if (variable.kind === "C_STRUCT") return "purple";
    return "blue"; // primitives / default
  }, [isReadOnly, variable.kind]);
  const cls = useMemo(() => buildClasses(colour), [colour]);

  // Body renderer -----------------------------------------------------------
  const body = useMemo(() => {
    switch (variable.kind) {
      case "C_ARRAY":
        return (
          <ArrayRenderer
            arr={variable as CppArrayVariableType<any>}
            id={id}
            elemCls={cls.elem}
            isReadOnly={isReadOnly}
          />
        );
      default:
        return <PrimitiveRenderer prim={variable as any} />;
    }
  }, [variable, id, cls.elem, isReadOnly]);

  /** ********************************************************************* */
  return (
    <div className={cls.container} style={{ zIndex: 1 }}>
      {/* Header ----------------------------------------------------------- */}
      <div className={cls.header}>
        <div className="flex justify-between items-center">
          <span>{data.label}</span>
          {/* Invisible target so external pointers can link to the node */}
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-input`}
            className="!w-0 !h-0 !opacity-0"
            style={{ left: -6, zIndex: 1001 }}
          />
        </div>
        {showMemory && <div className="text-xs font-mono">{data.address}</div>}
      </div>

      {/* Body ------------------------------------------------------------- */}
      {body}
    </div>
  );
};
