'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Users, Phone, Mail, Download, Search, RefreshCw, X, User, CalendarDays, Edit, UtensilsCrossed, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { Button } from './Button';

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
function GridLayout({ onOpenModal, bookings }: { onOpenModal: (booking: any) => void; bookings: any[] }) {
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
          {/* Header */}
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
function BookingDetailPage({ booking, onBack }: { booking: any | null; onBack: () => void }) {
  const [comments, setComments] = useState<Array<{ by: string; time: string; date: string; action: string }>>(
    booking?.contactHistory || []
  );
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState(booking?.status || 'pending');
  const [allergies, setAllergies] = useState(booking?.allergies || '');
  const [notes, setNotes] = useState(booking?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

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
  }, [booking]);

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
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newCommentObj = {
      by: 'Admin',
      time: timeStr,
      date: dateStr,
      action: newComment
    };

    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  const handleSendReminder = async () => {
    setIsSendingReminder(true);
    try {
      // Call API to send reminder
      const response = await fetch(`/api/bookings/${booking.id}/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('Reminder sent successfully!');
      } else {
        alert('Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleStatusChange = async (value: string) => {
    setLocalStatus(value);
    try {
      const response = await fetch('/api/bookings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, status: value }),
      });

      if (response.ok) {
        // Update local booking status
        const updatedBooking = { ...booking, status: value };
        // This would trigger a re-render with new status
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Prepare allergy details as array
      const allergyDetails = allergies
        ? allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
        : [];

      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allergyDetails,
          specialRequests: notes,
        }),
      });

      if (response.ok) {
        // Reload the page to show updated data
        window.location.reload();
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving booking changes:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      {/* Header */}
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
        <button
          onClick={handleSendReminder}
          disabled={isSendingReminder}
          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
        >
          <Send className="w-4 h-4" />
          {isSendingReminder ? 'Sending...' : 'Send Reminder'}
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-foreground" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-semibold)' }}>
          Booking Details
        </h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
          View and manage booking information
        </p>
      </div>

      <div className="space-y-6">
        {/* Customer Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <User className="w-5 h-5 text-primary" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                First Name
              </label>
              <input
                type="text"
                value={booking.customer.firstName}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Last Name
              </label>
              <input
                type="text"
                value={booking.customer.lastName}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Email
              </label>
              <input
                type="email"
                value={booking.customer.email}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={booking.customer.phone}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Address
              </label>
              <input
                type="text"
                value={booking.customer.address}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              <CalendarDays className="w-5 h-5 text-primary" />
              Event Details
            </h3>
            <button className="text-foreground hover:bg-accent px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Event Date
              </label>
              <input
                type="text"
                value={booking.event.date}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Time
              </label>
              <input
                type="text"
                value={booking.event.time}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Guests
              </label>
              <input
                type="text"
                value={booking.guests}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Occasion
              </label>
              <input
                type="text"
                value={booking.event.occasion}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Amount (CHF)
              </label>
              <input
                type="text"
                value={booking.amount}
                readOnly
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Status
              </label>
              <StatusDropdown
                options={statusOptions}
                value={localStatus}
                onChange={handleStatusChange}
                placeholder="Select status"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <MessageSquare className="w-5 h-5 text-primary" />
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Allergies
              </label>
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontSize: 'var(--text-base)' }}
                placeholder="Enter allergies separated by commas..."
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontSize: 'var(--text-base)' }}
                placeholder="Enter special requests or notes..."
              />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Menu Items
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
                {booking.menuItems && booking.menuItems.length > 0 ? (
                  booking.menuItems.map((item: any, index: number) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.item || item.name}</td>
                      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.category}</td>
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{item.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      No items selected for this booking
                    </td>
                  </tr>
                )}
                {booking.menuItems && booking.menuItems.length > 0 && (
                  <tr className="border-t-2 border-border bg-muted">
                    <td colSpan={3} className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>Total Amount</td>
                    <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{booking.amount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact History */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            <MessageSquare className="w-5 h-5 text-primary" />
            Comments
          </h3>
          <div className="space-y-3">
            {comments.map((contact, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4 flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: '#9DAE91', fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {contact.by.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {contact.by}
                    </span>
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      • {contact.time} • {contact.date}
                    </span>
                  </div>
                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                    {contact.action}
                  </p>
                </div>
              </div>
            ))}

            {/* Add Comment Form */}
            <div className="space-y-3 pt-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ fontSize: 'var(--text-base)' }}
              />
              <button
                onClick={handleAddComment}
                className="w-full px-4 py-3 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <Send className="w-4 h-4" />
                Add Comment
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pb-4">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Copyright Footer */}
        <div className="text-center pt-4 pb-1">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            © 2026 Restaurant Oliv Restaurant & Bar
          </p>
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
}

export function BookingsPage() {
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'list' | 'detail'>('list');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch bookings on component mount
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookingsData(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookingsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Status options for dropdown
  const statusOptions = allStatuses.map(status => ({ value: status, label: status }));

  // Filter bookings based on search query and selected status
  const filteredBookings = bookingsData.filter((booking) => {
    const matchesSearch =
      searchQuery === '' ||
      booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.phone.includes(searchQuery) ||
      booking.event.occasion.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All Status' ||
      booking.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Export to CSV
  const handleExport = () => {
    const headers = ['Customer Name', 'Email', 'Phone', 'Event Date', 'Time', 'Guests', 'Occasion', 'Amount', 'Status', 'Contacted By', 'Contacted When'];
    
    const csvData = filteredBookings.map(booking => [
      booking.customer.name,
      booking.customer.email,
      booking.customer.phone,
      booking.event.date,
      booking.event.time,
      booking.guests.toString(),
      booking.event.occasion,
      booking.amount,
      booking.status,
      booking.contacted?.by || '',
      booking.contacted?.when || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-full bg-background flex flex-col">
      {/* List View */}
      {currentPage === 'list' && (
        <div className="flex-1 flex flex-col">
          <div className="px-4 md:px-0 pb-1">
            {/* Search & Filter Bar */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Search Bar - Left Side */}
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

              {/* Status Dropdown & Export - Right Side */}
              <div className="flex items-center gap-3">
                <StatusDropdown
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                />
                {/* Export Button */}
                <Button variant="primary" icon={Download} onClick={handleExport}>
                  Export
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                  Loading bookings...
                </p>
              </div>
            )}

            {/* Grid Layout */}
            {!loading && filteredBookings.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                  No bookings found
                </p>
              </div>
            )}

            {!loading && (
              <GridLayout
                onOpenModal={(booking) => {
                  setSelectedBooking(booking);
                  setCurrentPage('detail');
                }}
                bookings={filteredBookings}
              />
            )}
          </div>
        </div>
      )}

      {/* Detail View */}
      {currentPage === 'detail' && selectedBooking && (
        <BookingDetailPage
          booking={selectedBooking}
          onBack={() => {
            setCurrentPage('list');
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
