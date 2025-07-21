import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import SeparatorDividerComponent from '../components/SeparatorDividerComponent';

export interface SeparatorDividerOptions {
  HTMLAttributes: Record<string, any>;
}

const SeparatorDivider = Node.create<SeparatorDividerOptions>({
  name: 'separatorDivider',
  group: 'block',
  atom: true,
  selectable: true,
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      variant: {
        default: 'line',
        parseHTML: element => element.getAttribute('data-variant') || 'line',
        renderHTML: attributes => ({ 'data-variant': attributes.variant }),
      },
      iconType: {
        default: 'star',
        parseHTML: element => element.getAttribute('data-icon-type') || 'star',
        renderHTML: attributes => ({ 'data-icon-type': attributes.iconType }),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-separator-divider]'
      }
    ];
  },
  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-separator-divider': '',
        'data-variant': node.attrs.variant,
        'data-icon-type': node.attrs.iconType,
      }),
      ''
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(SeparatorDividerComponent);
  },
});

export default SeparatorDivider;
