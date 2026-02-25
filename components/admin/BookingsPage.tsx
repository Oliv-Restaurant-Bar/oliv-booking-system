'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, Mail, Download, Search, RefreshCw, X, User, CalendarDays, Edit, UtensilsCrossed, Send, MessageSquare, ArrowLeft, Lock, Unlock, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { Button } from './Button';
import * as XLSX from 'xlsx';
import { Permission, hasPermission } from '@/lib/auth/rbac';

const statusColors: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
  'confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: '#10b981' },
  'touchbase': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', dotColor: '#9DAE91' },
  'new': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dotColor: '#8b5cf6' },
  'declined': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dotColor: '#ef4444' },
  'completed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: '#3b82f6' },
  'pending': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dotColor: '#eab308' },
};

const allStatuses = ['All Status', 'New', 'Pending', 'Confirmed', 'Touchbase', 'Declined', 'Completed'];

// Grid Layout
function GridLayout({ onOpenModal, bookings }: { onOpenModal: (booking: Booking) => void; bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
          No bookings found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: booking.customer.avatarColor || '#9DAE91', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                {booking.customer.avatar}
              </div>
              <div>
                <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {booking.customer.name}
                </h4>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.event.occasion}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${statusColors[booking.status.toLowerCase()]?.bg || statusColors.pending.bg} ${statusColors[booking.status.toLowerCase()]?.text || statusColors.pending.text} ${statusColors[booking.status.toLowerCase()]?.border || statusColors.pending.border}`}
              style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColors[booking.status.toLowerCase()]?.dotColor || statusColors.pending.dotColor }}
              />
              {booking.status}
            </span>
          </div>

          {/* Refined Information Rows */}
          <div className="space-y-2 mb-4">
            {/* Row 1: Email + Date */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.customer.email}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.event.date}
                </span>
              </div>
            </div>

            {/* Row 2: Phone + Guests */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.customer.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.guests} guests
                </span>
              </div>
            </div>

            {/* Row 3: Contacted + Amount */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-muted-foreground flex-1" style={{ fontSize: 'var(--text-small)' }}>
                {booking.contacted?.by ? `By ${booking.contacted.by} • ${booking.contacted.when}` : booking.booking}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {booking.amount}
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => onOpenModal(booking)}
            className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}

// Booking Detail Page - Embedded Component
function BookingDetailPage({ booking, onBack, user }: { booking: Booking | null; onBack: () => void; user?: any }) {
  const userRole = user?.role;
  const canEditBooking = hasPermission(userRole, Permission.EDIT_BOOKING);
  const canUpdateStatus = hasPermission(userRole, Permission.UPDATE_BOOKING_STATUS);
  const canViewAudit = hasPermission(userRole, Permission.VIEW_BOOKING_DETAILS);

  const [comments, setComments] = useState<Array<{ by: string; time: string; date: string; action: string }>>(
    booking?.contactHistory || []
  );
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState(booking?.status || 'pending');
  const [allergies, setAllergies] = useState(booking?.allergies || '');
  const [notes, setNotes] = useState(booking?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [isLocked, setIsLocked] = useState(booking?.isLocked || false);
  const [lockLoading, setLockLoading] = useState(false);
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Update local state when booking changes
  useEffect(() => {
    if (booking?.status) {
      setLocalStatus(booking.status);
    }
    if (booking?.contactHistory) {
      setComments(booking.contactHistory);
    }
    setAllergies(booking?.allergies || '');
    setNotes(booking?.notes || '');
    setIsLocked(booking?.isLocked || false);
  }, [booking]);

  // Fetch audit history when shown
  useEffect(() => {
    if (showAuditHistory && booking?.id) {
      fetchAuditHistory();
    }
  }, [showAuditHistory, booking?.id]);

  const fetchAuditHistory = async () => {
    if (!booking) return;
    setAuditLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/audit`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching audit history:', error);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleToggleLock = async () => {
    if (!booking) return;
    setLockLoading(true);
    try {
      const action = isLocked ? 'unlock' : 'lock';
      const response = await fetch(`/api/bookings/${booking.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setIsLocked(!isLocked);
        if (showAuditHistory) fetchAuditHistory();
        alert(`Booking ${!isLocked ? 'locked' : 'unlocked'} successfully!`);
      } else {
        const errorData = await response.json();
        alert(`Failed to ${action} booking: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert('Failed to toggle lock. Please try again.');
    } finally {
      setLockLoading(false);
    }
  };

  const handleCopyEditLink = async () => {
    if (!booking) return;
    try {
      const response = await fetch(`/api/bookings/${booking.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.editSecret) {
          const editLink = `${window.location.origin}/booking/${booking.id}/edit/${data.editSecret}`;
          await navigator.clipboard.writeText(editLink);
          alert('Edit link copied to clipboard!\n\n' + editLink);
          return;
        }

        const generateResponse = await fetch(`/api/bookings/${booking.id}/generate-secret`, { method: 'POST' });
        if (generateResponse.ok) {
          const generateData = await generateResponse.json();
          if (generateData.success && generateData.editSecret) {
            const editLink = `${window.location.origin}/booking/${booking.id}/edit/${generateData.editSecret}`;
            await navigator.clipboard.writeText(editLink);
            alert('Edit link generated and copied to clipboard!\n\n' + editLink);
            return;
          }
        }
      }
      alert('Unable to generate edit link. Please try again.');
    } catch (error) {
      console.error('Error copying edit link:', error);
      alert('Failed to copy edit link. Please try again.');
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'declined', label: 'Declined' },
    { value: 'no_show', label: 'No Show' },
  ];

  if (!booking) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const now = new Date();
    const newCommentObj = {
      by: 'Admin',
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      action: newComment
    };
    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  const handleSendReminder = async () => {
    if (!booking) return;
    setIsSendingReminder(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/reminder`, { method: 'POST' });
      if (response.ok) alert('Reminder sent successfully!');
      else alert('Failed to send reminder');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleStatusChange = async (value: string) => {
    if (!booking) return;
    setLocalStatus(value);
    try {
      await fetch('/api/bookings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, status: value }),
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!booking) return;
    setIsSaving(true);
    try {
      const allergyDetails = allergies ? allergies.split(',').map(a => a.trim()).filter(Boolean) : [];
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allergyDetails, specialRequests: notes }),
      });
      if (response.ok) window.location.reload();
      else alert('Failed to save changes');
    } catch (error) {
      console.error('Error saving booking changes:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      {/* Detail Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-foreground"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Bookings</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {canEditBooking && (
            <button
              onClick={handleToggleLock}
              disabled={lockLoading}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${isLocked
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-secondary hover:bg-primary text-white'
                }`}
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              {lockLoading ? 'Loading...' : isLocked ? <><Unlock className="w-4 h-4" />Unlock</> : <><Lock className="w-4 h-4" />Lock</>}
            </button>
          )}
          {canViewAudit && (
            <button
              onClick={() => setShowAuditHistory(!showAuditHistory)}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <History className="w-4 h-4" />
              {showAuditHistory ? 'Hide History' : 'Show History'}
            </button>
          )}
          {canEditBooking && (
            <button
              onClick={handleCopyEditLink}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <Send className="w-4 h-4" />
              Copy Edit Link
            </button>
          )}
        </div>
      </div>

      {isLocked && (
        <div className="mb-6 p-4 border rounded-lg flex items-center gap-3 bg-amber-500/10 border-amber-500/40">
          <Lock className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800" style={{ fontSize: 'var(--text-base)' }}>Booking is Locked</p>
            <p className="text-sm text-amber-700" style={{ fontSize: 'var(--text-small)' }}>Clients cannot edit this booking. You can still make changes as an admin.</p>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-foreground" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-semibold)' }}>Booking Details</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>View and manage booking information</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <User className="w-5 h-5 text-primary" /> Customer Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>First Name</label>
              <input type="text" value={booking.customer.firstName} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Last Name</label>
              <input type="text" value={booking.customer.lastName} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Email</label>
              <input type="email" value={booking.customer.email} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Phone Number</label>
              <input type="tel" value={booking.customer.phone} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Address</label>
              <input type="text" value={booking.customer.address} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              <CalendarDays className="w-5 h-5 text-primary" /> Event Details
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Event Date</label>
              <input type="text" value={booking.event.date} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Time</label>
              <input type="text" value={booking.event.time} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Guests</label>
              <input type="text" value={booking.guests} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Occasion</label>
              <input type="text" value={booking.event.occasion} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Amount (CHF)</label>
              <input type="text" value={booking.amount} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Status</label>
              <StatusDropdown options={statusOptions} value={localStatus} onChange={handleStatusChange} placeholder="Select status" className="w-full" disabled={!canUpdateStatus} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <MessageSquare className="w-5 h-5 text-primary" /> Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Allergies</label>
              <textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} rows={2} disabled={!canEditBooking} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-75" style={{ fontSize: 'var(--text-base)' }} />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} disabled={!canEditBooking} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-75" style={{ fontSize: 'var(--text-base)' }} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <UtensilsCrossed className="w-5 h-5 text-primary" /> Menu Items
          </h3>
          <div className="bg-background border border-border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Item</th>
                  <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Category</th>
                  <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Quantity</th>
                  <th className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {booking.menuItems?.length > 0 ? (
                  booking.menuItems.map((item: any, index: number) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.item || item.name}</td>
                      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.category}</td>
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{item.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>No items selected</td></tr>
                )}
                {booking.menuItems?.length > 0 && (
                  <tr className="border-t-2 border-border bg-muted">
                    <td colSpan={3} className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>Total Amount</td>
                    <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{booking.amount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <MessageSquare className="w-5 h-5 text-primary" /> Comments
          </h3>
          <div className="space-y-3">
            {comments.map((contact, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-[#9DAE91]" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>{contact.by.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>{contact.by}</span>
                    <span className="text-muted-foreground text-sm">• {contact.time} • {contact.date}</span>
                  </div>
                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{contact.action}</p>
                </div>
              </div>
            ))}
            {canEditBooking && (
              <div className="space-y-3 pt-2">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." rows={3} className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" style={{ fontSize: 'var(--text-base)' }} />
                <button onClick={handleAddComment} className="w-full px-4 py-3 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  <Send className="w-4 h-4" /> Add Comment
                </button>
              </div>
            )}
          </div>
        </div>

        {showAuditHistory && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              <History className="w-5 h-5 text-primary" /> Audit History
            </h3>
            {auditLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading audit history...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No changes recorded yet</div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${log.actor_type === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                          {log.actor_label.charAt(0)}
                        </div>
                        <div>
                          <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{log.actor_label}</p>
                          {log.admin_name && <p className="text-muted-foreground text-sm">{log.admin_email}</p>}
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      {log.changes.map((change: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{change.field.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}:</span>
                          <span className={`line-through ${change.from ? 'text-red-500' : 'text-muted-foreground'}`}>{change.from === null || change.from === undefined ? 'None' : String(change.from)}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-green-500 font-medium">{change.to === null || change.to === undefined ? 'None' : String(change.to)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {canEditBooking && (
          <div className="pb-4">
            <button onClick={handleSaveChanges} disabled={isSaving} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        <div className="text-center pt-4 pb-1">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>© 2026 Restaurant Oliv Restaurant & Bar</p>
        </div>
      </div>
    </div>
  );
}

interface Booking {
  id: string;
  customer: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    avatarColor: string;
    address: string;
  };
  event: {
    date: string;
    time: string;
    occasion: string;
  };
  guests: number;
  amount: string;
  status: string;
  contacted: {
    by: string;
    when: string;
  };
  booking: string;
  allergies: string;
  notes: string;
  menuItems: Array<{
    item: string;
    category: string;
    quantity: string;
    price: string;
  }>;
  contactHistory: Array<{
    by: string;
    time: string;
    date: string;
    action: string;
  }>;
  isLocked: boolean;
}

export function BookingsPage({ user }: { user?: any }) {
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'list' | 'detail'>('list');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page on status change
  useEffect(() => {
    setPage(1);
  }, [selectedStatus]);

  // Fetch bookings whenever page, status, or search changes
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bookings?page=${page}&limit=${pageSize}&search=${debouncedSearch}&status=${selectedStatus}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookingsData(data.bookings);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookingsData([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, debouncedSearch, selectedStatus]);

  // Status options for dropdown
  const statusOptions = allStatuses.map(status => ({ value: status, label: status }));

  const handleExport = () => {
    const excelData = bookingsData.map(booking => ({
      'Customer Name': booking.customer.name,
      'Email': booking.customer.email,
      'Phone': booking.customer.phone,
      'Event Date': booking.event.date,
      'Time': booking.event.time,
      'Guests': booking.guests,
      'Occasion': booking.event.occasion,
      'Amount': booking.amount,
      'Status': booking.status,
      'Contacted By': booking.contacted?.by || '',
      'Contacted When': booking.contacted?.when || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, `bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-full bg-background px-4 md:px-8 pt-6 pb-1 flex flex-col">
      {/* List View */}
      {currentPage === 'list' && (
        <div className="w-full flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-foreground" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-semibold)' }}>
              Bookings
            </h1>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {/* Search & Filter Bar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ fontSize: 'var(--text-base)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                ref={searchInputRef}
              />
            </div>
            <div className="flex items-center gap-3">
              <StatusDropdown options={statusOptions} value={selectedStatus} onChange={setSelectedStatus} />
              <Button variant="primary" icon={Download} onClick={handleExport}>
                Export
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>Loading bookings...</p>
            </div>
          )}

          {/* Grid Layout */}
          {!loading && bookingsData.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>No bookings found</p>
            </div>
          )}

          {!loading && (
            <div className="flex-1 flex flex-col">
              <GridLayout
                onOpenModal={(booking: Booking) => {
                  setSelectedBooking(booking);
                  setCurrentPage('detail');
                }}
                bookings={bookingsData}
              />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 mt-4 border-t border-border">
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    Showing <span className="text-foreground font-medium">{(page - 1) * pageSize + 1}</span> to <span className="text-foreground font-medium">{Math.min(page * pageSize, totalCount)}</span> of <span className="text-foreground font-medium">{totalCount}</span> bookings
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                      .map((p, i, arr) => (
                        <div key={p} className="flex items-center gap-1.5">
                          {i > 0 && arr[i - 1] !== p - 1 && <span className="text-muted-foreground px-1">...</span>}
                          <button onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg border transition-all ${page === p ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:bg-accent text-foreground'}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>{p}</button>
                        </div>
                      ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Detail View */}
      {currentPage === 'detail' && selectedBooking && (
        <BookingDetailPage
          booking={selectedBooking}
          user={user}
          onBack={() => {
            setCurrentPage('list');
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
