import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import React from "react";
import {
  PyGeneralVariableType,
  PyGlobalPrimitiveVariableType,
  PyGlobalReferenceVariableType,
  PyHeapArrayVariableType,
  PyRefAddress,
} from "../types";
import PyUtils from "../utils";

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


const ElementHandleMap = {
  Source: ({
    address
  }: {
    address: PyRefAddress;
  }) => {
    const handleBase = PyUtils.getVariableNodeId(address);
    return <ElemHandle anchorId={handleBase} position={Position.Left} />;
  },
  Target: ({
    address
  }: {
    address: PyRefAddress;
  }) => {
    const handleBase = PyUtils.getVariableNodeId(address);
    return <ElemHandle anchorId={handleBase} position={Position.Right} isSource={true} />;
  },
}


const ArrayItemCard = ({
  value,
}: {
  value: PyGlobalReferenceVariableType | PyGlobalPrimitiveVariableType;
}) => {
  const isPtr = PyUtils.isPointer(value);
  const ptrVal = isPtr ? (value as PyGlobalReferenceVariableType).ref : null;

  return (
    <div className="p-1 text-center relative">
      {
        isPtr && (
          <ElementHandleMap.Source address={value.ref} />
        )
      }

      <div className="font-semibold text-sm">
        {isPtr ? ptrVal : String(value)}
      </div>

      {isPtr && ptrVal && (
        <ElementHandleMap.Target address={value.ref} />
      )}
    </div>
  );
}
const ArrayRenderer: React.FC<{
  value: PyHeapArrayVariableType;
}> = ({ value }) => {
  return (
    <div className="p-2">
      <div className="grid grid-cols-3 gap-1">
        {value.fields.map((el, idx) => (
          <ArrayItemCard key={idx} value={el.value} />
        ))}
      </div>
    </div>
  );
};

const PrimitiveRenderer: React.FC<{
  value: PyGlobalPrimitiveVariableType;
}> = ({ value }) => (
  <div className="p-2">
    <div className="flex flex-col gap-1 items-start">
      <div className="font-semibold text-sm">{String(value.value)}</div>
    </div>
  </div>
);

/** *************************************************************
 * Main component                                                *
 ***************************************************************/
interface HeapVariableData extends Record<string, any> {
  heap: PyGeneralVariableType;
}
export type PyHeapNodeType = Node<HeapVariableData>;

export const HeapNode: React.FC<NodeProps<PyHeapNodeType>> = ({ data }) => {
  // Body renderer -----------------------------------------------------------

  const cls = buildClasses("yellow");

  /** ********************************************************************* */
  return (
    <div className={cls.container} style={{ zIndex: 1 }}>
      {/* Header ----------------------------------------------------------- */}
      <div className={cls.header}>
        <div className="flex justify-between items-center">
          <span>{data.label}</span>
          {/* <Handle
            type="target"
            position={Position.Left}
            id={`${id}-input`}
            className="!w-0 !h-0 !opacity-0"
            style={{ left: -6, zIndex: 1001 }}
          /> */}
        </div>
      </div>

      {/* Body ------------------------------------------------------------- */}
      {data.heap.type === "COLLECTION" && <ArrayRenderer value={data.heap} />}
      {data.heap.type === "PRIMITIVE" && <PrimitiveRenderer value={data.heap} />}
      {data.heap.type === "REF" && (
        <div className="text-xs text-slate-500 mt-1">
          Reference to: {data.heap.ref}
        </div>
      )}
      {data.heap.type === "FUNCTION" && (
        <div className="text-xs text-slate-500 mt-1">
          Function reference: {data.heap.refAddress}
        </div>
      )}
      {data.heap.type === "INSTANCE" && (
        <div className="text-xs text-slate-500 mt-1">
          Instance reference: {data.heap.refAddress}
        </div>
      )}
    </div>
  );
};
