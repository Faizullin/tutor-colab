import { SupportedLanguage } from "@/utils/editor-config";

interface StorageContentData {
    project: {
        id: string;
        name: string;
        files: Array<{
            name: string;
            content: string;
            language: SupportedLanguage;
        }>;
    }
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
    static createDemoProject(): StorageContentData {
        const demoProject: StorageContentData = {
            project: {
                id: "demo-project",
                name: "Demo Project",
                files: []
            }
        };
        return demoProject;
    }
}
