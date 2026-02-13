import { useState, useRef } from 'react';
import { Calendar, Clock, Users, Phone, Mail, MapPin, MessageSquare, ChevronDown, Download, Search, X, User, CalendarDays, Edit, UtensilsCrossed, Send } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { Button } from './Button';

// Mock booking data with extended information
const bookingsData = [
  {
    id: 1,
    customer: {
      name: 'Maria Schmidt',
      firstName: 'Maria',
      lastName: 'Schmidt',
      email: 'maria.schmidt@email.com',
      phone: '+41 79 123 45 67',
      avatar: 'M',
      avatarColor: '#10B981',
      address: 'Bahnhofstrasse 100, 8001 Zurich'
    },
    event: {
      date: 'Jun 15, 2026',
      time: '18:00',
      occasion: 'Wedding'
    },
    guests: 120,
    amount: 'CHF 8,500',
    status: 'Touchbase',
    contacted: {
      by: 'Florian',
      when: '5d ago'
    },
    booking: '15d ago',
    allergies: 'Gluten-free (5 people), Vegetarian (15 people)',
    notes: 'Prefers local ingredients',
    menuItems: [
      { item: 'Rösti', category: 'Appetizer', quantity: '10 pieces', price: 'CHF 5' },
      { item: 'Fondue', category: 'Main Course', quantity: '1 pot', price: 'CHF 50' },
    ],
    contactHistory: [
      { by: 'Florian', time: '02:30 PM', date: '28 Jan 2026', action: 'Sent menu options' },
      { by: 'Florian', time: '04:45 PM', date: '29 Jan 2026', action: 'Confirmed menu' },
    ]
  },
  {
    id: 2,
    customer: {
      name: 'Thomas Müller',
      firstName: 'Thomas',
      lastName: 'Müller',
      email: 'thomas.muller@company.ch',
      phone: '+41 79 234 56 78',
      avatar: 'T',
      avatarColor: '#3B82F6',
      address: 'Limmatstrasse 50, 8005 Zurich'
    },
    event: {
      date: 'Mar 20, 2026',
      time: '19:30',
      occasion: 'Corporate Event'
    },
    guests: 50,
    amount: 'CHF 3,200',
    status: 'Confirmed',
    contacted: {
      by: 'Stefan',
      when: '15d ago'
    },
    booking: '16d ago',
    allergies: 'Peanut allergy (2 people)',
    notes: 'Need projector setup',
    menuItems: [
      { item: 'Canapés', category: 'Appetizer', quantity: '50 pieces', price: 'CHF 3' },
      { item: 'Steak', category: 'Main Course', quantity: '50 portions', price: 'CHF 45' },
    ],
    contactHistory: [
      { by: 'Stefan', time: '10:00 AM', date: '15 Jan 2026', action: 'Initial contact' },
      { by: 'Stefan', time: '03:30 PM', date: '18 Jan 2026', action: 'Confirmed booking' },
    ]
  },
  {
    id: 3,
    customer: {
      name: 'Sophie Weber',
      firstName: 'Sophie',
      lastName: 'Weber',
      email: 'sophie.weber@email.com',
      phone: '+41 79 345 67 89',
      avatar: 'S',
      avatarColor: '#8B5CF6',
      address: 'Seestrasse 25, 8002 Zurich'
    },
    event: {
      date: 'Apr 5, 2026',
      time: '17:00',
      occasion: 'Birthday'
    },
    guests: 30,
    amount: 'CHF 2,100',
    status: 'New',
    contacted: {
      by: 'Florian',
      when: '5d ago'
    },
    booking: '9d ago',
    allergies: 'Lactose intolerant (3 people)',
    notes: 'Birthday cake needed',
    menuItems: [
      { item: 'Salad', category: 'Appetizer', quantity: '30 portions', price: 'CHF 8' },
      { item: 'Pasta', category: 'Main Course', quantity: '30 portions', price: 'CHF 22' },
    ],
    contactHistory: [
      { by: 'Florian', time: '11:20 AM', date: '30 Jan 2026', action: 'Discussed menu options' },
    ]
  },
  {
    id: 4,
    customer: {
      name: 'Lars Hoffmann',
      firstName: 'Lars',
      lastName: 'Hoffmann',
      email: 'lars.hoffmann@email.com',
      phone: '+41 79 456 78 90',
      avatar: 'L',
      avatarColor: '#EF4444',
      address: 'Universitätstrasse 10, 8006 Zurich'
    },
    event: {
      date: 'Feb 10, 2026',
      time: '14:00',
      occasion: 'Baptism'
    },
    guests: 40,
    amount: 'CHF 2,800',
    status: 'Declined',
    contacted: {
      by: 'Anna',
      when: '19d ago'
    },
    booking: '20d ago',
    allergies: 'None',
    notes: 'Preferred another venue',
    menuItems: [],
    contactHistory: [
      { by: 'Anna', time: '09:00 AM', date: '10 Jan 2026', action: 'Sent proposal' },
      { by: 'Anna', time: '05:30 PM', date: '12 Jan 2026', action: 'Customer declined' },
    ]
  },
  {
    id: 5,
    customer: {
      name: 'Anna Keller',
      firstName: 'Anna',
      lastName: 'Keller',
      email: 'anna.keller@email.com',
      phone: '+41 79 567 89 01',
      avatar: 'A',
      avatarColor: '#F59E0B',
      address: 'Paradeplatz 5, 8001 Zurich'
    },
    event: {
      date: 'May 12, 2026',
      time: '19:00',
      occasion: 'Anniversary'
    },
    guests: 25,
    amount: 'CHF 1,800',
    status: 'Touchbase',
    contacted: {
      by: 'Stefan',
      when: '6d ago'
    },
    booking: '11d ago',
    allergies: 'Shellfish allergy (1 person)',
    notes: 'Window seating preferred',
    menuItems: [
      { item: 'Soup', category: 'Appetizer', quantity: '25 portions', price: 'CHF 6' },
      { item: 'Fish', category: 'Main Course', quantity: '25 portions', price: 'CHF 35' },
    ],
    contactHistory: [
      { by: 'Stefan', time: '02:15 PM', date: '25 Jan 2026', action: 'Initial inquiry' },
      { by: 'Stefan', time: '10:00 AM', date: '28 Jan 2026', action: 'Follow-up call' },
    ]
  },
];

