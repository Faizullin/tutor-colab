"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react"; // Import useSession
import { Code, X, ArrowLeft, Copy, Check, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import DisplayConvertedResponse from "./displayConvertedResponse";
import { useAIStore } from "@/store/useAIStore";

// Rate limit constants
const MAX_LOGGED_IN_CONVERSIONS = 5;
const MAX_GUEST_CONVERSIONS = 2; // New guest limit
const RATE_LIMIT_STORAGE_KEY = "code_conversion_rate_limit";

type RateLimitData = {
  count: number;
  resetTime: number;
};

const ConversionCodePanel = () => {
  const { data: session } = useSession(); // Get session data
  const { codeForConversion } = useAIStore();
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [convertedCode, setConvertedCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<boolean>(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  // Determine max conversions based on user status
  const MAX_CONVERSIONS = session?.user ? MAX_LOGGED_IN_CONVERSIONS : MAX_GUEST_CONVERSIONS;

  // Check and load rate limit status from localStorage
  useEffect(() => {
    const checkRateLimit = () => {
      const savedData = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      
      if (savedData) {
        const data: RateLimitData = JSON.parse(savedData);
        const now = Date.now();
        
        // If the reset time has passed, reset the counter
        if (now > data.resetTime) {
          const newData: RateLimitData = {
            count: 0,
            resetTime: now + 24 * 60 * 60 * 1000 // 24 hours from now
          };
          localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(newData));
          setUsageCount(0);
          setRateLimited(false);
        } else {
          // Still within rate limit period
          setUsageCount(data.count);
          setRateLimited(data.count >= MAX_CONVERSIONS);
          
          // Calculate time until reset
          const timeLeft = data.resetTime - now;
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilReset(`${hours}h ${minutes}m`);
        }
      } else {
        // No saved data, initialize
        const newData: RateLimitData = {
          count: 0,
          resetTime: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
        };
        localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(newData));
        setUsageCount(0);
        setRateLimited(false);
      }
    };
    
    checkRateLimit();
    
    // Update time remaining every minute
    const intervalId = setInterval(checkRateLimit, 60000);
    return () => clearInterval(intervalId);
  }, [MAX_CONVERSIONS]);

  // Update button position when the panel opens
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({ 
        x: rect.left, 
        y: rect.top 
      });
    }
  }, [isOpen]);

  // Close the panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          !showOutputPanel) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOutputPanel]);

  // Increment the rate limit counter
  const incrementUsageCount = () => {
    const savedData = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    
    if (savedData) {
      const data: RateLimitData = JSON.parse(savedData);
      const newCount = data.count + 1;
      const newData: RateLimitData = {
        count: newCount,
        resetTime: data.resetTime
      };
      
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(newData));
      setUsageCount(newCount);
      
      if (newCount >= MAX_CONVERSIONS) {
        setRateLimited(true);
      }
      
      return newCount;
    }
    
    return 1;
  };

  const handleCodeConversion = async () => {
    if (!sourceLanguage || !targetLanguage || !codeForConversion) {
      setError("Please select both languages and ensure code is available for conversion.");
      return;
    }

    // Check rate limit before making API call
    if (rateLimited) {
      setError(`Rate limit exceeded. You can make ${MAX_CONVERSIONS} conversions every 24 hours. Please try again in ${timeUntilReset}.`);
      setShowOutputPanel(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowOutputPanel(true);

    try {
      const response = await fetch("/api/code-converter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          codeSnippet: codeForConversion, 
          sourceLanguage, 
          targetLanguage 
        }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        // Handle 429 Too Many Requests - Rate limit exceeded
        incrementUsageCount(); // Ensure count is updated locally
        setRateLimited(true);
        
        // If sign-in is required, update error message
        if (errorData.requiresSignIn) {
          setError(`Guest user limit reached. Please sign in for more conversions.`);
        } else {
          setError(`Rate limit exceeded. You can make ${MAX_CONVERSIONS} conversions every 24 hours. Please try again in ${timeUntilReset}.`);
        }
        
        throw new Error(errorData.message);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Successful conversion - increment usage count
      const newCount = incrementUsageCount();
      
      const result = await response.text();
      setConvertedCode(result);
    } catch (error: any) {
      console.error("Error converting code:", error);
      setError(error.message || "Failed to convert code.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeOutputPanel = () => {
    setShowOutputPanel(false);
  };

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" }
  ];

  return (
    <>
      {/* Code Conversion Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-2 py-1 rounded text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition ml-2"
        aria-label="Code Converter"
      >
        <RefreshCw size={16} className="mr-1" />
        <span>Convert</span>
      </button>

      {/* Input Panel */}
      {isOpen && !showOutputPanel && (
        <div 
          ref={panelRef}
          className="fixed shadow-lg rounded-lg bg-gray-900 border border-gray-800"
          style={{
            top: `${buttonPosition.y + 40}px`,
            right: '20px',
            width: '380px',
            maxWidth: '90vw',
            zIndex: 40,
          }}
        >
          <div className="p-3">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-3">
              <div className="flex items-center">
                <RefreshCw size={18} className="text-emerald-400 mr-2" />
                <h3 className="text-md font-medium text-gray-200">Code Converter</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Usage Counter */}
            <div className="mb-3 flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Conversions remaining today:
              </span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                MAX_CONVERSIONS - usageCount <= 1 
                  ? "bg-red-900/30 text-red-400" 
                  : "bg-emerald-900/30 text-emerald-400"
              }`}>
                {Math.max(0, MAX_CONVERSIONS - usageCount)} / {MAX_CONVERSIONS}
              </span>
            </div>

            {/* Rate Limit Warning */}
            {rateLimited && (
              <div className="mb-3 p-2 bg-red-900/30 border border-red-800 rounded text-sm text-red-400 flex items-start">
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Rate limit exceeded</p>
                  <p className="mt-1">
                    {session?.user 
                      ? `You've reached the maximum of ${MAX_CONVERSIONS} conversions in 24 hours.` 
                      : `Guest users are limited to ${MAX_CONVERSIONS} conversions. Please sign in for more.`
                    } 
                    Try again in {timeUntilReset}.
                  </p>
                  {!session?.user && (
                    <button 
                      onClick={() => {/* Add sign-in logic */}}
                      className="mt-2 px-3 py-1 bg-emerald-500 text-white rounded text-xs"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !rateLimited && (
              <div className="mb-3 p-2 bg-red-900/30 border border-red-800 rounded text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Language Selection Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Source Language Selection */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">From:</label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-800 text-gray-200"
                  disabled={rateLimited}
                >
                  <option value="">Source</option>
                  {languages.map((lang) => (
                    <option key={`source-${lang.value}`} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Language Selection */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">To:</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-800 text-gray-200"
                  disabled={rateLimited}
                >
                  <option value="">Target</option>
                  {languages.map((lang) => (
                    <option key={`target-${lang.value}`} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code Preview */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-gray-300 text-sm">Selected Code</label>
                <span className="text-xs text-gray-500">{codeForConversion?.length || 0} characters</span>
              </div>
              <div className="p-2 text-sm border border-gray-700 rounded-md bg-gray-800 text-gray-400 h-24 overflow-y-auto">
                {codeForConversion ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                    {codeForConversion.length > 300 
                      ? `${codeForConversion.substring(0, 300)}...` 
                      : codeForConversion}
                  </pre>
                ) : (
                  <span className="text-gray-500 italic">No code selected for conversion</span>
                )}
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleCodeConversion}
              disabled={isLoading || !sourceLanguage || !targetLanguage || !codeForConversion || rateLimited}
              className={`w-full p-2 text-sm rounded-md transition flex items-center justify-center ${
                isLoading || !sourceLanguage || !targetLanguage || !codeForConversion || rateLimited
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  <span>Converting...</span>
                </>
              ) : rateLimited ? (
                <>
                  <AlertCircle size={16} className="mr-2" />
                  <span>Rate Limited</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  <span>Convert Code</span>
                </>
              )}
            </button>

            <div className="mt-2 text-xs text-gray-500 text-center">
              {sourceLanguage && targetLanguage ? (
                <span>Converting from <strong className="text-gray-400">{languages.find(l => l.value === sourceLanguage)?.label}</strong> to <strong className="text-gray-400">{languages.find(l => l.value === targetLanguage)?.label}</strong></span>
              ) : (
                <span>Select source and target languages to continue</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Output Panel */}
      {showOutputPanel && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl h-3/4 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-800">
              <div className="flex items-center">
                <button
                  onClick={closeOutputPanel}
                  className="p-1.5 mr-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="text-md font-semibold text-white flex items-center">
                    <span className="capitalize">{languages.find(l => l.value === sourceLanguage)?.label}</span>
                    <span className="mx-2">→</span>
                    <span className="capitalize">{languages.find(l => l.value === targetLanguage)?.label}</span>
                  </h2>
                  <p className="text-xs text-gray-400">Code Conversion Result</p>
                </div>
              </div>
              <div className="flex items-center">
                {rateLimited ? (
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs mr-2">
                    Rate Limited
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs mr-2">
                    {isLoading ? "Converting..." : "Completed"}
                  </span>
                )}
                <button
                  onClick={closeOutputPanel}
                  className="text-gray-400 hover:text-gray-200"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Content area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="rounded-lg bg-gray-800 shadow-inner">
                {rateLimited ? (
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-900/30 p-4 rounded-lg border border-red-800 max-w-lg">
                      <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
                      <h3 className="text-xl font-semibold text-red-400 mb-2">Rate Limit Exceeded</h3>
                      <p className="text-gray-300 mb-3">
                        {session?.user 
                          ? `You've reached the maximum of ${MAX_CONVERSIONS} code conversions in a 24-hour period.`
                          : `Guest users are limited to ${MAX_CONVERSIONS} code conversions. Please sign in for more.`
                        }
                      </p>
                      <div className="bg-gray-800 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-400 mb-1">Time until reset:</p>
                        <p className="text-xl font-mono text-red-400">{timeUntilReset}</p>
                      </div>
                      {!session?.user && (
                        <button 
                          onClick={() => {/* Add sign-in logic */}}
                          className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
                        >
                          Sign In
                        </button>
                      )}
                      <p className="text-sm text-gray-400 mt-3">
                        Please try again later. Your conversion limit will reset after the cooling period.
                      </p>
                    </div>
                  </div>
                ) : error && !rateLimited ? (
                  <div className="p-4 rounded-lg bg-red-900/30 border border-red-800">
                    <p className="text-red-400">{error}</p>
                  </div>
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <Loader2 size={32} className="animate-spin text-emerald-400" />
                    <div className="text-emerald-400">Converting your code...</div>
                    <div className="text-xs text-gray-500 max-w-md text-center">
                      Converting from {languages.find(l => l.value === sourceLanguage)?.label} to {languages.find(l => l.value === targetLanguage)?.label}. This may take a moment.
                    </div>
                  </div>
                ) : convertedCode ? (
                  <DisplayConvertedResponse 
                    codeSnippet={convertedCode} 
                    language={targetLanguage}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">No converted code yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Usage Counter */}
            <div className="p-3 border-t border-gray-800 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                <span className="mr-2">Conversions used: <span className="text-gray-300">{usageCount}</span> of {MAX_CONVERSIONS}</span>
                {rateLimited && <span className="text-red-400">· Resets in {timeUntilReset}</span>}
              </div>
              
              {!isLoading && convertedCode && !rateLimited && (
                <div className="flex">
                  <button
                    onClick={closeOutputPanel}
                    className="px-3 py-1.5 text-sm rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition mr-2"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(convertedCode);
                      // You could add a toast notification here
                    }}
                    className="px-3 py-1.5 text-sm rounded-md bg-emerald-500 hover:bg-emerald-600 text-white flex items-center transition"
                  >
                    <Copy size={14} className="mr-1" />
                    Copy Full Result
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversionCodePanel;