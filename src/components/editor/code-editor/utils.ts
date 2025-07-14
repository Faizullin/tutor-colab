import DefaultCode from "./default-codes";

export const getLanguageForAce = (lang: string) => {
  switch (lang) {
    case "cpp":
    case "c":
      return "c_cpp";
    case "java":
      return "java";
    case "python":
      return "python";
    case "javascript":
      return "javascript";
    default:
      return "c_cpp";
  }
};

export const getDefaultCode = (lang: string) => {
  switch (lang) {
    case "cpp":
      return DefaultCode.cpp;
    default:
      return DefaultCode.cpp; // Fallback to C++
  }
};
