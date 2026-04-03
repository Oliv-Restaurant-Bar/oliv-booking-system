'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CategoryPill } from '../user/CategoryPill';
import { SkeletonTrendingItems } from '@/components/ui/skeleton-loaders';
import { useTranslations, useLocale } from 'next-intl';
import { useCommonTranslation } from '@/lib/i18n/client';

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
  image?: string | null;
}

interface TrendingItemsProps {
  trendingData?: TrendingItem[];
}

// Generate a consistent color for any category based on its name
const getCategoryColor = (categoryName: string): string => {
  const colors = [
    '#9DAE91', // Default green
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ];

  // Simple hash function to pick a consistent color
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Default image for items without image

export function TrendingItems({ trendingData: propTrendingData }: TrendingItemsProps) {
  const t = useTranslations('admin.reports');
  const commonT = useCommonTranslation();
  const locale = useLocale();

  const [categories, setCategories] = useState<{ value: string; label: string }[]>([
    { value: 'All Categories', label: t('allCategories') }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu');
        if (response.ok) {
          const data = await response.json();
          const dbCategories = data.categories || [];

          // Transform database categories to filter options
          const categoryOptions = dbCategories.map((cat: any) => ({
            value: cat.name,
            label: locale === 'de' && cat.nameDe ? cat.nameDe : cat.name
          }));

          // Sort categories alphabetically (excluding "All Categories")
          categoryOptions.sort((a: any, b: any) => a.label.localeCompare(b.label));

          setCategories([
            { value: 'All Categories', label: t('allCategories') },
            ...categoryOptions
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [locale, t]);

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

  // Filter by category - exact match with database categories
  const filteredData = selectedCategory === 'All Categories'
    ? trendingData.slice(0, 5)
    : trendingData
      .filter(item => {
        // Use exact category matching
        return item.category === selectedCategory;
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
            {t('trendingItems')}
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
              {categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
                {categories.map((category, index) => (
                  <button
                    key={category.value}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-foreground hover:bg-accent transition-colors cursor-pointer ${category.value === selectedCategory ? 'bg-accent' : ''
                      } ${index > 0 ? 'border-t border-border' : ''}`}
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    {category.label}
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
              {t('noTrendingItems')}
            </p>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.rank}
              className={`flex items-center gap-4 py-3 hover:bg-accent/50 transition-colors ${index < filteredData.length - 1 ? 'border-b border-border' : ''
                }`}
            >
              {/* Rank */}
              <div className="text-muted-foreground w-6 flex-shrink-0" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                {index + 1}
              </div>

              {/* Item Image */}
              {item.image && (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
              )}


              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }} title={item.name}>
                  {locale === 'de' && item.nameDe ? item.nameDe : item.name}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    {item.price}
                  </span>
                  {/* Category Badge */}
                  <CategoryPill
                    label={locale === 'de' && item.categoryDe ? item.categoryDe : item.category}
                    color={getCategoryColor(item.category)}
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
