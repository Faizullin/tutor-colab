"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAuthStore from "@/store/userAuthStore";
import { CheckIcon, LightbulbIcon, XIcon } from "lucide-react";
import {
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
// import ReactMarkdown from "react-markdown";

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

interface CodeSuggestionProps {
  code: string;
  onApplySuggestion: (suggestion: string) => void;
  editorRef: React.RefObject<any>;
  isEnabled: boolean;
}

export interface CodeSuggestionRef {
  forceFetchSuggestions: () => void;
}

const CodeSuggestion = forwardRef<CodeSuggestionRef, CodeSuggestionProps>(
  ({ code, onApplySuggestion, editorRef, isEnabled }, ref) => {
    const [suggestions, setSuggestions] = useState("");
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    const forceFetchSuggestions = () => {
      if (!user) {
        setShowLoginAlert(true);
        return;
      }

      if (isEnabled && code && code.trim().length >= 10) {
        fetchCodeSuggestions(code);
      }
    };

    useImperativeHandle(ref, () => ({
      forceFetchSuggestions,
    }));

    const fetchCodeSuggestions = async (code: string) => {
      if (!user) {
        setShowLoginAlert(true);
        return;
      }

      if (!isEnabled || !code || code.trim().length < 10) return;

      try {
        setIsFetchingSuggestions(true);

        const response = await fetch("/api/ai-helper/code-suggestion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ codeSnippet: code }),
        });

        if (response.status === 401) {
          setShowLoginAlert(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to get suggestions");
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        let accumulatedSuggestions = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          accumulatedSuggestions += text;
          setSuggestions(accumulatedSuggestions);

          if (accumulatedSuggestions.trim().length > 0) {
            setShowSuggestions(true);
          }
        }
      } catch (error) {
        console.error("Error fetching code suggestions:", error);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };

    const extractCodeFromMarkdown = (markdown: string) => {
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
      let match;
      let extractedCode = "";

      while ((match = codeBlockRegex.exec(markdown)) !== null) {
        extractedCode += match[1] + "\n\n";
      }

      return extractedCode.trim() || markdown;
    };

    const applySuggestion = () => {
      if (!user) {
        setShowLoginAlert(true);
        return;
      }

      if (editorRef.current && suggestions) {
        const extractedCode = extractCodeFromMarkdown(suggestions);
        onApplySuggestion(extractedCode);

        setSuggestions("");
        setShowSuggestions(false);
      }
    };

    return (
      <>
        {showLoginAlert && (
          <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Login Required</AlertDialogTitle>
                <AlertDialogDescription>
                  Please log in to use AI code suggestions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => (window.location.href = "/auth/login")}
                >
                  Login
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {showSuggestions && suggestions && (
          <div className="absolute bottom-4 right-4 w-2/3 max-w-xl bg-[#252525] border border-gray-700 rounded-lg shadow-lg z-20 flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between bg-[#2d2d2d] px-4 py-3 border-b border-gray-700 rounded-t-lg">
              <div className="flex items-center">
                <LightbulbIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-200">
                  AI Suggestions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs bg-emerald-900/30 hover:bg-emerald-800/50 border-emerald-700 text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  onClick={applySuggestion}
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 hover:bg-[#3a3a3a] text-gray-400 hover:text-gray-300"
                  onClick={() => setShowSuggestions(false)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea
              ref={scrollAreaRef}
              className="flex-grow overflow-y-auto p-0"
              style={{ maxHeight: "calc(70vh - 50px)" }}
            >
              <div className="p-4">
                <div className="text-sm text-gray-300 prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code({
                        inline,
                        className,
                        children,
                        ...props
                      }: CodeProps) {
                        const language = className
                          ? className.replace("language-", "")
                          : "";

                        if (inline) {
                          return (
                            <code
                              className="bg-gray-800 px-1 py-0.5 rounded text-gray-200"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }

                        return (
                          <div className="bg-gray-800 rounded-md my-3 overflow-hidden">
                            {language && (
                              <div className="bg-gray-700 px-4 py-1 text-xs text-gray-300 font-mono border-b border-gray-600">
                                {language}
                              </div>
                            )}
                            <div className="p-3 overflow-x-auto">
                              <code
                                className="text-gray-200 font-mono text-xs leading-relaxed"
                                {...props}
                              >
                                {children}
                              </code>
                            </div>
                          </div>
                        );
                      },
                      pre({ children }) {
                        return <>{children}</>;
                      },
                      p({ children }) {
                        return (
                          <p className="mb-3 leading-relaxed">{children}</p>
                        );
                      },
                      h1({ children }) {
                        return (
                          <h1 className="text-lg font-bold my-3 text-gray-100 border-b border-gray-700 pb-1">
                            {children}
                          </h1>
                        );
                      },
                      h2({ children }) {
                        return (
                          <h2 className="text-base font-bold my-3 text-gray-100">
                            {children}
                          </h2>
                        );
                      },
                      h3({ children }) {
                        return (
                          <h3 className="text-sm font-bold my-2 text-gray-200">
                            {children}
                          </h3>
                        );
                      },
                      ul({ children }) {
                        return (
                          <ul className="list-disc pl-5 mb-3 space-y-1">
                            {children}
                          </ul>
                        );
                      },
                      ol({ children }) {
                        return (
                          <ol className="list-decimal pl-5 mb-3 space-y-1">
                            {children}
                          </ol>
                        );
                      },
                      li({ children }) {
                        return <li className="mb-1">{children}</li>;
                      },
                      blockquote({ children }) {
                        return (
                          <blockquote className="border-l-2 border-gray-500 pl-3 italic text-gray-400 my-3">
                            {children}
                          </blockquote>
                        );
                      },
                      a({ children, href }) {
                        return (
                          <a
                            href={href}
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            {children}
                          </a>
                        );
                      },
                      strong({ children }) {
                        return (
                          <strong className="font-bold text-gray-200">
                            {children}
                          </strong>
                        );
                      },
                      table({ children }) {
                        return (
                          <div className="overflow-x-auto my-3">
                            <table className="min-w-full border border-gray-700">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      th({ children }) {
                        return (
                          <th className="bg-gray-700 border border-gray-600 px-3 py-2 text-left text-xs font-medium">
                            {children}
                          </th>
                        );
                      },
                      td({ children }) {
                        return (
                          <td className="border border-gray-700 px-3 py-2 text-xs">
                            {children}
                          </td>
                        );
                      },
                    }}
                  >
                    {suggestions}
                  </ReactMarkdown>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {isFetchingSuggestions && !showSuggestions && isEnabled && (
          <div className="absolute bottom-4 right-4 bg-[#252525] border border-gray-700 rounded-lg shadow-lg p-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full mr-2"></div>
            <span className="text-xs">Generating suggestions...</span>
          </div>
        )}
      </>
    );
  }
);

CodeSuggestion.displayName = "CodeSuggestion";

export default CodeSuggestion;

export const forceSuggestionFetch = (
  ref: React.RefObject<CodeSuggestionRef>
) => {
  if (ref.current && typeof ref.current.forceFetchSuggestions === "function") {
    ref.current.forceFetchSuggestions();
  }
};
