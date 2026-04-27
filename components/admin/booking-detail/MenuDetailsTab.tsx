'use client';

import React from 'react';
import { UtensilsCrossed, Pencil, X, Save, Users, Package, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabsContent } from '@/components/ui/tabs';
import { Tooltip } from '@/components/user/Tooltip';
import { DietaryIcon } from '@/components/user/DietaryIcon';
import { Booking } from './types';
import { CATEGORY_ORDER, parseDietaryNotes } from './utils';

interface MenuDetailsTabProps {
    booking: Booking;
    isEditingMenu: boolean;
    setIsEditingMenu: (val: boolean) => void;
    tempMenuItems: any[];
    setTempMenuItems: (val: any[]) => void;
    handleEditMenu: () => void;
    handleSaveMenu: () => void;
    handleCancelMenu: () => void;
    handleEditItems: () => void;
    dietarySummary: any;
    t: any;
    wizardT: any;
    commonT: any;
    buttonT: any;
    canEditBooking: boolean;
    isLocked: boolean;
    isReadOnlyStatus: boolean;
    readOnlyTooltip: string;
    isSaving: boolean;
    allCategories: any[];
}

export function MenuDetailsTab({
    booking,
    isEditingMenu,
    setIsEditingMenu,
    tempMenuItems,
    setTempMenuItems,
    handleEditMenu,
    handleSaveMenu,
    handleCancelMenu,
    handleEditItems,
    dietarySummary,
    t,
    wizardT,
    commonT,
    buttonT,
    canEditBooking,
    isLocked,
    isReadOnlyStatus,
    readOnlyTooltip,
    isSaving,
    allCategories
}: MenuDetailsTabProps) {
    return (
        <TabsContent value="menu-details" className="space-y-6">
            {/* Menu Items */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                    <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <UtensilsCrossed className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="truncate">{t('menuItems')}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {canEditBooking && !isLocked && !isEditingMenu && (
                            <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                <button
                                    onClick={handleEditMenu}
                                    disabled={isReadOnlyStatus}
                                    className={cn(
                                        "px-3 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary flex items-center gap-2",
                                        isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                    )}
                                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>{buttonT('edit')}</span>
                                </button>
                            </Tooltip>
                        )}
                        {canEditBooking && !isLocked && !isEditingMenu && (
                            <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                <button
                                    onClick={handleEditItems}
                                    disabled={isReadOnlyStatus}
                                    className={cn(
                                        "px-3 py-1.5 border border-border hover:bg-primary hover:text-secondary rounded-lg transition-colors bg-secondary text-white flex items-center gap-2",
                                        isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                    )}
                                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                >
                                    <UtensilsCrossed className="w-3.5 h-3.5" />
                                    <span>{commonT('editItems')}</span>
                                </button>
                            </Tooltip>
                        )}
                        {isEditingMenu && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancelMenu}
                                    disabled={isSaving}
                                    className="px-3 py-1.5 border border-border hover:bg-red-600 hover:text-white rounded-lg transition-colors bg-red-500 text-white hover:text-red-500 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                >
                                    <X className="w-4 h-4" />
                                    <span>{buttonT('cancel')}</span>
                                </button>
                                <button
                                    onClick={handleSaveMenu}
                                    disabled={isSaving}
                                    className="px-3 py-1.5 border border-border hover:bg-secondary rounded-lg transition-colors bg-primary text-secondary hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-green-600/30 border-t-transparent rounded-full animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>{buttonT('save')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-background border border-border rounded-lg overflow-x-auto -mx-2 sm:mx-0">
                    <table className="w-full min-w-[500px] sm:min-w-0">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-3 py-3 text-left text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{commonT('item')}</th>
                                <th className="px-3 py-3 text-left text-foreground text-xs sm:text-sm hidden sm:table-cell" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{commonT('category')}</th>
                                <th className="px-3 py-3 text-left text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('quantity')}</th>
                                <th className="px-3 py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{buttonT('price')}</th>
                                <th className="px-3 py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('internalCost')}</th>
                                <th className="px-3 py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('profit')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const items = (isEditingMenu ? tempMenuItems : booking.menuItems) || [];
                                const getSortIndex = (catName: string) => {
                                    if (!catName) return 999;
                                    if (!allCategories || allCategories.length === 0) {
                                        const idx = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === catName.toLowerCase());
                                        return idx === -1 ? 998 : idx;
                                    }
                                    const cat = allCategories.find(c => 
                                        c.name?.toLowerCase() === catName.toLowerCase() || 
                                        c.nameDe?.toLowerCase() === catName.toLowerCase()
                                    );
                                    return cat ? (cat.sortOrder ?? 0) : 997;
                                };

                                const sortedItems = [...items].sort((a, b) => {
                                    const idxA = getSortIndex(a.category);
                                    const idxB = getSortIndex(b.category);
                                    if (idxA !== idxB) return idxA - idxB;
                                    return (a.item || a.name || '').localeCompare(b.item || b.name || '');
                                });
                                
                                const isBevCategory = (cat: string) => 
                                    ['Beverages', 'Drink', 'Drinks', 'Softdrinks', 'Wein', 'Bier', 'Kaffee', 'Wine', 'Beer', 'Getränk', 'Getränke', 'Spirituosen', 'Spirits', 'Cocktails', 'Longdrinks', 'Digestif'].some(c => c.toLowerCase() === (cat || '').toLowerCase());
                                
                                const isFlatFee = (item: any) => 
                                    item.pricingType === 'flat-rate' || item.pricingType === 'flat_fee' || (item.category || '').toLowerCase() === 'add-ons' || (item.category || '').toLowerCase() === 'extra';

                                const foodItems = sortedItems.filter(item => !isBevCategory(item.category) && !isFlatFee(item));
                                const beverageItems = sortedItems.filter(item => isBevCategory(item.category));
                                const addonItems = sortedItems.filter(item => isFlatFee(item) && !isBevCategory(item.category));

                                const groups = [
                                    { name: 'Food Items', items: foodItems },
                                    { name: 'Beverages', items: beverageItems },
                                    { name: 'Add-ons', items: addonItems }
                                ].filter(g => g.items.length > 0);

                                if (groups.length === 0) {
                                    return <tr><td colSpan={6} className="px-3 py-6 sm:py-8 text-center text-muted-foreground text-xs sm:text-sm">{t('noItemsSelected')}</td></tr>;
                                }

                                return groups.map((group, groupIdx) => (
                                    <React.Fragment key={group.name}>
                                        <tr className="bg-muted/40 group-header">
                                            <td colSpan={6} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-t border-border bg-muted/20">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                    {group.name}
                                                </div>
                                            </td>
                                        </tr>
                                        {group.items.map((item: any, idx: number) => (
                                            <tr key={item.id || item.itemId || `row-${groupIdx}-${idx}`} className="border-t border-border/50 hover:bg-muted/10 transition-colors">
                                                <td className="px-3 py-3 text-foreground text-xs sm:text-sm">
                                                    <div className="flex flex-col gap-1.5 py-1">
                                                        <div className="flex flex-wrap items-center gap-x-2 font-medium text-foreground" title={item.item || item.name}>
                                                            <div className="flex items-center gap-x-1">
                                                                {item.dietaryType && item.dietaryType !== 'none' && (
                                                                    <DietaryIcon type={item.dietaryType} size="sm" />
                                                                )}
                                                                <span className="truncate max-w-[200px] sm:max-w-[300px] inline-block" title={item.item || item.name}>{item.item || item.name}</span>
                                                                {item.variant && (
                                                                    <span className="ml-1.5 text-muted-foreground font-normal">
                                                                        ({item.variant})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {item.notes && (
                                                            <div className="flex items-start gap-1.5 text-primary/80">
                                                                <UtensilsCrossed className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                <span className="text-[12px] leading-tight font-medium inline-flex items-center flex-wrap gap-x-0.5 line-clamp-2" title={item.notes}>
                                                                    {parseDietaryNotes(item.notes)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {item.customerComment && (
                                                            <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-500">
                                                                <MessageSquare className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                <span className="text-[12px] italic leading-tight line-clamp-2" title={item.customerComment}>
                                                                    Note: {item.customerComment}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-muted-foreground text-xs sm:text-sm hidden sm:table-cell" title={item.category}>{item.category}</td>
                                                <td className="px-3 py-3 text-foreground text-xs sm:text-sm">
                                                    {isEditingMenu ? (
                                                        <div className="flex items-center gap-2" translate="no">
                                                            <input
                                                                type="number"
                                                                value={item.rawQuantity}
                                                                min="1"
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    const targetId = item.id || item.itemId;
                                                                    const newItems = tempMenuItems.map(ti => {
                                                                        if ((ti.id || ti.itemId) === targetId) {
                                                                            return { ...ti, rawQuantity: isNaN(val) ? 0 : Math.max(0, val) };
                                                                        }
                                                                        return ti;
                                                                    });
                                                                    setTempMenuItems(newItems);
                                                                }}
                                                                onBlur={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (isNaN(val) || val < 1) {
                                                                        const targetId = item.id || item.itemId;
                                                                        const newItems = tempMenuItems.map(ti => {
                                                                            if ((ti.id || ti.itemId) === targetId) {
                                                                                return { ...ti, rawQuantity: 1 };
                                                                            }
                                                                            return ti;
                                                                        });
                                                                        setTempMenuItems(newItems);
                                                                    }
                                                                }}
                                                                className="w-20 px-2 py-1 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                            />
                                                            <Tooltip title={`${item.item || item.name}: ${item.rawQuantity} ${item.pricingType === 'per_person' ? t('guests') : t('quantity')}`}>
                                                                <span className="text-muted-foreground">
                                                                    {item.pricingType === 'per_person' ? (
                                                                        <Users className="w-3.5 h-3.5" />
                                                                    ) : (
                                                                        <Package className="w-3.5 h-3.5" />
                                                                    )}
                                                                </span>
                                                            </Tooltip>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5" translate="no">
                                                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                                <span className="font-medium text-foreground">{item.rawQuantity}</span>
                                                                <Tooltip title={`${item.item || item.name}: ${item.rawQuantity} ${item.pricingType === 'per_person' ? t('guests') : t('quantity')}`}>
                                                                    {item.pricingType === 'per_person' ? (
                                                                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    ) : (
                                                                        <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                                                    )}
                                                                </Tooltip>
                                                            </div>
                                                            <div className="text-xs sm:text-xs text-muted-foreground whitespace-nowrap">
                                                                x {Math.round(item.unitPrice || 0)} CHF
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-semibold)' }} translate="no">
                                                    {isEditingMenu ? (
                                                        <span>CHF {((item.rawQuantity || 0) * (item.unitPrice || 0)).toFixed(2)}</span>
                                                    ) : (
                                                        <span>{item.price}</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm whitespace-nowrap" translate="no">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="font-medium text-foreground">
                                                            CHF {((item.rawQuantity || 0) * (item.internalCost || 0)).toFixed(2)}
                                                        </div>
                                                        <div className="text-xs sm:text-xs text-muted-foreground whitespace-nowrap">
                                                            x {item.internalCost || 0} CHF
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-semibold)' }} translate="no">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="font-bold text-primary text-xs sm:text-sm">
                                                            CHF {((item.rawQuantity || 0) * ((item.unitPrice || 0) - (item.internalCost || 0))).toFixed(2)}
                                                        </div>
                                                        <div className="text-xs sm:text-xs text-muted-foreground whitespace-nowrap">
                                                            x {((item.unitPrice || 0) - (item.internalCost || 0)).toFixed(2)} CHF
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ));
                            })()}
                            {booking.menuItems && booking.menuItems.length > 0 && (
                                <tr className="border-t-2 border-border bg-muted">
                                    <td colSpan={2} className="px-3 py-3 text-foreground text-xs sm:text-sm sm:hidden" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('totalAmount')}</td>
                                    <td colSpan={3} className="px-3 py-3 text-foreground text-xs sm:text-sm hidden sm:table-cell" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('totalAmount')}</td>
                                    <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm font-bold" translate="no">
                                        {isEditingMenu ? (
                                            <span>CHF {tempMenuItems.reduce((sum, item) => sum + ((item.rawQuantity || 0) * (item.unitPrice || 0)), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        ) : (
                                            <span>{booking.amount}</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm font-bold text-foreground whitespace-nowrap" translate="no">
                                        <span>
                                            CHF {(isEditingMenu ? tempMenuItems : booking.menuItems)!.reduce((sum, item) => sum + ((item.rawQuantity || 0) * (item.internalCost || 0)), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm font-bold whitespace-nowrap" translate="no">
                                        <span className="bg-primary px-2.5 py-1 rounded-lg shadow-sm inline-block">
                                            CHF {(isEditingMenu ? tempMenuItems : booking.menuItems)!.reduce((sum, item) => sum + ((item.rawQuantity || 0) * ((item.unitPrice || 0) - (item.internalCost || 0))), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dietary Summary Section */}
            {(dietarySummary.veg.count > 0 || dietarySummary.nonVeg.count > 0) && (
                <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <UtensilsCrossed className="w-5 h-5 text-primary" /> {t('dietarySelection')}
                    </h3>
                    <div className="space-y-4">
                        {dietarySummary.veg.count > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    <DietaryIcon type="veg" size="sm" />
                                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                        Veg Selection ({dietarySummary.veg.count} {dietarySummary.veg.count > 1 ? 'items' : 'item'})
                                    </span>
                                </div>
                                <span className="text-foreground font-bold">CHF {dietarySummary.veg.subtotal.toFixed(2)}</span>
                            </div>
                        )}
                        {dietarySummary.nonVeg.count > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                    <DietaryIcon type="non-veg" size="sm" />
                                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                        Non-Veg Selection ({dietarySummary.nonVeg.count} {dietarySummary.nonVeg.count > 1 ? 'items' : 'item'})
                                    </span>
                                </div>
                                <span className="text-foreground font-bold">CHF {dietarySummary.nonVeg.subtotal.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </TabsContent>
    );
}
