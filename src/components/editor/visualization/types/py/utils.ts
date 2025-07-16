import { TraceStep } from "../../base/types";
import {
  PyGeneralVariableType,
  PyGlobalPrimitiveVariableType,
  PyGlobalReferenceVariableType,
  PyHeapArrayVariableType,
  PyHeapClassVariableType,
  PyHeapFunctionVariableType,
  PyHeapInstanceVariableType,
  PyRefAddress,
} from "./types";

const convertPrimiviteOrReference = (
  data: any
): PyGlobalPrimitiveVariableType | PyGlobalReferenceVariableType => {
  if (data === undefined) {
    throw new Error("Invalid Python variable type: undefined");
  } else if (
    ["string", "number", "boolean"].includes(typeof data) ||
    data === null
  ) {
    if (data === null) {
      return {
        value: null,
        type: "PRIMITIVE",
      };
    } else {
      return {
        value: data,
        type: "PRIMITIVE",
      };
    }
  } else if (Array.isArray(data)) {
    if (data.length === 2 && data[0] === "REF") {
      return {
        ref: data[1],
        type: "REF",
      };
    }
  }
  throw new Error(`Unknown Python variable type: ${data.type}`);
};

const pyConvert = (
  data: any,
  meta?: {
    refAddress: PyRefAddress;
    key?: string;
  }
) => {
  try {
    return convertPrimiviteOrReference(data);
  } catch {}
  if (data.length >= 2 && data[0] === "CLASS") {
    if (!meta) {
      throw new Error("Meta information is required for CLASS type");
    }
    const res: PyHeapClassVariableType = {
      type: "CLASS",
      refAddress: meta.refAddress,
      name: data[1],
      extendedClassNames: data[2],
      fields: data.slice(3).map((field: any) => {
        const res: PyHeapClassVariableType["fields"][number] = {
          variableName: field[0],
          value: convertPrimiviteOrReference(field[1]),
        };
        return res;
      }),
    };
    return res;
  } else if (data.length >= 2 && data[0] === "FUNCTION") {
    if (!meta) {
      throw new Error("Meta information is required for FUNCTION type");
    }
    const res: PyHeapFunctionVariableType = {
      type: "FUNCTION",
      refAddress: meta.refAddress,
      name: data[1],
    };
    return res;
  } else if (data.length >= 2 && data[0] === "INSTANCE") {
    if (!meta) {
      throw new Error("Meta information is required for INSTANCE type");
    }
    const res: PyHeapInstanceVariableType = {
      type: "INSTANCE",
      refAddress: meta.refAddress,
      className: data[1],
      fields: data.slice(2).map((field: any) => {
        const res: PyHeapInstanceVariableType["fields"][number] = {
          variableName: field[0],
          value: convertPrimiviteOrReference(field[1]),
        };
        return res;
      }),
    };
    return res;
  } else if (
    data.length >= 1 &&
    ["ARRAY", "LIST", "TUPLE", "DICT", "SET"].includes(data[0])
  ) {
    if (!meta) {
      throw new Error("Meta information is required for COLLECTION type");
    }
    const res: PyHeapArrayVariableType = {
      type: "COLLECTION",
      refAddress: meta.refAddress,
      collectionType: data[0],
      fields: data.slice(1).map((element: any, index: number) => {
        const res: PyHeapArrayVariableType["fields"][number] = {
          key: index,
          value: convertPrimiviteOrReference(element),
        };
        return res;
      }),
    };
    return res;
  } else if (meta?.key === "__return__") {
    return convertPrimiviteOrReference(data);
  }
  throw new Error(`Unknown Python variable type: ${data}`);
};

/**
 * Convenience test for a reference variable.
 */
function isReference(
  v: PyGlobalReferenceVariableType | PyGlobalPrimitiveVariableType
): v is PyGlobalReferenceVariableType {
  return v.hasOwnProperty("ref");
}

class PyUtils {
  static pyConvert = pyConvert;
  static isPointer = isReference;

  static getFrameNodeId(frame: TraceStep["stack_to_render"][number] | string) {
    if (typeof frame === "string") {
      return `frame-${frame}`;
    }
    return `frame-${frame.frame_id}`;
  }
  static getVariableNodeId(variable: PyGeneralVariableType | string) {
    if (typeof variable === "string") {
      return `var-${variable}`;
    } else if (variable.type === "REF") {
      throw new Error("Cannot get node ID for reference variable");
    } else if (variable.type === "PRIMITIVE") {
      throw new Error("Cannot get node ID for primitive variable");
    }

    return `var-${variable.refAddress}`;
  }
}

export default PyUtils;
