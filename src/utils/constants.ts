import { SupportedLanguage } from './editor-config';

export const languageOptions = [
  { label: "JavaScript", value: "javascript" as SupportedLanguage, icon: "js" },
  { label: "Python", value: "python" as SupportedLanguage, icon: "py" },
  { label: "C++", value: "cpp" as SupportedLanguage, icon: "cpp" },
  { label: "Java", value: "java" as SupportedLanguage, icon: "java" },
  { label: "C", value: "c" as SupportedLanguage, icon: "c" },
  { label: "TypeScript", value: "typescript" as SupportedLanguage, icon: "ts" },
];

export const initialFiles = {
  name: "project",
  type: "folder" as const,
  expanded: true,
  children: [
    {
      name: "src",
      type: "folder" as const,
      expanded: true,
      children: [
        { name: "main.js", type: "file" as const, language: "javascript" },
        { name: "styles.css", type: "file" as const, language: "css" },
      ],
    },
    {
      name: "public",
      type: "folder" as const,
      expanded: false,
      children: [
        { name: "index.html", type: "file" as const, language: "html" },
      ],
    },
  ],
};