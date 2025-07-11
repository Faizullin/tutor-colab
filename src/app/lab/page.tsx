'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AceEditor from 'react-ace';
import { PythonTutorService, ExecutionTrace } from '@/lib/pythonTutorService';
import FlowVisualization from '@/components/FlowVisualization';

// Import ACE Editor modes and themes
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

const defaultCode = `#include <iostream>

int main() {
  int x = 10;
  if(x > 0) {
    std::cout << "Bigger then 0\\n";
  } else {
    std::cout << "Not bigger then 0\\n";
  }
  
  return 0;
}`;

export default function LabPage() {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState('cpp');
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [executionTrace, setExecutionTrace] = useState<ExecutionTrace | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const editorRef = useRef<unknown>(null);

  const handleEditorLoad = (editor: unknown) => {
    editorRef.current = editor;
  };

  // Update editor decorations based on current step
  const updateEditorDecorations = useCallback((trace: ExecutionTrace, step: number) => {
    if (!editorRef.current || !trace.trace[step]) return;

    const editor = editorRef.current as { 
      session: { 
        removeMarker: (id: number) => void;
        addMarker: (range: unknown, className: string, type: string) => number;
        getMarkers: () => unknown[];
        $backMarkers: { [key: number]: unknown };
      };
      getSession: () => {
        removeMarker: (id: number) => void;
        addMarker: (range: unknown, className: string, type: string) => number;
        getMarkers: () => unknown[];
        $backMarkers: { [key: number]: unknown };
      };
    };
    
    const currentLine = PythonTutorService.getCurrentExecutionLine(trace.trace[step]);
    
    // Clear previous markers
    const session = editor.session || editor.getSession();
    
    // Clear all existing markers
    const markers = session.$backMarkers || {};
    Object.keys(markers).forEach(id => {
      session.removeMarker(parseInt(id));
    });
    
    // Get all executed lines up to current step (green)
    const executedLines = new Set<number>();
    for (let i = 0; i < step; i++) {
      const line = PythonTutorService.getCurrentExecutionLine(trace.trace[i]);
      if (line) {
        executedLines.add(line - 1); // ACE uses 0-based line numbers
      }
    }

    // Add green background for all previously executed lines
    executedLines.forEach(line => {
      if (line !== (currentLine ? currentLine - 1 : -1)) {
        const Range = (window as unknown as { ace: { require: (module: string) => { Range: new (startRow: number, startCol: number, endRow: number, endCol: number) => unknown } } }).ace.require('ace/range').Range;
        const range = new Range(line, 0, line, 1);
        session.addMarker(range, 'executed-line', 'fullLine');
      }
    });

    // Add red background for current line (next to be executed)
    if (currentLine) {
      const Range = (window as unknown as { ace: { require: (module: string) => { Range: new (startRow: number, startCol: number, endRow: number, endCol: number) => unknown } } }).ace.require('ace/range').Range;
      const range = new Range(currentLine - 1, 0, currentLine - 1, 1);
      session.addMarker(range, 'current-line', 'fullLine');
    }
  }, []);

  const executeCode = async (debug = false) => {
    if (!code.trim()) {
      setError('Please enter some code to execute');
      return;
    }

    const loadingState = debug ? setIsDebugging : setIsLoading;
    loadingState(true);
    setError('');
    setResult('');
    setExecutionTrace(null);
    setCurrentStep(0);

    try {
      const response = await PythonTutorService.executeCode({
        code,
        language
      });

      setResult(response.data);
      
      // Try to parse the trace data
      const trace = PythonTutorService.parseExecutionTrace(response.data);
      if (trace) {
        setExecutionTrace(trace);
        setCurrentStep(0);
        // Update editor decorations for first step
        setTimeout(() => updateEditorDecorations(trace, 0), 100);
      }
      
      if (debug) {
        // Open Python Tutor in new tab for debugging
        window.open(response.url, '_blank');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error: Failed to connect to the server';
      setError(errorMessage);
      console.error('Execution error:', err);
    } finally {
      loadingState(false);
    }
  };

  const handleRunClick = () => executeCode(false);
  const handleDebugClick = () => executeCode(true);

  // Handle step navigation
  const goToStep = (newStep: number) => {
    if (executionTrace && newStep >= 0 && newStep < executionTrace.trace.length) {
      setCurrentStep(newStep);
      updateEditorDecorations(executionTrace, newStep);
    }
  };

  // Add keyboard shortcuts for step navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!executionTrace) return;
      
      // Only handle shortcuts when not typing in the editor
      if (event.target && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
        if (event.key === 'ArrowRight' || event.key === 'n') {
          event.preventDefault();
          if (currentStep < executionTrace.trace.length - 1) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            updateEditorDecorations(executionTrace, newStep);
          }
        } else if (event.key === 'ArrowLeft' || event.key === 'p') {
          event.preventDefault();
          if (currentStep > 0) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            updateEditorDecorations(executionTrace, newStep);
          }
        } else if (event.key === 'Home') {
          event.preventDefault();
          setCurrentStep(0);
          updateEditorDecorations(executionTrace, 0);
        } else if (event.key === 'End') {
          event.preventDefault();
          const lastStep = executionTrace.trace.length - 1;
          setCurrentStep(lastStep);
          updateEditorDecorations(executionTrace, lastStep);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [executionTrace, currentStep, updateEditorDecorations]);

  const getLanguageForAce = (lang: string) => {
    switch (lang) {
      case 'cpp': 
      case 'c': 
        return 'c_cpp';
      case 'java': return 'java';
      case 'python': return 'python';
      case 'javascript': return 'javascript';
      default: return 'c_cpp';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Code Lab
            </h1>
            <nav className="mt-1">
              <Link 
                href="/" 
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to Home
              </Link>
            </nav>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>

            <button
              onClick={handleRunClick}
              disabled={isLoading || isDebugging}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium transition-colors flex items-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                  Run
                </>
              )}
            </button>

            <button
              onClick={handleDebugClick}
              disabled={isLoading || isDebugging}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors flex items-center gap-2 text-sm"
            >
              {isDebugging ? (
                <>
                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                  Debugging...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Debug
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Panel Layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Results */}
        <div className="w-1/2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Execution Results
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 rounded-md">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error:</h3>
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {executionTrace && !error && (
              <div className="space-y-4">
                {/* Step Navigation */}
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToStep(currentStep - 1)}
                      disabled={currentStep === 0}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Prev
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Step {currentStep + 1} of {executionTrace.trace.length}
                    </span>
                    <button
                      onClick={() => goToStep(currentStep + 1)}
                      disabled={currentStep === executionTrace.trace.length - 1}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm flex items-center gap-1"
                    >
                      Next
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                      <span>Next to execute</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <span>Executed</span>
                    </div>
                    <span>Line: {executionTrace.trace[currentStep]?.line || 'N/A'}</span>
                    <span className="text-gray-500">|</span>
                    <span>Use ← → or N/P keys</span>
                  </div>
                </div>

                {/* React Flow Visualization */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-t-lg border-b border-gray-300 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      Execution Flow Visualization
                    </h4>
                  </div>
                  <div className="h-96">
                    <FlowVisualization 
                      traceStep={executionTrace.trace[currentStep]} 
                      className="rounded-b-lg"
                    />
                  </div>
                </div>

                {/* Output */}
                {executionTrace.trace[currentStep]?.stdout && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Output</h4>
                    <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {executionTrace.trace[currentStep].stdout}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {result && !executionTrace && !error && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                  Raw Response:
                </h3>
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md border max-h-96 overflow-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {result.length > 1000 ? 
                      `${result.substring(0, 1000)}...\n\n[Response truncated]` 
                      : result
                    }
                  </pre>
                </div>
              </div>
            )}

            {!result && !error && !isLoading && !isDebugging && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm">Click &quot;Run&quot; to execute your program</p>
                <p className="text-sm">Click &quot;Debug&quot; to visualize execution step by step</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Monaco Editor */}
        <div className="w-1/2 bg-white dark:bg-gray-800 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Code Editor
            </h2>
          </div>
          
          <div className="flex-1">
            <AceEditor
              mode={getLanguageForAce(language)}
              theme="monokai"
              value={code}
              onChange={(value: string) => setCode(value)}
              onLoad={handleEditorLoad}
              width="100%"
              height="100%"
              fontSize={14}
              showPrintMargin={false}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
                useWorker: false
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
