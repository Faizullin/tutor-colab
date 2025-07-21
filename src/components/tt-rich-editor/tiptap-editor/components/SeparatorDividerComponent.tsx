import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

const ICONS: Record<string, React.ReactNode> = {
  star: (
    <svg className="w-8 h-8 text-yellow-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
      <polygon points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7" />
    </svg>
  ),
  // Add more icons as needed
};

const SeparatorDividerComponent: React.FC<NodeViewProps> = ({ node }) => {
  const variant = node.attrs.variant || 'line';
  const iconType = node.attrs.iconType || 'star';

  if (variant === 'icon') {
    return (
      <NodeViewWrapper as="div" className="flex items-center justify-center my-6 select-none">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-4 flex items-center justify-center">
          {ICONS[iconType] || ICONS.star}
        </span>
        <div className="flex-grow border-t border-gray-300" />
      </NodeViewWrapper>
    );
  }
  // Default: simple line
  return (
    <NodeViewWrapper as="div" className="my-6">
      <hr className="border-t-2 border-gray-300 w-full" />
    </NodeViewWrapper>
  );
};

export default SeparatorDividerComponent;
