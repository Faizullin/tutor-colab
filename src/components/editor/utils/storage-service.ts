import { ExecutionTrace } from "../visualization/base/types";

const STORAGE_KEY = "editor_storage";

type StorageServiceDataType = ExecutionTrace & {
  status: "success" | "error";
  savedAt: Date;
};

export default class EditorStorageService {
  static getItem(): StorageServiceDataType | null {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  }

  static setItem(value: StorageServiceDataType) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }

  static removeItem() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
