'use client';

import { useState } from 'react';
import { Mail, Download, Users, X, Loader2, CheckSquare, ChevronLeft, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface KitchenPdfActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: (action: 'admin' | 'external' | 'download', data?: { emails?: string[]; notes?: string }) => void;
  adminUsers?: AdminUser[];
  isLoadingUsers?: boolean;
  booking: {
    id: string;
    customer: {
      name: string;
    };
    event: {
      date: string;
      time: string;
      occasion: string;
      location?: string;
    };
    guests: number;
    menuItems?: Array<{
      item: string;
      category: string;
      quantity: string;
      price: string;
    }>;
    allergies?: string;
    notes?: string;
  };
}

// Default admin users if none provided
const DEFAULT_ADMIN_USERS: AdminUser[] = [
  { id: '1', name: 'Chef Manager', email: 'chef@oliv.com', role: 'Kitchen Manager' },
  { id: '2', name: 'Sous Chef', email: 'sous@oliv.com', role: 'Sous Chef' },
  { id: '3', name: 'Kitchen Staff', email: 'kitchen@oliv.com', role: 'Kitchen Staff' },
];

export function KitchenPdfActionModal({
  isOpen,
  onClose,
  onActionComplete,
  adminUsers = DEFAULT_ADMIN_USERS,
  isLoadingUsers = false,
  booking
}: KitchenPdfActionModalProps) {
  const [expandedSection, setExpandedSection] = useState<'admin' | 'external' | null>(null);
  const [externalEmails, setExternalEmails] = useState('');
  const [selectedAdminUsers, setSelectedAdminUsers] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Use last 8 characters of UUID for a shorter ID
  const shortId = booking.id.slice(-8);
  const documentName = `Booking #${shortId} – Kitchen Sheet`;

  const toggleSection = (section: 'admin' | 'external') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const toggleAdminUser = (userId: string) => {
    const newSelection = new Set(selectedAdminUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedAdminUsers(newSelection);
  };

  const selectAllAdminUsers = () => {
    if (selectedAdminUsers.size === adminUsers.length) {
      setSelectedAdminUsers(new Set());
    } else {
      setSelectedAdminUsers(new Set(adminUsers.map(u => u.id)));
    }
  };

  const generatePdfContent = () => {
    const menuItems = booking.menuItems || [];

    return `
KITCHEN SHEET - ${documentName}
=====================================

CUSTOMER: ${booking.customer.name}

EVENT DETAILS
==============
Date: ${booking.event.date}
Time: ${booking.event.time}
Occasion: ${booking.event.occasion}
${booking.event.location ? `Location: ${booking.event.location}` : ''}
Guests: ${booking.guests}

MENU ITEMS
===========
${menuItems.length > 0
        ? menuItems.map(item => `${item.item} (${item.category}) - ${item.quantity} - ${item.price}`).join('\n')
        : 'No menu items specified'
      }

ALLERGIES & DIETARY NOTES
==========================
${booking.allergies || 'None specified'}

ADDITIONAL NOTES
================
${booking.notes || 'None'}

Generated: ${new Date().toLocaleString()}
    `.trim();
  };

  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const pdfContent = generatePdfContent();
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      onActionComplete('download');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (action: 'admin' | 'external') => {
    setIsProcessing(true);
    try {
      let emails: string[] = [];
      if (action === 'admin') {
        if (selectedAdminUsers.size === 0) {
          alert('Please select at least one team member');
          setIsProcessing(false);
          return;
        }
        emails = adminUsers.filter(u => selectedAdminUsers.has(u.id)).map(u => u.email);
      } else if (action === 'external') {
        if (!externalEmails.trim()) {
          alert('Please enter at least one email address');
          setIsProcessing(false);
          return;
        }
        emails = externalEmails.split(',').map(e => e.trim()).filter(e => e);
        if (emails.length === 0) {
          alert('Please enter a valid email address');
          setIsProcessing(false);
          return;
        }
      }

      // Persist the send log to the database
      const response = await fetch('/api/kitchen-pdf/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `kitchen-pdf-${booking.id}-${Date.now()}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          documentName,
          sentBy: 'Admin',
          emails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log kitchen PDF send');
      }

      onActionComplete(action, { emails });
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] w-full max-w-[800px] overflow-hidden relative flex flex-col max-h-[90vh]">

          <div className="px-6 py-5 border-b border-border/50 bg-muted/20 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-foreground tracking-tight" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Kitchen Sheet Routing
              </h2>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {documentName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 w-9 h-9 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm mb-2 font-medium">
                Select destination for this document:
              </p>

              {/* Admin Accordion */}
              <div className="relative">
                <button
                  onClick={() => toggleSection('admin')}
                  className={cn(
                    "w-full p-4 bg-background border rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-4 text-left group",
                    expandedSection === 'admin' ? "border-primary shadow-sm" : "border-border/60 hover:border-primary/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]"
                  )}
                  disabled={isProcessing}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-primary/15 transition-all duration-200 text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-semibold mb-0.5">Kitchen Staff</div>
                    <div className="text-muted-foreground text-sm">Send to internal team members</div>
                  </div>
                  <ChevronLeft className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", expandedSection === 'admin' ? "-rotate-90" : "rotate-180")} />
                </button>

                {expandedSection === 'admin' && (
                  <div className="mt-3 p-4 bg-muted/20 border border-border/50 rounded-xl space-y-4">
                    {isLoadingUsers ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Fetching team members...</p>
                      </div>
                    ) : (
                      <>
                        {adminUsers.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground text-sm">
                            No team members found.
                          </div>
                        ) : (
                          <div className="space-y-2 border border-border/50 rounded-xl p-1.5 bg-background max-h-[180px] overflow-y-auto">
                            {adminUsers.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => toggleAdminUser(user.id)}
                                className={cn(
                                  "w-full px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 cursor-pointer group text-left",
                                  selectedAdminUsers.has(user.id) ? "bg-muted/50 shadow-sm border border-border" : "hover:bg-black/5 border border-transparent"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors",
                                  selectedAdminUsers.has(user.id) ? "bg-primary text-primary-foreground" : "border border-muted-foreground/30 text-transparent group-hover:border-muted-foreground/50"
                                )}>
                                  <CheckSquare className="w-3.5 h-3.5 opacity-100" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={cn("text-sm transition-colors truncate", selectedAdminUsers.has(user.id) ? "text-foreground font-medium" : "text-muted-foreground")}>{user.name}</div>
                                  <div className="text-muted-foreground/70 text-xs truncate">{user.email}</div>
                                </div>
                                <div className="text-[11px] font-medium text-muted-foreground bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {user.role}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleSubmit('admin')}
                      disabled={isProcessing || selectedAdminUsers.size === 0}
                      className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/95 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send to Selected
                    </button>
                  </div>
                )}
              </div>

              {/* External User Accordion */}
              <div className="relative">
                <button
                  onClick={() => toggleSection('external')}
                  className={cn(
                    "w-full p-4 bg-background border rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-4 text-left group",
                    expandedSection === 'external' ? "border-purple-500 shadow-sm" : "border-border/60 hover:border-purple-500/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)]"
                  )}
                  disabled={isProcessing}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-all duration-200 text-purple-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-semibold mb-0.5">External User</div>
                    <div className="text-muted-foreground text-sm">Send to specific email addresses</div>
                  </div>
                  <ChevronLeft className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", expandedSection === 'external' ? "-rotate-90" : "rotate-180")} />
                </button>

                {expandedSection === 'external' && (
                  <div className="mt-3 p-4 bg-muted/20 border border-border/50 rounded-xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Recipient Emails</label>
                      <p className="text-xs text-muted-foreground">To send to multiple people, add their emails comma separated.</p>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="kitchen@example.com, chef@example.com"
                          value={externalEmails}
                          onChange={(e) => setExternalEmails(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleSubmit('external')}
                      disabled={isProcessing || !externalEmails.trim()}
                      className="w-full py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Emails
                    </button>
                  </div>
                )}
              </div>

              {/* Download Option - Direct Action */}
              <button
                onClick={handleDownload}
                className="w-full p-4 bg-background border border-border/60 rounded-xl hover:border-emerald-500/50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer flex items-center gap-4 text-left group"
                disabled={isProcessing}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-all duration-200 text-emerald-600">
                  <Download className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground font-semibold mb-0.5">Download PDF</div>
                  <div className="text-muted-foreground text-sm">Save directly to your system</div>
                </div>
                {isProcessing && expandedSection === null ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
