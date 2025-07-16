import { TraceStep } from "../../base/types";
import {
  CppArrayVariableType,
  CppCharVariableType,
  CppGeneralVariableType,
  CppHeapType,
  CppPointerVariableType,
  CppPrimitiveVariableType,
  CppStructVariableType,
  HexAddress,
} from "./types";

const cppConvert = (data: any) => {
  const [kind, address, ...props] = data;
  if (kind === "C_DATA") {
    const [type, value, metadata] = props;
    if (type === "pointer") {
      const res: CppPointerVariableType = {
        kind,
        address,
        type,
        value,
        metadata: {
          bytes: metadata.bytes,
          target_type: metadata.target_type,
        },
      };
      return res;
    } else if (type === "char") {
      if (value === "<UNINITIALIZED>") {
        const res: CppCharVariableType = {
          kind,
          address,
          type,
          value: "<UNINITIALIZED>",
          metadata: {
            bytes: 1,
          },
        };
        return res;
      } else {
        const res: CppCharVariableType = {
          kind,
          address,
          type,
          value,
          metadata: {
            bytes: 1,
            hex: metadata.hex,
          },
        };
        return res;
      }
    } else {
      if (value === "<UNINITIALIZED>") {
        const res: CppPrimitiveVariableType = {
          kind,
          address,
          type,
          value: "<UNINITIALIZED>",
          metadata: {
            bytes: metadata.bytes,
          },
        };
        return res;
      } else {
        const res: CppPrimitiveVariableType = {
          kind,
          address,
          type,
          value,
          metadata: {
            bytes: metadata.bytes,
            hex: metadata.hex,
          },
        };
        return res;
      }
    }
  } else if (kind === "C_STRUCT") {
    const [metadata, ...values] = props;
    const objects = values.map((value: any) => {
      const [variableName, variableData] = value;
      return {
        variableName,
        value: cppConvert(variableData),
      };
    });
    const res: CppStructVariableType = {
      kind,
      address,
      metadata: {
        bytes: metadata.bytes,
        name: metadata.name,
      },
      objects,
    };
    return res;
  } else if (kind === "C_ARRAY") {
    const [metadata, ...values] = props;
    const res: CppArrayVariableType<CppGeneralVariableType> = {
      kind,
      address,
      metadata: {
        elt_bytes: metadata.elt_bytes,
        heap_block: metadata.heap_block || false,
        oob_addr: metadata.oob_addr,
      },
      value: values.map(cppConvert),
    };
    return res;
  }
  throw new Error(`Unknown C++ variable kind: ${kind}`);
};

const cppConvertHeap = (data: any) => {
  if (typeof data === "object" && data.constructor === Object) {
    if (data.kind && data.kind === "readonly_memory") {
      const res: CppHeapType<CppGeneralVariableType> = {
        kind: data.kind,
        value: cppConvert(data.val),
      };
      return res;
    }
    throw new Error(`Unknown C++ heap kind: ${data.kind}`);
  } else if (Array.isArray(data)) {
    const res: CppHeapType<CppGeneralVariableType> = {
      kind: "simple",
      value: cppConvert(data),
    };
    return res;
  }
  throw new Error(`Unknown C++ heap structure: ${JSON.stringify(data)}`);
};

/**
 * Convenience test for a pointer variable.
 */
function isPointer(v: CppGeneralVariableType): v is CppPointerVariableType {
  return (
    v.kind === "C_DATA" && (v as CppPointerVariableType).type === "pointer"
  );
}

class CppUtils {
  static cppConvert = cppConvert;
  static cppConvertHeap = cppConvertHeap;
  static isPointer = isPointer;
  static isArray = (
    v: CppGeneralVariableType
  ): v is CppArrayVariableType<any> => v.kind === "C_ARRAY";

  static getHeapNodeId(heap: CppHeapType<CppGeneralVariableType>) {
    return `heap-${heap.value.address}`;
  }
  static getFrameNodeId(frame: TraceStep["stack_to_render"][number]) {
    return `frame-${frame.frame_id}`;
  }
  static getVariableNodeId(variable: CppGeneralVariableType | HexAddress) {
    if (typeof variable === "string") {
      return `var-${variable}`;
    }
    return `var-${variable.address}`;
  }
}

export default CppUtils;
