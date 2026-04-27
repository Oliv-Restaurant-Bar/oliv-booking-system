'use client';

import React from 'react';
import { MessageSquare, Send, History, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabsContent } from '@/components/ui/tabs';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { Tooltip } from '@/components/user/Tooltip';
import { BookingComment } from './types';
import { getAvatarColor } from './utils';

interface CommentItemProps {
    contact: BookingComment;
    t: any;
    commonT: any;
}

function CommentItem({ contact, t, commonT }: CommentItemProps) {
    const isSystem = contact.type === 'system';

    return (
        <div className={cn(
            "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
            isSystem
                ? "bg-muted/30 border-border/50"
                : "bg-background border-border hover:border-primary/30 hover:shadow-sm"
        )}>
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                style={{
                    backgroundColor: isSystem ? '#64748b' : getAvatarColor(contact.by),
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)'
                }}
            >
                {isSystem ? <Info className="w-5 h-5" /> : contact.by.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                    <span className="text-foreground font-bold" style={{ fontSize: 'var(--text-base)' }}>
                        {contact.by}
                    </span>
                    {isSystem && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {t('system')}
                        </span>
                    )}
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5 ml-auto sm:ml-0">
                        <span className="hidden sm:inline">•</span>
                        {contact.date} {commonT('at')} {contact.time}
                    </span>
                </div>
                <p
                    className={cn(
                        "text-foreground leading-relaxed line-clamp-3 break-words",
                        isSystem ? "text-muted-foreground italic" : "text-foreground font-medium"
                    )}
                    style={{ fontSize: 'var(--text-base)' }}
                    title={contact.action}
                >
                    {contact.action}
                </p>
            </div>
        </div>
    );
}

interface CommentsActivitiesTabProps {
    comments: BookingComment[];
    newComment: string;
    setNewComment: (val: string) => void;
    handleAddComment: () => void;
    isAddingComment: boolean;
    t: any;
    commonT: any;
    canEditBooking: boolean;
    isReadOnlyStatus: boolean;
    readOnlyTooltip: string;
    errors: any;
    setErrors: (val: any) => void;
}

export function CommentsActivitiesTab({
    comments,
    newComment,
    setNewComment,
    handleAddComment,
    isAddingComment,
    t,
    commonT,
    canEditBooking,
    isReadOnlyStatus,
    readOnlyTooltip,
    errors,
    setErrors
}: CommentsActivitiesTabProps) {
    return (
        <TabsContent value="comments-activities" className="space-y-6">
            {/* Manual Comments Section */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                    <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="truncate">{t('manualComments')}</span>
                    </h3>
                    <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                        {comments.filter(c => c.type !== 'system').length}
                    </span>
                </div>
                <div className="space-y-4">
                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 -mr-2 scrollbar-thin">
                        {comments.filter(c => c.type !== 'system').length === 0 ? (
                            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">{t('noComments')}</p>
                            </div>
                        ) : (
                            comments
                                .filter(c => c.type !== 'system')
                                .slice()
                                .reverse()
                                .map((contact, index) => (
                                    <CommentItem key={index} contact={contact} t={t} commonT={commonT} />
                                ))
                        )}
                    </div>

                    {canEditBooking && (
                        <div className="pt-4 border-t border-border/50">
                            <ValidatedTextarea
                                value={newComment}
                                onChange={(e) => {
                                    setNewComment(e.target.value);
                                    if (errors.comment) setErrors({ ...errors, comment: undefined });
                                }}
                                placeholder={t('commentPlaceholder')}
                                rows={3}
                                maxLength={500}
                                showCharacterCount={false}
                                error={errors.comment}
                                className="focus:ring-1 focus:ring-primary/20 border-border/60"
                                actionContainerClassName="flex items-center gap-3"
                            >
                                <span className="text-[10px] tabular-nums font-semibold uppercase tracking-wider text-muted-foreground/60">
                                    {newComment.length} / 500
                                </span>
                                <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""} position="bottom">
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || isAddingComment || isReadOnlyStatus}
                                        className={cn(
                                            "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 font-semibold shadow-sm shadow-primary/10 hover:shadow-primary/20 active:scale-95",
                                            (isAddingComment || isReadOnlyStatus) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                        )}
                                        style={{ fontSize: 'var(--text-small)' }}
                                    >
                                        {isAddingComment ? (
                                            <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-3.5 h-3.5" />
                                        )}
                                        <span>{t('addComment')}</span>
                                    </button>
                                </Tooltip>
                            </ValidatedTextarea>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Log Section */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                    <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <History className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="truncate">{t('activityLog')}</span>
                    </h3>
                    <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                        {comments.filter(c => c.type === 'system').length}
                    </span>
                </div>
                <div className="space-y-4">
                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 -mr-2 scrollbar-thin">
                        {comments.filter(c => c.type === 'system').length === 0 ? (
                            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                <History className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">{t('noActivity')}</p>
                            </div>
                        ) : (
                            comments
                                .filter(c => c.type === 'system')
                                .slice()
                                .reverse()
                                .map((contact, index) => (
                                    <CommentItem key={index} contact={contact} t={t} commonT={commonT} />
                                ))
                        )}
                    </div>
                </div>
            </div>
        </TabsContent>
    );
}
