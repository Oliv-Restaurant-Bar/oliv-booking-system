'use client';

import { useState } from 'react';
import { Plus, Search, Eye, Edit2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: number;
  isActive: boolean;
  addons: string[];
}

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Bom Wraps',
    description: '32cm All dishes are served with homemade wheat tortillas.',
    image: 'https://images.unsplash.com/photo-1541980294979-572cb9d973fd?w=400&h=400&fit=crop',
    category: 'Main Course',
    price: 12.50,
    isActive: true,
    addons: ['Deine Wurst', 'Deine Sauce 1'],
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce and mozzarella',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    category: 'Pizza',
    price: 15.00,
    isActive: true,
    addons: [],
  },
  {
    id: '3',
    name: 'Antipasti Platter',
    description: 'Perfect to begin your meal',
    image: 'https://images.unsplash.com/photo-1758384077555-36242d3f2b4d?w=400&h=400&fit=crop',
    category: 'Starters',
    price: 8.50,
    isActive: true,
    addons: [],
  },
  {
    id: '4',
    name: 'Tiramisu',
    description: 'Classic Italian dessert',
    image: 'https://images.unsplash.com/photo-1705948731485-6e4c6c180d0d?w=400&h=400&fit=crop',
    category: 'Desserts',
    price: 6.50,
    isActive: false,
    addons: [],
  },
  {
    id: '5',
    name: 'Burger Jumbo Special',
    description: 'Double beef patty with melted cheese, lettuce, tomato, and our special sauce',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop',
    category: 'Main Course',
    price: 18.90,
    isActive: true,
    addons: ['Extra Cheese', 'Bacon'],
  },
  {
    id: '6',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan, croutons and Caesar dressing',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop',
    category: 'Starters',
    price: 11.50,
    isActive: true,
    addons: ['Grilled Chicken'],
  },
];

export function MenuConfigPageCardVariant() {
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Main Course': '#10B981',
      'Pizza': '#8B5CF6',
      'Starters': '#3B82F6',
      'Desserts': '#F59E0B',
    };
    return colors[category] || '#9DAE91';
  };

  return (
    <div className="px-8 pt-3 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
            Menu Configuration
          </h2>
          <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
            Manage your menu items and choice groups
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Advanced Search</span>
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Add Item</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search menu items by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ fontSize: 'var(--text-base)' }}
          />
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItems.map((item) => (
          <div
            key={item.id}
            className="bg-secondary rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Card Content */}
            <div className="flex gap-4 p-4">
              {/* Item Image */}
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  />
                  <span 
                    className="text-white"
                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Item Name */}
                <h3 
                  className="text-white mb-2"
                  style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {item.name}
                </h3>

                {/* Description */}
                <p 
                  className="text-gray-300 mb-3 line-clamp-2"
                  style={{ fontSize: 'var(--text-small)' }}
                >
                  {item.description}
                </p>

                {/* Price & Addons */}
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="text-white"
                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                  >
                    CHF {item.price.toFixed(2)}
                  </span>
                  {item.addons.length > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span 
                        className="text-gray-300"
                        style={{ fontSize: 'var(--text-small)' }}
                      >
                        {item.addons.length} addon{item.addons.length > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>

                {/* Status Badge */}
                {!item.isActive && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span 
                      className="text-gray-300"
                      style={{ fontSize: 'var(--text-small)' }}
                    >
                      Hidden
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 px-4 pb-4">
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Add Menu
                </span>
              </button>
              <button className="flex-1 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  View Menu
                </span>
              </button>
              <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center justify-center">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6">
        <p className="text-muted-foreground text-center" style={{ fontSize: 'var(--text-small)' }}>
          Showing {filteredMenuItems.length} of {menuItems.length} items
        </p>
      </div>

      {/* Copyright Footer */}
      <div className="text-center pt-8 pb-2">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
      </div>
    </div>
  );
}

// Export as MenuConfigPage for App.tsx import
export { MenuConfigPageCardVariant as MenuConfigPage };