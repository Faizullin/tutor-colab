import { Project, ProjectFile } from "@/generated/prisma";

export interface StorageContentData {
  project: {
    id: Project["id"];
    name: Project["name"];
    files: Array<{
      id?: ProjectFile["id"];
      name: ProjectFile["name"];
      content: ProjectFile["content"];
      language: ProjectFile["language"];
    }>;
  };
}

export class EditorStorageService {
  static getStorageData(): StorageContentData | null {
    const data = localStorage.getItem("editorData");
    if (!data) return null;
    return JSON.parse(data);
  }
  static setStorageData(data: StorageContentData): void {
    localStorage.setItem("editorData", JSON.stringify(data));
  }
  //   static createDemoProject(): StorageContentData {
  //     const demoProject: StorageContentData = {
  //       project: {
  //         name: "Demo Project",
  //         files: [],
  //         content: "",
  //       },
  //     };
  //     return demoProject;
  //   }
}
