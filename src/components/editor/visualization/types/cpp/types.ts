export type HexAddress = `0x${string}`;

interface CppVariableBaseType {
  address: HexAddress;
}

export const UNINITIALIZED = "<UNINITIALIZED>";

export interface CppPrimitiveVariableType extends CppVariableBaseType {
  kind: "C_DATA";
  type: string;
  value: string | number;
  metadata: {
    bytes: number;
    hex?: string;
  };
}

export interface CppCharVariableType extends CppVariableBaseType {
  kind: "C_DATA";
  type: "char";
  value: string | "<UNINITIALIZED>";
  metadata: {
    bytes: 1;
    hex?: string;
  };
}

export interface CppArrayVariableType<
  GenericType extends CppVariableBaseType = CppGeneralVariableType
> extends CppVariableBaseType {
  kind: "C_ARRAY";
  metadata: {
    elt_bytes: number;
    heap_block?: boolean;
    oob_addr: HexAddress;
  };
  value: Array<GenericType>;
}

export interface CppPointerVariableType extends CppVariableBaseType {
  kind: "C_DATA";
  type: "pointer";
  value: HexAddress | "<UNINITIALIZED>";
  metadata: {
    bytes: number;
    target_type: string;
  };
}

export interface CppValueContainerType {
  variableName: string;
  value: CppGeneralVariableType;
}

export interface CppStructVariableType extends CppVariableBaseType {
  kind: "C_STRUCT";
  metadata: {
    bytes: number;
    name: string;
  };
  objects: Array<CppValueContainerType>;
}

export interface CppHeapType<GenericType extends CppVariableBaseType> {
  kind: "readonly_memory" | string;
  value: CppGeneralVariableType<GenericType>;
}

export type CppGeneralVariableType<
  GenericType extends CppVariableBaseType = any
> =
  | CppPrimitiveVariableType
  | CppCharVariableType
  | CppArrayVariableType<GenericType>
  | CppPointerVariableType
  | CppStructVariableType;
