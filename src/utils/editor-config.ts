export type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java' | 'c' | 'typescript';

export const defaultEditorOptions = {
  monaco: {
    fontSize: 16,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    lineNumbers: "on",
    roundedSelection: true,
    renderLineHighlight: "all",
    fontFamily: "monospace",
  },
  snippets: {
    javascript: "console.log('Hello, World!');",
    python: "print('Hello, World!')",
    cpp: "#include <iostream>\nusing namespace std;\nint main() {\n  cout << \"Hello, World!\";\n  return 0;\n}",
    java: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}",
    c: "#include <stdio.h>\nint main() {\n  printf(\"Hello, World!\\n\");\n  return 0;\n}",
    typescript: "console.log('Hello, World!');",
  } as Record<SupportedLanguage, string>,
} as const;