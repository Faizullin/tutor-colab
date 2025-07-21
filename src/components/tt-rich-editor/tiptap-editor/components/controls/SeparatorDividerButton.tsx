import { useState } from 'react';
import { useTiptapContext } from '../Provider';

const options = [
  { label: 'Simple Divider', value: 'line' },
  { label: 'Animated Icon Divider', value: 'icon' },
];

const SeparatorDividerButton: React.FC = () => {
  const { editor } = useTiptapContext();
  const [selected, setSelected] = useState<'line' | 'icon'>('line');

  const handleInsert = () => {
    editor.chain().focus().insertContent({
      type: 'separatorDivider',
      attrs: { variant: selected, iconType: 'star' },
    }).run();
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={selected}
        onChange={e => setSelected(e.target.value as 'line' | 'icon')}
        className="border rounded px-1 py-0.5 text-sm"
        title="Choose divider type"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleInsert}
        title={selected === 'icon' ? 'Insert Animated Divider' : 'Insert Divider'}
        className="px-2 py-1 rounded hover:bg-gray-200 transition"
      >
        {selected === 'icon' ? (
          <span role="img" aria-label="Animated Divider">⭐</span>
        ) : (
          <span className="block w-6 h-0.5 bg-gray-400 mx-auto" />
        )}
      </button>
    </div>
  );
};

export default SeparatorDividerButton;
