'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Booking } from './types';

interface RequestsTabProps {
    booking: Booking;
    checkins: any[];
    t: any;
}

export function RequestsTab({
    booking,
    checkins,
    t
}: RequestsTabProps) {
    return (
        <TabsContent value="requests" className="space-y-6">
            {/* Customer Check-ins */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <CheckCircle2 className="w-5 h-5 text-primary" /> {t('checkins')}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                        {(checkins && checkins.length > 0) ? '1' : '0'} {t('items')}
                    </span>
                </div>
                <div className="space-y-4">
                    {!checkins || checkins.length === 0 ? (
                        <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                            <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-muted-foreground text-sm">{t('noCheckins')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {(() => {
                                // Get only the latest check-in
                                const latestCheckin = checkins[0];
                                return (
                                    <div key={latestCheckin.id} className="p-4 bg-muted/10 border border-border rounded-xl space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${latestCheckin.hasChanges ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                    {latestCheckin.hasChanges ? 'Changes Requested' : 'Confirmed'}
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(latestCheckin.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase text-muted-foreground font-bold">Guest Split</p>
                                                <p className="text-sm">
                                                    Total: <span className="font-semibold">{latestCheckin.newGuestCount}</span>
                                                    <span className="text-muted-foreground ml-2">({(latestCheckin.vegetarianCount || 0) + (latestCheckin.veganCount || 0)} Veg / {latestCheckin.nonVegetarianCount} Non-Veg)</span>
                                                </p>
                                            </div>
                                            {latestCheckin.guestCountChanged && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase text-amber-600 font-bold">Guest Count Changed</p>
                                                    <p className="text-xs italic">Client reported a change in total guests.</p>
                                                </div>
                                            )}
                                        </div>

                                        {latestCheckin.menuChanges && (
                                            <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border/50">
                                                <p className="text-[10px] uppercase text-primary font-bold">Menu Changes</p>
                                                <p className="text-sm italic line-clamp-3" title={latestCheckin.menuChanges}>{latestCheckin.menuChanges}</p>
                                            </div>
                                        )}

                                        {latestCheckin.additionalDetails && (
                                            <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border/50">
                                                <p className="text-[10px] uppercase text-primary font-bold">Additional Details</p>
                                                <p className="text-sm italic line-clamp-3" title={latestCheckin.additionalDetails}>{latestCheckin.additionalDetails}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </TabsContent>
    );
}
