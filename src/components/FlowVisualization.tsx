'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TraceStep } from '@/lib/pythonTutorService';

// Types for node data
interface Variable {
  name: string;
  value: string;
  type: string;
  pointsTo?: string;
}

interface FrameNodeData {
  funcName: string;
  variables: Variable[];
  frameIndex: number;
}

interface ObjectField {
  name: string;
  value: string;
  isReference: boolean;
  pointsTo?: string;
}

interface ObjectNodeData {
  type: string;
  address: string;
  fields: ObjectField[];
  funcName?: string;
}

// Custom node types
const FrameNode = ({ data }: { data: FrameNodeData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-400 rounded-lg p-3 min-w-[200px] shadow-lg">
      <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 -m-3 mb-2 rounded-t-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
          {data.funcName}
        </h4>
      </div>
      <div className="space-y-1">
        {data.variables && data.variables.length > 0 ? (
          data.variables.map((variable: Variable, index: number) => (
            <div key={index} className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {variable.name}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-mono ${
                variable.type === 'pointer' 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {variable.type === 'pointer' ? '●' : variable.value}
              </span>
            </div>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-xs italic">
            No variables
          </div>
        )}
      </div>
    </div>
  );
};

const ObjectNode = ({ data }: { data: ObjectNodeData }) => {
  const getObjectColor = (type: string) => {
    switch (type) {
      case 'LIST': return 'purple';
      case 'FUNCTION': return 'green';
      case 'INSTANCE': return 'orange';
      case 'TUPLE': return 'blue';
      case 'DICT': return 'red';
      default: return 'gray';
    }
  };

  const color = getObjectColor(data.type);
  
  return (
    <div className={`bg-white dark:bg-gray-800 border-2 border-${color}-400 rounded-lg p-3 min-w-[180px] shadow-lg`}>
      <div className={`bg-${color}-100 dark:bg-${color}-900 px-3 py-1 -m-3 mb-2 rounded-t-lg flex justify-between items-center`}>
        <span className={`text-${color}-900 dark:text-${color}-100 text-xs font-medium uppercase tracking-wide`}>
          {data.type.toLowerCase()}
        </span>
        <span className={`text-${color}-700 dark:text-${color}-300 text-xs`}>
          @{data.address}
        </span>
      </div>
      <div className="space-y-1">
        {data.fields && data.fields.length > 0 ? (
          data.fields.map((field: ObjectField, index: number) => (
            <div key={index} className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.name}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-mono ${
                field.isReference 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {field.isReference ? '●' : field.value}
              </span>
            </div>
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-xs italic">
            {data.type === 'FUNCTION' ? `${data.funcName}()` : 'Empty'}
          </div>
        )}
      </div>
    </div>
  );
};

// Register custom node types
const nodeTypes = {
  frame: FrameNode,
  object: ObjectNode,
};

interface FlowVisualizationProps {
  traceStep: TraceStep;
  className?: string;
}

export default function FlowVisualization({ traceStep, className }: FlowVisualizationProps) {
  // Convert trace data to react-flow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const nodePositions = { x: 50, y: 50 };
    
    // Helper function to format variable value
    const formatVariableValue = (varValue: unknown) => {
      if (Array.isArray(varValue)) {
        if (varValue[0] === 'C_DATA') {
          if (varValue[3] === '<UNINITIALIZED>') {
            return { value: 'uninitialized', type: 'uninitialized' };
          }
          return { 
            value: varValue[2], 
            type: 'pointer', 
            pointsTo: varValue[1]
          };
        }
        if (varValue[0] === 'REF') {
          return {
            value: `→ ${varValue[1]}`,
            type: 'reference',
            pointsTo: varValue[1]
          };
        }
        return { value: JSON.stringify(varValue), type: 'array' };
      }
      return { value: String(varValue), type: 'primitive' };
    };

    // Create frame nodes
    traceStep.stack_to_render?.forEach((frame, frameIndex) => {
      const variables = frame.ordered_varnames?.map(varName => {
        const varValue = frame.encoded_locals[varName];
        const formatted = formatVariableValue(varValue);
        return {
          name: varName,
          value: formatted.value,
          type: formatted.type,
          pointsTo: formatted.pointsTo
        };
      }) || [];

      const frameNode: Node = {
        id: `frame-${frameIndex}`,
        type: 'frame',
        position: { x: nodePositions.x, y: nodePositions.y },
        data: {
          funcName: frame.func_name,
          variables,
          frameIndex
        },
        draggable: true,
      };

      nodes.push(frameNode);
      nodePositions.y += 200; // Stack frames vertically
    });

    // Create object nodes from heap
    const heap = traceStep.heap || {};
    const objectPositions = { x: 400, y: 50 };
    
    Object.entries(heap).forEach(([address, obj]) => {
      let objectType = 'object';
      let fields: ObjectField[] = [];
      let funcName = '';

      if (Array.isArray(obj)) {
        objectType = obj[0] as string;
        
        switch (objectType) {
          case 'LIST':
            fields = obj[1] && Array.isArray(obj[1]) ? obj[1].map((item, idx) => ({
              name: `[${idx}]`,
              value: Array.isArray(item) && item[0] === 'REF' ? `→ @${item[1]}` : String(item),
              isReference: Array.isArray(item) && item[0] === 'REF',
              pointsTo: Array.isArray(item) && item[0] === 'REF' ? item[1] : undefined
            })) : [];
            break;
            
          case 'FUNCTION':
            funcName = obj[1] as string;
            break;
            
          case 'INSTANCE':
            const instanceData = obj[2] as Record<string, unknown>;
            fields = Object.entries(instanceData || {}).map(([key, value]) => ({
              name: key,
              value: Array.isArray(value) && value[0] === 'REF' ? `→ @${value[1]}` : String(value),
              isReference: Array.isArray(value) && value[0] === 'REF',
              pointsTo: Array.isArray(value) && value[0] === 'REF' ? value[1] : undefined
            }));
            break;
            
          case 'TUPLE':
            fields = obj.slice(1).map((item, idx) => ({
              name: `[${idx}]`,
              value: String(item),
              isReference: false
            }));
            break;
            
          case 'DICT':
            const dictData = obj[1] as Record<string, unknown>;
            fields = Object.entries(dictData || {}).map(([key, value]) => ({
              name: key,
              value: Array.isArray(value) && value[0] === 'REF' ? `→ @${value[1]}` : String(value),
              isReference: Array.isArray(value) && value[0] === 'REF',
              pointsTo: Array.isArray(value) && value[0] === 'REF' ? value[1] : undefined
            }));
            break;
        }
      }

      const objectNode: Node = {
        id: `object-${address}`,
        type: 'object',
        position: { x: objectPositions.x, y: objectPositions.y },
        data: {
          type: objectType,
          address,
          fields,
          funcName
        },
        draggable: true,
      };

      nodes.push(objectNode);
      objectPositions.y += 180; // Stack objects vertically
    });

    // Create edges for pointer relationships
    nodes.forEach(node => {
      if (node.type === 'frame') {
        const frameData = node.data as unknown as FrameNodeData;
        const variables = frameData.variables || [];
        variables.forEach((variable: Variable) => {
          if (variable.pointsTo) {
            const targetNode = nodes.find(n => n.id === `object-${variable.pointsTo}`);
            if (targetNode) {
              edges.push({
                id: `edge-${node.id}-${targetNode.id}-${variable.name}`,
                source: node.id,
                target: targetNode.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#8b5cf6', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#8b5cf6',
                },
                label: variable.name,
                labelStyle: { fontSize: 10, fontWeight: 'bold' },
                labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
              });
            }
          }
        });
      } else if (node.type === 'object') {
        const objectData = node.data as unknown as ObjectNodeData;
        const fields = objectData.fields || [];
        fields.forEach((field: ObjectField) => {
          if (field.pointsTo) {
            const targetNode = nodes.find(n => n.id === `object-${field.pointsTo}`);
            if (targetNode) {
              edges.push({
                id: `edge-${node.id}-${targetNode.id}-${field.name}`,
                source: node.id,
                target: targetNode.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#3b82f6', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#3b82f6',
                },
                label: field.name,
                labelStyle: { fontSize: 10, fontWeight: 'bold' },
                labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
              });
            }
          }
        });
      }
    });

    // Create function call edges (frames to function objects)
    traceStep.stack_to_render?.forEach((frame, frameIndex) => {
      const functionObjects = nodes.filter(n => 
        n.type === 'object' && 
        n.data.type === 'FUNCTION'
      );
      
      if (functionObjects[frameIndex]) {
        edges.push({
          id: `edge-frame-${frameIndex}-func`,
          source: `frame-${frameIndex}`,
          target: functionObjects[frameIndex].id,
          type: 'smoothstep',
          style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '5,5' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#10b981',
          },
        });
      }
    });

    return { nodes, edges };
  }, [traceStep]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when traceStep changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(() => {
    // Disable manual connections
  }, []);

  return (
    <div className={`h-full w-full bg-gray-50 dark:bg-gray-900 ${className || ''}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 20 }}
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
