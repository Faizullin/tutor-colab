"use client";

import { AlertCircle, Brackets, Check, Copy, FileCode } from "lucide-react";
import React, { useState } from "react";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface DisplayConvertedResponseProps {
  codeSnippet: string;
  language: string;
}

const DisplayConvertedResponse: React.FC<DisplayConvertedResponseProps> = ({
  codeSnippet,
  language
}) => {
  const [copied, setCopied] = useState(false);

  // Check if code snippet is a rate limit error message
  const isRateLimitError = codeSnippet.includes("Rate limit exceeded");

  const cleanedCode = isRateLimitError
    ? codeSnippet
    : codeSnippet
      .replace(/^```[\w-]*\n/gm, '')
      .replace(/```$/gm, '')
      .trim();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cleanedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHighlightLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'csharp': 'csharp',
      'cpp': 'cpp',
      'go': 'go',
      'rust': 'rust',
      'php': 'php',
      'ruby': 'ruby',
      'swift': 'swift',
      'kotlin': 'kotlin'
    };

    return languageMap[lang.toLowerCase()] || 'text';
  };

  const getLanguageInfo = (lang: string): { name: string, icon: React.ReactNode } => {
    const languages: Record<string, { name: string, icon: React.ReactNode }> = {
      'javascript': { name: 'JavaScript', icon: <FileCode size={16} /> },
      'typescript': { name: 'TypeScript', icon: <FileCode size={16} /> },
      'python': { name: 'Python', icon: <FileCode size={16} /> },
      'java': { name: 'Java', icon: <FileCode size={16} /> },
      'csharp': { name: 'C#', icon: <Brackets size={16} /> },
      'cpp': { name: 'C++', icon: <Brackets size={16} /> },
      'go': { name: 'Go', icon: <FileCode size={16} /> },
      'rust': { name: 'Rust', icon: <FileCode size={16} /> },
      'php': { name: 'PHP', icon: <FileCode size={16} /> },
      'ruby': { name: 'Ruby', icon: <FileCode size={16} /> },
      'swift': { name: 'Swift', icon: <FileCode size={16} /> },
      'kotlin': { name: 'Kotlin', icon: <FileCode size={16} /> }
    };

    return languages[lang.toLowerCase()] || { name: 'Code', icon: <FileCode size={16} /> };
  };

  // If it's a rate limit error, display a special error component
  if (isRateLimitError) {
    return (
      <div className="p-6 rounded-lg bg-red-900/20 border border-red-800 text-center">
        <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-400 mb-2">Rate Limit Exceeded</h3>
        <p className="text-gray-300 mb-2">
          {cleanedCode}
        </p>
        <p className="text-sm text-gray-400">
          The rate limit resets after 24 hours.
        </p>
      </div>
    );
  }

  const langInfo = getLanguageInfo(language);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-700">
      <div className="flex justify-between items-center py-2 px-4 bg-gray-750 text-gray-200">
        <div className="flex items-center">
          <span className="text-emerald-400 mr-2">{langInfo.icon}</span>
          <span className="font-medium">{langInfo.name}</span>
        </div>
        <button
          onClick={handleCopyCode}
          className="flex items-center space-x-1 text-gray-300 hover:text-emerald-400 bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-md transition"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* <SyntaxHighlighter
          style={coldarkDark}
          language={getHighlightLanguage(language)}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '0.9rem',
            backgroundColor: '#1a1a1a',
            borderRadius: 0
          }}
          showLineNumbers={true}
          wrapLongLines={true}
        >
          {cleanedCode}
        </SyntaxHighlighter> */}
      </div>

      <div className="py-2 px-4 bg-gray-750 text-gray-400 text-xs flex justify-between items-center">
        <span>{cleanedCode.split('\n').length} lines</span>
        <span>{cleanedCode.length} characters</span>
      </div>
    </div>
  );
};

export default DisplayConvertedResponse;