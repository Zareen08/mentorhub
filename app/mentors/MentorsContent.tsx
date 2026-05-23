'use client';
import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMentors } from '@/hooks/useMentors';
import { MentorCard, MentorCardSkeleton } from '@/components/mentor/MentorCard';
import { Button, Empty } from '@/components/ui';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SKILLS } from '@/lib/utils';
import { MentorFilters } from '@/types';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
];

export default function MentorsContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<MentorFilters>({
    search: searchParams.get('search') ?? '',
    skill: searchParams.get('skill') ?? '',
    minRate: '',
    maxRate: '',
    sortBy: 'rating',
    page: 1,
    limit: 9,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | undefined>();

  const { data, isLoading, isFetching } = useMentors(filters);
  const mentors: any[] = data?.mentors ?? data?.data ?? (Array.isArray(data) ? data : []);
  const pagination = data?.pagination;

  const updateFilter = (key: keyof MentorFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const debounceSearch = useCallback((val: string) => {
    setSearchInput(val);
    clearTimeout(searchTimer);
    const t = setTimeout(() => updateFilter('search', val), 350);
    setSearchTimer(t);
  }, [searchTimer]);

  const clearFilters = () => {
    setFilters({ search: '', skill: '', minRate: '', maxRate: '', sortBy: 'rating', page: 1, limit: 9 });
    setSearchInput('');
  };

  const hasActiveFilters = filters.search || filters.skill || filters.minRate || filters.maxRate;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Skills</p>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {SKILLS.map((skill) => (
            <label key={skill} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={filters.skill === skill}
                onChange={(e) => updateFilter('skill', e.target.checked ? skill : '')}
                className="w-4 h-4 accent-blue-600 cursor-pointer" />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hourly Rate ($)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minRate}
            onChange={(e) => updateFilter('minRate', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-colors" />
          <input type="number" placeholder="Max" value={filters.maxRate}
            onChange={(e) => updateFilter('maxRate', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-colors" />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Sort By</p>
        <select value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-colors">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} icon={<X size={14} />} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="pt-[68px] min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-1">Find Your Mentor</h1>
          <p className="text-slate-500 text-sm">Browse {pagination?.total ?? '500+'} verified mentors</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 min-w-60 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(e) => debounceSearch(e.target.value)}
              placeholder="Search mentors by name, skill, or topic…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>
          <select value={filters.sortBy} onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-colors">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Button variant="outline" icon={<SlidersHorizontal size={14} />}
            onClick={() => setShowMobileFilters(!showMobileFilters)} className="md:hidden">
            Filters
          </Button>
        </div>

        <div className="flex gap-7">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-bold text-sm text-slate-900 dark:text-white">Filters</span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-blue-600 font-semibold hover:text-blue-700">Clear</button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile filters */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <div className="relative ml-auto w-72 bg-white dark:bg-slate-900 h-full overflow-y-auto p-5">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display font-bold text-slate-900 dark:text-white">Filters</span>
                  <button onClick={() => setShowMobileFilters(false)}><X size={20} className="text-slate-400" /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-sm text-slate-500">
                {isFetching ? 'Loading…' : `${pagination?.total ?? mentors.length} mentors found`}
              </p>
              {filters.skill && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                  {filters.skill}
                  <button onClick={() => updateFilter('skill', '')}><X size={10} /></button>
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array(9).fill(0).map((_, i) => <MentorCardSkeleton key={i} />)}
              </div>
            ) : mentors.length === 0 ? (
              <Empty icon="🔍" title="No mentors found"
                description="Try adjusting your filters or search term"
                action={<Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {mentors.map((m) => <MentorCard key={m.id} mentor={m} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={(filters.page ?? 1) <= 1}
                  onClick={() => updateFilter('page', (filters.page ?? 1) - 1)}>← Prev</Button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => updateFilter('page', p)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${filters.page === p ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'}`}>
                      {p}
                    </button>
                  );
                })}
                <Button variant="outline" size="sm" disabled={(filters.page ?? 1) >= pagination.pages}
                  onClick={() => updateFilter('page', (filters.page ?? 1) + 1)}>Next →</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
