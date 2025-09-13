import React from 'react';

export type SuggestionItem = {
  id: string;
  label: string;
  safe: boolean;
  roles: string[];
  clinics: string[];
};

export type SuggestionsProps = {
  items: SuggestionItem[];
  role: string;
  clinic: string;
  filter?: (args: { item: SuggestionItem; role: string; clinic: string }) => boolean;
  onPick?: (item: SuggestionItem) => void;
};

export function Suggestions({ items, role, clinic, filter, onPick }: SuggestionsProps) {
  const visible = (items || []).filter(item =>
    filter ? filter({ item, role, clinic }) : item.safe,
  );

  if (!visible.length) return null;

  return (
    <div aria-label="suggestions-list">
      {visible.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPick?.(item)}
          className="px-2 py-1 text-sm"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default Suggestions;
