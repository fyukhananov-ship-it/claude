import React from 'react';

export function OfferCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="bg-gray-100 rounded-xl p-3 mb-3">
        <div className="h-6 bg-gray-200 rounded w-20 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="h-12 bg-gray-200 rounded-xl w-full" />
    </div>
  );
}

export function TransactionCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 animate-pulse flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-gray-200" />
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-32" />
          <div className="h-5 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}
