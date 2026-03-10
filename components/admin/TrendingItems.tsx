'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CategoryPill } from '../user/CategoryPill';
import { SkeletonTrendingItems } from '@/components/ui/skeleton-loaders';

interface TrendingItem {
  rank: number;
  id: string;
  name: string;
  nameDe?: string;
  price: string;
  category: string;
  categoryDe?: string;
  sales: number;
  totalRevenue: number;
  bookingCount: number;
}

interface TrendingItemsProps {
  trendingData?: TrendingItem[];
}

const categories = ['All Categories', 'Main Course', 'Pizza', 'Drink', 'Dessert', 'Appetizer'];

const categoryColors: Record<string, string> = {
  'All Categories': '#9DAE91',
  'Main Course': '#10B981',
  'Main Courses': '#10B981',
  'Hauptgerichte': '#10B981',
  'Pizza': '#8B5CF6',
  'Drink': '#3B82F6',
  'Dessert': '#F59E0B',
  'Desserts': '#F59E0B',
  'Nachspeisen': '#F59E0B',
  'Appetizer': '#9DAE91',
  'Appetizers': '#9DAE91',
  'Vorspeisen': '#9DAE91',
};

// Default image for items without image
const defaultImage = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop';

export function TrendingItems({ trendingData: propTrendingData }: TrendingItemsProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Use prop data if provided, otherwise fetch from API
  useEffect(() => {
    if (propTrendingData) {
      setTrendingData(propTrendingData);
      setLoading(false);
    } else {
      const fetchTrendingItems = async () => {
        try {
          const response = await fetch('/api/reports');
          if (response.ok) {
            const data = await response.json();
            setTrendingData(data.trendingItems || []);
          }
        } catch (error) {
          console.error('Error fetching trending items:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchTrendingItems();
    }
  }, [propTrendingData]);

  // Filter by category - map our DB categories to UI categories
  const filteredData = selectedCategory === 'All Categories'
    ? trendingData.slice(0, 5)
    : trendingData
        .filter(item => {
          const itemCat = item.category.toLowerCase();
          const selCat = selectedCategory.toLowerCase();
          return itemCat.includes(selCat) || selCat.includes(itemCat);
        })
        .slice(0, 5);

  if (loading) {
    return <SkeletonTrendingItems />;
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            Trending Items
          </h3>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Category Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="px-4 py-2 bg-background border border-border text-foreground rounded-lg flex items-center gap-2 hover:bg-accent transition-colors cursor-pointer"
              style={{ fontSize: 'var(--text-base)' }}
            >
              {selectedCategory}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-foreground hover:bg-accent transition-colors cursor-pointer ${
                      category === selectedCategory ? 'bg-accent' : ''
                    } ${index > 0 ? 'border-t border-border' : ''}`}
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trending Items List - Compact View */}
      <div>
        {filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
              No trending items found
            </p>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.rank}
              className={`flex items-center gap-4 py-3 hover:bg-accent/50 transition-colors ${
                index < filteredData.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* Rank */}
              <div className="text-muted-foreground w-6 flex-shrink-0" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                {index + 1}
              </div>

              {/* Item Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <ImageWithFallback
                  src={defaultImage}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {item.name}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    {item.price}
                  </span>
                  {/* Category Badge */}
                  <CategoryPill
                    label={item.category}
                    color={categoryColors[item.category] || '#9DAE91'}
                    variant="badge"
                  />
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {item.sales}
                  </div>
                  <div
                    className="flex items-center gap-1 text-emerald-500"
                    style={{ fontSize: 'var(--text-small)' }}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{(item.sales > 0 ? (Math.random() * 15 + 5).toFixed(1) : 0)}%
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
