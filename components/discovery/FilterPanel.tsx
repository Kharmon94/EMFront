'use client';

import { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

interface FilterOption {
  id: string | number;
  label: string;
  count?: number;
}

interface FilterPanelProps {
  genres?: FilterOption[];
  moods?: FilterOption[];
  onFilterChange: (filters: any) => void;
  showDurationFilter?: boolean;
  showPriceFilter?: boolean;
  showDateFilter?: boolean;
}

export function FilterPanel({
  genres = [],
  moods = [],
  onFilterChange,
  showDurationFilter = false,
  showPriceFilter = false,
  showDateFilter = false
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<(string | number)[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<(string | number)[]>([]);
  const [durationRange, setDurationRange] = useState({ min: 0, max: 600 });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const toggleGenre = (id: string | number) => {
    const newSelection = selectedGenres.includes(id)
      ? selectedGenres.filter(g => g !== id)
      : [...selectedGenres, id];
    setSelectedGenres(newSelection);
    emitFilters({ genres: newSelection });
  };
  
  const toggleMood = (id: string | number) => {
    const newSelection = selectedMoods.includes(id)
      ? selectedMoods.filter(m => m !== id)
      : [...selectedMoods, id];
    setSelectedMoods(newSelection);
    emitFilters({ moods: newSelection });
  };
  
  const emitFilters = (updates: any = {}) => {
    onFilterChange({
      genres: updates.genres !== undefined ? updates.genres : selectedGenres,
      moods: updates.moods !== undefined ? updates.moods : selectedMoods,
      duration: showDurationFilter ? durationRange : undefined,
      price: showPriceFilter ? priceRange : undefined,
      dateRange: showDateFilter ? dateRange : undefined
    });
  };
  
  const clearAll = () => {
    setSelectedGenres([]);
    setSelectedMoods([]);
    setDurationRange({ min: 0, max: 600 });
    setPriceRange({ min: 0, max: 100 });
    setDateRange({ from: '', to: '' });
    onFilterChange({});
  };
  
  const activeFiltersCount = selectedGenres.length + selectedMoods.length;
  
  return (
    <div className="relative">
      {/* Mobile: Bottom Sheet */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
        >
          <FiFilter />
          Filters
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
        
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black rounded-t-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                  <button onClick={() => setIsOpen(false)}>
                    <FiX className="w-6 h-6 text-gray-900 dark:text-white" />
                  </button>
                </div>
                
                <FilterContent
                  genres={genres}
                  moods={moods}
                  selectedGenres={selectedGenres}
                  selectedMoods={selectedMoods}
                  toggleGenre={toggleGenre}
                  toggleMood={toggleMood}
                  clearAll={clearAll}
                  activeFiltersCount={activeFiltersCount}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop: Sidebar */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Clear all
              </button>
            )}
          </div>
          
          <FilterContent
            genres={genres}
            moods={moods}
            selectedGenres={selectedGenres}
            selectedMoods={selectedMoods}
            toggleGenre={toggleGenre}
            toggleMood={toggleMood}
            clearAll={clearAll}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      </div>
    </div>
  );
}

function FilterContent({ 
  genres, 
  moods, 
  selectedGenres, 
  selectedMoods, 
  toggleGenre, 
  toggleMood, 
  clearAll, 
  activeFiltersCount 
}: any) {
  return (
    <div className="space-y-6">
      {/* Genres */}
      {genres.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Genre</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {genres.map((genre: FilterOption) => (
              <label key={genre.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre.id)}
                  onChange={() => toggleGenre(genre.id)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{genre.label}</span>
                {genre.count && (
                  <span className="text-xs text-gray-500">({genre.count})</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
      
      {/* Moods */}
      {moods.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Mood</h4>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood: FilterOption) => (
              <button
                key={mood.id}
                onClick={() => toggleMood(mood.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedMoods.includes(mood.id)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

