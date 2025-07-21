import { useAIStore } from "@/store/useAIStore";
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  MessageSquareCode,
  AlertCircle,
  ArrowLeft,
  Eye,
  LogIn,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSession, signIn } from "next-auth/react";

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}
function AiButton() {
  const { data: session } = useSession();
  const { code } = useAIStore();
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [hasResponse, setHasResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isDailyLimitExceeded, setIsDailyLimitExceeded] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const outputPanelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  // Determine max conversations based on user status
  const MAX_CONVERSATIONS = session?.user ? 5 : 2;

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        x: rect.left,
        y: rect.top,
      });
    }
  }, [isOpen]);

  // Close the panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !showOutputPanel
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOutputPanel]);

  const handleAISuggestion = async () => {
    if (!session?.user) {
      await signIn();
      return;
    }

    if (!userPrompt.trim()) return;

    // Check conversation limit
    if (conversationCount >= MAX_CONVERSATIONS) {
      setIsDailyLimitExceeded(true);
      return;
    }

    setIsLoading(true);
    setAiResponse("");
    setError(null);
    setIsRateLimited(false);
    setShowOutputPanel(true);

    try {
      // Check if code is available from the store
      if (!code) {
        throw new Error("No code available to analyze");
      }

      const response = await fetch("/api/ai-helper/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          prompt: userPrompt,
          isGuest: !session?.user,
        }),
      });

      // Check for rate limits
      if (response.status === 429) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || "Rate limit exceeded.";

        // Check if this is the daily limit
        if (
          errorMessage.includes("daily limit") ||
          errorMessage.includes("limit")
        ) {
          setIsDailyLimitExceeded(true);
          throw new Error(errorMessage);
        } else {
          // This is the hourly rate limit
          setIsRateLimited(true);
          throw new Error(
            "Rate limit exceeded. Please try again after 1 hour."
          );
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          setAiResponse(fullResponse);
        }
      } catch (streamError) {
        console.error("Streaming error:", streamError);
        if (fullResponse) {
          console.warn(
            "Stream ended unexpectedly, but partial response available"
          );
        } else {
          throw new Error("Failed while reading response stream");
        }
      }

      // Finalize the decoding
      const finalChunk = decoder.decode();
      if (finalChunk) {
        fullResponse += finalChunk;
        setAiResponse(fullResponse);
      }

      // Increment conversation count
      setConversationCount((prev) => prev + 1);

      // Set flag indicating we have a response to view
      setHasResponse(true);
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      setError(error.message || "Something went wrong with the AI response.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, index: number | string) => {
    navigator.clipboard.writeText(code);

    setCopiedStates((prev) => ({ ...prev, [index]: true }));

    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const closeOutputPanel = () => {
    setShowOutputPanel(false);
  };

  const openOutputPanel = () => {
    setShowOutputPanel(true);
  };

  // Fix for the "p is descendant" issue - this function checks if a node is a block element
  const isBlockElement = (child: React.ReactNode): boolean => {
    if (!React.isValidElement(child)) return false;

    const element = child as React.ReactElement;
    const elementType = element.type as any;

    // Get the type name correctly
    let typeName: string;
    if (typeof elementType === "string") {
      typeName = elementType.toLowerCase();
    } else if (elementType && typeof elementType === "function") {
      typeName = (
        elementType.displayName ||
        elementType.name ||
        ""
      ).toLowerCase();
    } else {
      return false;
    }

    // Check if it's a block element
    return [
      "div",
      "pre",
      "table",
      "ul",
      "ol",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ].includes(typeName);
  };

  // Helper function to detect if children array contains any block elements
  const containsBlockElements = (children: React.ReactNode) => {
    return React.Children.toArray(children).some(isBlockElement);
  };

  return (
    <>
      {/* AI Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1 rounded text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition"
        aria-label="AI Code Assistant"
      >
        <MessageSquareCode size={16} className="mr-1" />
        <span>AI</span>
      </button>

      {/* AI Assistant Input Panel */}
      {isOpen && !showOutputPanel && (
        <div
          ref={panelRef}
          className="fixed shadow-lg rounded-lg bg-gray-900 border border-gray-800"
          style={{
            top: `${buttonPosition.y + 40}px`,
            right: "20px",
            width: "380px",
            maxWidth: "90vw",
            zIndex: 40,
          }}
        >
          <div className="p-3">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
              <h3 className="text-md font-medium text-gray-200">
                AI Code Assistant
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rate Limit Alert */}
            {isDailyLimitExceeded && (
              <div className="mb-3 p-2 bg-orange-900 border border-orange-800 rounded flex items-start">
                <AlertCircle
                  size={16}
                  className="text-orange-400 mt-0.5 mr-2 flex-shrink-0"
                />
                <div className="text-sm text-orange-300">
                  <p className="font-medium">Daily limit exceeded</p>
                  <p>
                    You&apos;ve reached your daily limit of 30 requests. Please
                    try again tomorrow.
                  </p>
                </div>
              </div>
            )}

            {/* Guest Login Prompt */}
            {!session?.user && (
              <div className="mb-3 p-3 bg-[#111827] border border-[#111827] rounded flex items-center">
                <LogIn size={20} className="text-blue-400 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium">Login Required</p>
                  <p className="mb-2">
                    Please sign in to use the AI Code Assistant
                  </p>
                  <button
                    onClick={() => signIn()}
                    className="px-3 py-1 bg-[#32bd8a] hover:bg-[#32bd8a] text-white rounded text-xs transition"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}

            {/* Input Area - Only show for logged-in users */}
            {session?.user && (
              <>
                <div className="mb-3">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Enter your request about the code..."
                    className="w-full p-2 text-sm border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-800 text-gray-200 resize-none"
                    rows={3}
                    disabled={isRateLimited || isDailyLimitExceeded}
                  />

                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={handleAISuggestion}
                      disabled={
                        isLoading ||
                        !userPrompt.trim() ||
                        isRateLimited ||
                        isDailyLimitExceeded
                      }
                      className={`flex-1 p-2 text-sm rounded transition ${
                        isLoading ||
                        !userPrompt.trim() ||
                        isRateLimited ||
                        isDailyLimitExceeded
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-emerald-500 text-white hover:bg-emerald-600"
                      }`}
                    >
                      {isLoading
                        ? "Generating..."
                        : isRateLimited
                        ? "Rate Limited"
                        : isDailyLimitExceeded
                        ? "Daily Limit Exceeded"
                        : "Ask AI"}
                    </button>

                    {/* View Previous Response Button */}
                    {hasResponse && (
                      <button
                        onClick={openOutputPanel}
                        className="p-2 rounded bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-emerald-700 transition flex items-center"
                        title="View Previous Response"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Previous Response Indicator */}
                {hasResponse && (
                  <div className="text-center mt-2 mb-1">
                    <button
                      onClick={openOutputPanel}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-center w-full"
                    >
                      <Eye size={12} className="mr-1" />
                      <span>View previous AI response</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Output Panel (Separate full-screen panel) */}
      {showOutputPanel && (
        <div
          ref={outputPanelRef}
          className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50"
        >
          <div className="w-full max-w-4xl h-3/4 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div className="flex items-center">
                <button
                  onClick={closeOutputPanel}
                  className="p-2 mr-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300"
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-lg font-semibold text-white">
                  AI Response
                </h2>
              </div>
              <div className="text-sm text-gray-400">
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">
                  {isLoading ? "Generating..." : "Response"}
                </span>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 shadow-inner">
                {error && !isRateLimited && !isDailyLimitExceeded ? (
                  <div className="p-4 rounded-lg bg-red-900/30 border border-red-800">
                    <p className="text-red-400">{error}</p>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-pulse text-emerald-400">
                      Generating response...
                    </div>
                  </div>
                ) : aiResponse ? (
                  <div className="text-gray-200 markdown-content">
                    <ReactMarkdown
                      components={{
                        code({
                          inline,
                          className,
                          children,
                          ...props
                        }: CodeProps) {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeString = String(children).replace(
                            /\n$/,
                            ""
                          );

                          // For inline code, just return a simple code tag without divs
                          if (inline) {
                            return (
                              <code
                                className="bg-gray-700 px-1 py-0.5 rounded text-emerald-300"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }

                          // For code blocks (not inline)
                          const language = match ? match[1] : "text";
                          const codeIndex = `block-${
                            Object.keys(copiedStates).length
                          }`;

                          return (
                            <div className="relative rounded-lg overflow-hidden my-4 border border-gray-700">
                              <div className="flex justify-between items-center py-2 px-3 bg-gray-700 text-gray-200 text-xs">
                                <span className="font-mono">{language}</span>
                                <button
                                  onClick={() =>
                                    handleCopyCode(codeString, codeIndex)
                                  }
                                  className="text-gray-300 hover:text-emerald-400 p-1 rounded"
                                  aria-label="Copy code"
                                >
                                  {copiedStates[codeIndex] ? (
                                    <Check
                                      size={16}
                                      className="text-emerald-400"
                                    />
                                  ) : (
                                    <Copy size={16} />
                                  )}
                                </button>
                              </div>
                              <SyntaxHighlighter
                                style={coldarkDark}
                                language={language}
                                customStyle={{
                                  margin: 0,
                                  borderRadius: "0 0 6px 6px",
                                  fontSize: "0.9rem",
                                  backgroundColor: "#1a1a1a",
                                }}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          );
                        },
                        // Fixed p component to properly handle block elements
                        p({ children }) {
                          // If children contain block elements, render as fragment
                          return containsBlockElements(children) ? (
                            <>{children}</>
                          ) : (
                            <p className="my-3 leading-relaxed">{children}</p>
                          );
                        },
                        ul({ children }) {
                          return (
                            <ul className="list-disc pl-5 my-4 space-y-1">
                              {children}
                            </ul>
                          );
                        },
                        ol({ children }) {
                          return (
                            <ol className="list-decimal pl-5 my-4 space-y-1">
                              {children}
                            </ol>
                          );
                        },
                        li({ children }) {
                          return containsBlockElements(children) ? (
                            <li className="mb-2">
                              <>{children}</>
                            </li>
                          ) : (
                            <li className="mb-2">{children}</li>
                          );
                        },
                        h1({ children }) {
                          return (
                            <h1 className="text-xl font-bold my-4 text-emerald-400">
                              {children}
                            </h1>
                          );
                        },
                        h2({ children }) {
                          return (
                            <h2 className="text-lg font-bold my-3 text-emerald-400">
                              {children}
                            </h2>
                          );
                        },
                        h3({ children }) {
                          return (
                            <h3 className="text-md font-bold my-3 text-emerald-300">
                              {children}
                            </h3>
                          );
                        },
                        pre({ children }) {
                          return <>{children}</>;
                        },
                      }}
                    >
                      {aiResponse}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-500">
                      No response yet. Please wait while the AI processes your
                      request.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 flex justify-between">
              <button
                onClick={closeOutputPanel}
                className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
              >
                Back
              </button>
              {aiResponse && (
                <button
                  onClick={() => handleCopyCode(aiResponse, "full-response")}
                  className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white flex items-center transition"
                >
                  {copiedStates["full-response"] ? (
                    <>
                      <Check size={16} className="mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-1" />
                      Copy All
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AiButton;
