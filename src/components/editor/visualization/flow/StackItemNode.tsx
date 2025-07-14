import React, { memo } from "react";

interface StackItemNodeProps {
  data: {
    name: string;
    isHighlighted?: boolean;
    variables?: Array<{
      name: string;
      type: string;
      value?: string;
      isPointer?: boolean;
    }>;
  };
}

const StackItemNode = ({ data }: StackItemNodeProps) => {
  // If it's just a header (like "Stack"), render simple header
  if (!data.variables || data.variables.length === 0) {
    return (
      <div className="px-3 py-1 bg-gray-200 border border-gray-400 rounded-sm text-sm font-semibold text-gray-700">
        {data.name}
      </div>
    );
  }

  // If it's a function with variables (like "main"), render the complete stack frame
  return (
    <div className={`bg-white border rounded-sm shadow-sm min-w-[200px] ${
      data.isHighlighted ? 'border-blue-500 border-2' : 'border-gray-400'
    }`}>
      {/* Function name header */}
      <div className={`px-3 py-1 border-b text-sm font-semibold ${
        data.isHighlighted 
          ? 'bg-blue-100 border-blue-300 text-blue-800' 
          : 'bg-gray-200 border-gray-400 text-gray-700'
      }`}>
        {data.name}
      </div>
      
      {/* Variables list */}
      <div className="p-2 space-y-2">
        {data.variables.map((variable, index) => (
          <div key={index} className="flex items-center justify-between">
            {/* Variable name */}
            <div className="font-semibold text-sm text-gray-800 min-w-[20px]">
              {variable.name}
            </div>
            
            {/* Variable type and value */}
            <div className="flex items-center space-x-2 flex-1 ml-4">
              <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {variable.type}
              </div>
              
              {/* Show value for non-pointers */}
              {!variable.isPointer && variable.value !== undefined && (
                <div className="text-xs font-mono text-gray-800 bg-blue-50 px-2 py-1 rounded border">
                  {variable.value}
                </div>
              )}
              
              {/* Show arrow for pointers */}
              {variable.isPointer && (
                <div className="text-blue-600">
                  →
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(StackItemNode);
