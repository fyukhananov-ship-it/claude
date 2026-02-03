import React from 'react';
import type { Category } from '../types';

interface CategoryScrollProps {
  categories: Category[];
  selected?: string;
  onSelect: (id: string) => void;
}

export function CategoryScroll({ categories, selected, onSelect }: CategoryScrollProps) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`
            flex flex-col items-center gap-1.5 min-w-[4.5rem] p-3 rounded-2xl
            transition-all duration-200 tap-highlight-none
            ${selected === category.id
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <span className="text-2xl">{category.icon}</span>
          <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
        </button>
      ))}
    </div>
  );
}
