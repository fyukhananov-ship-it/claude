import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Chip } from './Chip';
import type { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4">
      <Chip
        onClick={() => updateFilter('paymentMethod', filters.paymentMethod === 'sbp' ? 'all' : 'sbp')}
        active={filters.paymentMethod === 'sbp'}
      >
        СБП
      </Chip>
      <Chip
        onClick={() => updateFilter('paymentMethod', filters.paymentMethod === 'card' ? 'all' : 'card')}
        active={filters.paymentMethod === 'card'}
      >
        Картой
      </Chip>
      <Chip
        onClick={() => updateFilter('format', filters.format === 'online' ? 'all' : 'online')}
        active={filters.format === 'online'}
      >
        Онлайн
      </Chip>
      <Chip
        onClick={() => updateFilter('format', filters.format === 'offline' ? 'all' : 'offline')}
        active={filters.format === 'offline'}
      >
        В магазине
      </Chip>
      <Chip
        onClick={() => updateFilter('onlyAvailable', !filters.onlyAvailable)}
        active={filters.onlyAvailable}
      >
        Только доступные
      </Chip>
      <Chip
        onClick={() => updateFilter('validityPeriod', filters.validityPeriod === '7days' ? 'any' : '7days')}
        active={filters.validityPeriod === '7days'}
      >
        До 7 дней
      </Chip>
      <Chip
        icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
        onClick={() => {}}
      >
        Ещё
      </Chip>
    </div>
  );
}
