import { Dispatch, SetStateAction, useEffect } from "react";
import { useProjectEditor } from "./context";
import { EditProjectFile } from "./types";

interface DemoContainerProps {
  files: EditProjectFile[];
  setFiles: Dispatch<SetStateAction<EditProjectFile[]>>;
}

export const DemoContainer = ({ setFiles }: DemoContainerProps) => {
  const { demo, setCurrentEditProjectFileUid } = useProjectEditor();
  useEffect(() => {
    if (demo) {
      setFiles([
        {
          uid: "cpp-demo1",
          synced: false,
          file: {
            id: -1,
            name: "demo.cpp",
            language: "cpp",
            content: `
#include <iostream>
using namespace std;
int main() {
    int a = 5;
    int b = 10;
    int sum = a + b;
    cout << "Sum: " << sum << endl;
    return 0;
}`,
          },
        },
      ]);
      setCurrentEditProjectFileUid("cpp-demo1");
    }
  }, [demo, setCurrentEditProjectFileUid, setFiles]);
  return null;
};
