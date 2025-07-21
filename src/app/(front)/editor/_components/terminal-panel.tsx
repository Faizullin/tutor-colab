import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Copy, Maximize2, Terminal, XCircle } from "lucide-react";
import { useState } from "react";

interface TerminalPanelProps {
  output: string;
  status: "idle" | "success" | "error";
}

export default function TerminalPanel({ output, status }: TerminalPanelProps) {
  const [maximized, setMaximized] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  // const clearOutput = () => {
  //   // Implement through a callback from parent component
  //   console.log("Clear output requested");
  // };

  return (
    <div
      className={`h-full bg-[#1e1e1e] flex flex-col ${
        maximized ? "fixed inset-0 z-50" : ""
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-[#252525]">
        <Terminal className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-medium text-gray-300">OUTPUT</h3>
        {status === "success" && (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />
        )}
        {status === "error" && (
          <XCircle className="w-4 h-4 text-red-400 ml-2" />
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-emerald-400 hover:bg-[#2a2a2a] transition-colors"
            onClick={copyToClipboard}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-emerald-400 hover:bg-[#2a2a2a] transition-colors"
            onClick={() => setMaximized(!maximized)}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3 font-mono text-sm">
        {output ? (
          <pre
            className={`whitespace-pre-wrap ${
              status === "error"
                ? "text-red-400"
                : status === "success"
                ? "text-emerald-400"
                : "text-gray-300"
            }`}
          >
            {output}
          </pre>
        ) : (
          <div className="text-gray-500 italic">
            No output yet. Run your code to see results.
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
