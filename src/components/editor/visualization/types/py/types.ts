type PyVariableBaseType = object;
export type PyRefAddress = `${number}`;

export interface PyVariableWrapperType {
  variableName: string;
  value: PyGlobalReferenceVariableType | PyGlobalPrimitiveVariableType;
}

export interface PyGlobalPrimitiveVariableType extends PyVariableBaseType {
  type: "PRIMITIVE";
  value: string | number | null;
}

export interface PyGlobalReferenceVariableType extends PyVariableBaseType {
  type: "REF";
  ref: PyRefAddress;
}

export interface PyHeapClassVariableType extends PyVariableBaseType {
  type: "CLASS";
  refAddress: PyRefAddress;
  name: string;
  extendedClassNames: Array<string>;
  fields: Array<PyVariableWrapperType>;
}

export interface PyHeapFunctionVariableType extends PyVariableBaseType {
  type: "FUNCTION";
  refAddress: PyRefAddress;
  name: string;
}

export interface PyHeapInstanceVariableType extends PyVariableBaseType {
  type: "INSTANCE";
  refAddress: PyRefAddress;
  className: string;
  fields: Array<PyVariableWrapperType>;
}

export interface PyHeapArrayVariableType extends PyVariableBaseType {
  type: "COLLECTION";
  refAddress: PyRefAddress;
  collectionType: "ARRAY" | "LIST" | "TUPLE" | "DICT" | "SET";
  fields: Array<{
    key: string | number;
    value: PyGlobalPrimitiveVariableType | PyGlobalReferenceVariableType;
  }>;
}

export type PyGeneralVariableType =
  | PyGlobalPrimitiveVariableType
  | PyGlobalReferenceVariableType
  | PyHeapClassVariableType
  | PyHeapFunctionVariableType
  | PyHeapInstanceVariableType
  | PyHeapArrayVariableType;
