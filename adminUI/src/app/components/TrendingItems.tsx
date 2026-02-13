import { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CategoryPill } from './CategoryPill';

interface TrendingItem {
  rank: number;
  name: string;
  price: string;
  category: string;
  categoryColor: string;
  sales: number;
  salesChange: number;
  isPositive: boolean;
  image: string;
}

const trendingData: TrendingItem[] = [
  {
    rank: 1,
    name: 'Tuna soup spinach with himalaya salt',
    price: 'CHF 12.58',
    category: 'Main Course',
    categoryColor: '#10B981',
    sales: 524,
    salesChange: 12.1,
    isPositive: true,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop',
  },
  {
    rank: 2,
    name: 'Chicken curry special with cucumber',
    price: 'CHF 14.99',
    category: 'Main Course',
    categoryColor: '#10B981',
    sales: 215,
    salesChange: -2.3,
    isPositive: false,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=400&fit=crop',
  },
  {
    rank: 3,
    name: 'Italiana pizza mozarella with garlic',
    price: 'CHF 14.89',
    category: 'Pizza',
    categoryColor: '#8B5CF6',
    sales: 120,
    salesChange: 5.2,
    isPositive: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
  },
  {
    rank: 4,
    name: 'Watermelon mix chocolate juice with ice',
    price: 'CHF 14.49',
    category: 'Drink',
    categoryColor: '#3B82F6',
    sales: 76,
    salesChange: 12.4,
    isPositive: true,
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop',
  },
  {
    rank: 5,
    name: 'Chicken curry special with cucumber',
    price: 'CHF 14.99',
    category: 'Main Course',
    categoryColor: '#10B981',
    sales: 215,
    salesChange: -2.1,
    isPositive: false,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=400&fit=crop',
  },
];

const categories = ['All Categories', 'Main Course', 'Pizza', 'Drink', 'Dessert', 'Appetizer'];

const categoryColors: Record<string, string> = {
  'All Categories': '#9DAE91',
  'Main Course': '#10B981',
  'Pizza': '#8B5CF6',
  'Drink': '#3B82F6',
  'Dessert': '#F59E0B',
  'Appetizer': '#9DAE91',
};

export function TrendingItems() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 md:mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-primary" />
          </div>
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
              className="px-3 md:px-4 py-2 bg-background border border-border text-foreground rounded-lg flex items-center gap-2 hover:bg-accent transition-colors cursor-pointer min-h-[44px]"
              style={{ fontSize: 'var(--text-base)' }}
            >
              <span className="hidden sm:inline">{selectedCategory}</span>
              <span className="sm:hidden">Filter</span>
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
        {trendingData.map((item, index) => (
          <div
            key={item.rank}
            className={`flex items-center gap-3 md:gap-4 py-3 hover:bg-accent/50 transition-colors ${
              index < trendingData.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            {/* Rank */}
            <div className="text-muted-foreground w-5 md:w-6 flex-shrink-0" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
              {item.rank}
            </div>

            {/* Item Image */}
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <ImageWithFallback 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {item.name}
              </h4>
              <div className="flex items-center gap-2 md:gap-3 mt-1">
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {item.price}
                </span>
                {/* Category Badge - Hide on small mobile */}
                <div className="hidden sm:block">
                  <CategoryPill 
                    label={item.category}
                    color={item.categoryColor}
                    variant="badge"
                  />
                </div>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <div className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {item.sales}
                </div>
                <div 
                  className={`flex items-center gap-1 justify-end ${item.isPositive ? 'text-emerald-500' : 'text-red-500'}`}
                  style={{ fontSize: 'var(--text-small)' }}
                >
                  {item.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {item.isPositive ? '+' : ''}{item.salesChange}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}