const statusColors: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
  'Confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: '#10b981' },
  'Touchbase': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', dotColor: '#9DAE91' },
  'New': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dotColor: '#8b5cf6' },
  'Declined': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dotColor: '#ef4444' },
  'Completed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: '#3b82f6' },
};

const allStatuses = ['All Status', 'Confirmed', 'Touchbase', 'New', 'Declined', 'Completed'];

// Grid Layout
function GridLayout({ onOpenModal, bookings }: { onOpenModal: (booking: typeof bookingsData[0]) => void; bookings: typeof bookingsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-md transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: booking.customer.avatarColor, fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
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
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${statusColors[booking.status]?.bg} ${statusColors[booking.status]?.text} ${statusColors[booking.status]?.border}`}
              style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColors[booking.status]?.dotColor }}
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
                By {booking.contacted.by} • {booking.contacted.when}
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
            className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}

// Booking Detail Modal
function BookingDetailModal({ booking, onClose }: { booking: typeof bookingsData[0] | null; onClose: () => void }) {
  const [comments, setComments] = useState<Array<{ by: string; time: string; date: string; action: string }>>(
    booking?.contactHistory || []
  );
  const [newComment, setNewComment] = useState('');

  if (!booking) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newCommentObj = {
      by: 'Admin', // You can replace this with actual logged-in user name
      time: timeStr,
      date: dateStr,
      action: newComment
    };

    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background z-50 shadow-2xl overflow-y-auto transform transition-transform">
        <div className="sticky top-0 bg-background border-b border-border z-10 px-8 py-5 flex items-center justify-between">
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
            Booking Details
          </h2>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              <Send className="w-4 h-4" />
              Send Reminder
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              <User className="w-5 h-5 text-primary" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="col-span-2">
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
            <div className="grid grid-cols-2 gap-4">
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
                <input
                  type="text"
                  value={booking.status}
                  readOnly
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
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
                  value={booking.allergies}
                  readOnly
                  rows={2}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground resize-none"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>
                  Notes
                </label>
                <textarea
                  value={booking.notes}
                  readOnly
                  rows={2}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground resize-none"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          {booking.menuItems.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                Menu Items
              </h3>
              <div className="bg-background border border-border rounded-lg overflow-hidden">
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
                    {booking.menuItems.map((item, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.item}</td>
                        <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.category}</td>
                        <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{item.price}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border bg-muted">
                      <td colSpan={3} className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>Total Amount</td>
                      <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{booking.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                  <Mail className="w-4 h-4" />
                  Add Comment
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="h-20"></div>
        </div>

        {/* Fixed Save Button Footer */}
        <div className="fixed bottom-0 right-0 w-full max-w-2xl bg-background border-t border-border px-6 py-4 z-10">
          <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

export function BookingsPage({ onViewDetails }: { onViewDetails?: (booking: typeof bookingsData[0]) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = (booking: typeof bookingsData[0]) => {
    if (onViewDetails) {
      onViewDetails(booking);
    }
  };

  // Status options for the dropdown
  const statusOptions = [
    { value: 'All Status', label: 'All Status' },
    { value: 'New', label: 'New' },
    { value: 'Touchbase', label: 'Touchbase' },
    { value: 'Confirmed', label: 'Confirmed' },
  ];

  // Filter bookings based on search query and selected status
  const filteredBookings = bookingsData.filter((booking) => {
    const matchesSearch =
      booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.event.occasion.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'All Status' || booking.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-full bg-background px-4 md:px-8 pt-4 md:pt-6 pb-1 flex flex-col">
      <div className="w-full space-y-4 flex-1">
        {/* Search & Filter Bar */}
        <div className="bg-card border border-border rounded-xl p-3 md:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          {/* Search Bar - Left Side */}
          <div className="relative flex-1 sm:max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 md:py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ fontSize: 'var(--text-base)', minHeight: '44px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchInputRef}
            />
          </div>
          
          {/* Status Dropdown & Export Button - Right Side */}
          <div className="flex items-center gap-3 sm:ml-auto">
            {/* Status Dropdown */}
            <div className="flex-1 sm:flex-none">
              <StatusDropdown
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />
            </div>

            {/* Export Button */}
            <Button variant="primary" icon={Download} className="min-h-[44px]">
              Export
            </Button>
          </div>
        </div>

        {/* Grid Layout */}
        <GridLayout onOpenModal={handleOpenModal} bookings={filteredBookings} />

        {/* Copyright Footer */}
        <div className="text-center pt-4 pb-1 mt-auto">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            © 2026 Restaurant Oliv Restaurant & Bar
          </p>
        </div>
      </div>
    </div>
  );
}