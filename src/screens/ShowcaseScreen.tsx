import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  SearchBar,
  FilterBar,
  CategoryScroll,
  OfferCard,
  OfferCardSkeleton,
  EmptyState,
} from '../components';
import { useApp } from '../context/AppContext';
import { categories } from '../data/mockData';
import { SearchX } from 'lucide-react';

export function ShowcaseScreen() {
  const navigate = useNavigate();
  const {
    filteredOffers,
    activatedOffers,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    activateOffer,
    isLoading,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    if (id === 'all') {
      setFilters({ ...filters, category: undefined });
    } else {
      setFilters({ ...filters, category: id });
    }
  };

  const handleActivate = async (offerId: string) => {
    setActivatingId(offerId);
    try {
      await activateOffer(offerId);
      navigate(`/offer/${offerId}?activated=true`);
    } finally {
      setActivatingId(null);
    }
  };

  const isOfferActivated = (offerId: string) => {
    return activatedOffers.some(o => o.id === offerId);
  };

  // Featured offers for "Для вас" section
  const featuredOffers = filteredOffers.filter(o => o.featured).slice(0, 3);
  const restOffers = filteredOffers.filter(o => !o.featured || featuredOffers.length === 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="px-4 pt-safe">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold text-gray-900">Выгоды</h1>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="pb-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Партнёр или категория"
            />
          </div>

          {/* Filters */}
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Categories */}
        <CategoryScroll
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />

        {isLoading ? (
          <div className="space-y-4 mt-4">
            <OfferCardSkeleton />
            <OfferCardSkeleton />
            <OfferCardSkeleton />
          </div>
        ) : filteredOffers.length === 0 ? (
          <EmptyState
            icon={<SearchX className="w-8 h-8" />}
            title="Ничего не найдено"
            description="Попробуйте изменить фильтры или поисковый запрос"
            action={{
              label: 'Сбросить фильтры',
              onClick: () => {
                setFilters({
                  paymentMethod: 'all',
                  format: 'all',
                  onlyAvailable: false,
                  validityPeriod: 'any',
                });
                setSearchQuery('');
                setSelectedCategory('all');
              },
            }}
          />
        ) : (
          <>
            {/* Featured section */}
            {featuredOffers.length > 0 && !searchQuery && (
              <section className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Для вас
                </h2>
                <div className="space-y-3">
                  {featuredOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onClick={() => navigate(`/offer/${offer.id}`)}
                      onActivate={() => handleActivate(offer.id)}
                      isActivated={isOfferActivated(offer.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All offers */}
            <section className="mt-6">
              {featuredOffers.length > 0 && !searchQuery && (
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Все предложения
                </h2>
              )}
              <div className="space-y-3">
                {restOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onClick={() => navigate(`/offer/${offer.id}`)}
                    onActivate={() => handleActivate(offer.id)}
                    isActivated={isOfferActivated(offer.id)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
