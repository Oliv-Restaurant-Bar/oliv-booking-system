'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { CategoryPill } from '../user/CategoryPill';
import { SkeletonTrendingItems } from '@/components/ui/skeleton-loaders';
import { useTranslations, useLocale } from 'next-intl';
import { useCommonTranslation } from '@/lib/i18n/client';
import { Tooltip } from '@/components/user/Tooltip';


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
  totalInternalCost: number;
  totalProfit: number;
  trendPercentage: number;
  image?: string | null;
  profitMargin?: number;
}

interface TrendingItemsProps {
  trendingData?: TrendingItem[];
  currencySymbol?: string;
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

export function TrendingItems({ trendingData: propTrendingData, currencySymbol = 'CHF' }: TrendingItemsProps) {
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

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-lg mb-2 text-muted-foreground font-semibold uppercase tracking-wider" style={{ fontSize: '11px' }}>
        <div className="col-span-1">#</div>
        <div className="col-span-2">{commonT('name')}</div>
        <div className="col-span-2">{commonT('category')}</div>
        <div className="col-span-1 text-center">{t('salesLabel', { defaultValue: 'Sales' })}</div>
        <div className="col-span-2 text-right">{t('revenue')}</div>
        <div className="col-span-2 text-right">{t('internalCost')}</div>
        <div className="col-span-2 text-right">{t('profit')}</div>
      </div>

      {/* Trending Items List - Table View */}
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
              key={item.id}
              className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-4 hover:bg-accent/50 transition-all duration-200 rounded-xl group border border-transparent hover:border-border`}
            >
              {/* Rank, Image & Name */}
              <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                <div className="text-muted-foreground w-6 font-bold" style={{ fontSize: 'var(--text-base)' }}>
                  {index + 1}
                </div>
                {item.image && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative group-hover:scale-105 transition-transform duration-200">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-semibold truncate" style={{ fontSize: 'var(--text-base)' }} title={item.name}>
                    {locale === 'de' && item.nameDe ? item.nameDe : item.name}
                  </p>
                  <p className="text-muted-foreground md:hidden" style={{ fontSize: 'var(--text-small)' }}>
                    {locale === 'de' && item.categoryDe ? item.categoryDe : item.category}
                  </p>
                </div>
              </div>

              {/* Category (Hidden on mobile as it's under Name) */}
              <div className="hidden md:block col-span-2">
                <CategoryPill
                  label={locale === 'de' && item.categoryDe ? item.categoryDe : item.category}
                  color={getCategoryColor(item.category)}
                  variant="badge"
                />
              </div>

              {/* Sales Count */}
              <div className="hidden md:block col-span-1 text-center text-foreground font-medium" style={{ fontSize: 'var(--text-small)' }}>
                {item.sales}
              </div>

              {/* Revenue */}
              <div className="col-span-6 md:col-span-2 md:text-right flex md:block justify-between items-center">
                <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">{t('revenue')}</span>
                <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-small)' }}>
                  {currencySymbol} {item.totalRevenue.toLocaleString('en-US')}
                </p>
              </div>

              {/* Internal Cost */}
              <div className="col-span-6 md:col-span-2 md:text-right flex md:block justify-between items-center">
                <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">{t('internalCost')}</span>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {currencySymbol} {(item as any).totalInternalCost?.toLocaleString('en-US') || '0'}
                </p>
              </div>

              {/* Profit & Margin */}
              <div className="col-span-12 md:col-span-2 md:text-right flex md:block justify-between items-center pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">{t('profit')}</span>
                <div>
                  <Tooltip title={t('profit')} position='bottom'>
                    <p className="text-primary font-bold inline-block" style={{ fontSize: 'var(--text-small)' }}>
                      {currencySymbol} {item.totalProfit.toLocaleString('en-US')}
                    </p>
                  </Tooltip>
                  <div className="flex items-center gap-1 md:justify-end mt-0.5 text-emerald-600 dark:text-emerald-400" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                    <span>{item.profitMargin}%</span>
                    <span className="text-[10px] opacity-80 uppercase tracking-tight">{t('profitMargin')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculation Logic Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-muted-foreground flex items-center gap-1.5" style={{ fontSize: '11px', lineHeight: '1.4' }}>
          <span className="font-semibold text-foreground/70">{t('marginCalcLabel', { defaultValue: 'Margin Logic:' }) || 'Margin Logic:'}</span>
          <span>{currencySymbol} (Total Revenue - Internal Cost) / Total Revenue  * 100%</span>
        </p>
      </div>
    </div>
  );
}
