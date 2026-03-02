import { useState } from 'react';
import {
  Bell,
  Trophy,
  Users,
  MapPin,
  Heart,
  Gift,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Filter,
  Search,
  Trash2,
  CheckCheck,
} from 'lucide-react';

type NotificationType = 'match' | 'team' | 'booking' | 'health' | 'sponsor' | 'system' | 'all';
type NotificationStatus = 'unread' | 'read' | 'archived';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  status: NotificationStatus;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'Match Reminder',
    message: 'Your match "Thunder Strikers vs Lightning FC" starts in 2 hours at Municipal Stadium.',
    timestamp: '2026-02-06T10:30:00',
    status: 'unread',
    actionUrl: '/matches/123',
    priority: 'high',
  },
  {
    id: '2',
    type: 'team',
    title: 'New Team Invitation',
    message: 'Alex Rivera invited you to join "Elite Warriors" team.',
    timestamp: '2026-02-06T09:15:00',
    status: 'unread',
    actionUrl: '/team/456',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'health',
    title: 'Performance Milestone',
    message: 'Congratulations! You\'ve unlocked the "Century Club" badge for reaching 100 matches.',
    timestamp: '2026-02-06T08:00:00',
    status: 'read',
    actionUrl: '/performance',
    priority: 'medium',
  },
  {
    id: '4',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your booking for Municipal Football Field on Feb 10 at 18:00 has been confirmed.',
    timestamp: '2026-02-05T16:45:00',
    status: 'read',
    actionUrl: '/booking/789',
    priority: 'low',
  },
  {
    id: '5',
    type: 'sponsor',
    title: 'Exclusive Offer',
    message: 'Nike is offering 20% off on all football gear for StreetLeague members. Valid for 48h.',
    timestamp: '2026-02-05T14:20:00',
    status: 'read',
    actionUrl: '/sponsors',
    priority: 'low',
  },
  {
    id: '6',
    type: 'system',
    title: 'Profile Verification',
    message: 'Please verify your email address to access all platform features.',
    timestamp: '2026-02-05T10:00:00',
    status: 'unread',
    actionUrl: '/profile/verify',
    priority: 'high',
  },
  {
    id: '7',
    type: 'team',
    title: 'Team Practice Scheduled',
    message: 'Morgan Lee scheduled a practice session for tomorrow at 17:00. Don\'t forget your gear!',
    timestamp: '2026-02-04T19:30:00',
    status: 'read',
    priority: 'medium',
  },
  {
    id: '8',
    type: 'match',
    title: 'Match Result Updated',
    message: 'Final score: Thunder Strikers 3 - 2 Lightning FC. Great game!',
    timestamp: '2026-02-04T15:00:00',
    status: 'archived',
    actionUrl: '/matches/122',
    priority: 'low',
  },
];

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [selectedType, setSelectedType] = useState<NotificationType>('all');
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const typeFilters: { type: NotificationType; label: string; icon: any; color: string }[] = [
    { type: 'all', label: 'All', icon: Bell, color: '#1DB954' },
    { type: 'match', label: 'Matches', icon: Trophy, color: '#F26419' },
    { type: 'team', label: 'Teams', icon: Users, color: '#06D6A0' },
    { type: 'booking', label: 'Bookings', icon: MapPin, color: '#1DB954' },
    { type: 'health', label: 'Health', icon: Heart, color: '#DC2626' },
    { type: 'sponsor', label: 'Sponsors', icon: Gift, color: '#F97316' },
    { type: 'system', label: 'System', icon: AlertCircle, color: '#64748B' },
  ];

  const getNotificationIcon = (type: NotificationType, priority: string) => {
    const filter = typeFilters.find((f) => f.type === type);
    const Icon = filter?.icon || Bell;
    return <Icon className="h-5 w-5" style={{ color: filter?.color }} />;
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-destructive bg-destructive/5';
      case 'medium':
        return 'border-l-4 border-l-accent bg-accent/5';
      default:
        return 'border-l-4 border-l-muted';
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesType = selectedType === 'all' || notif.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || notif.status === selectedStatus;
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, status: 'read' as NotificationStatus } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notif) =>
        notif.status === 'unread' ? { ...notif, status: 'read' as NotificationStatus } : notif
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const handleArchive = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, status: 'archived' as NotificationStatus } : notif
      )
    );
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Notifications Center</h1>
              <p className="text-muted-foreground">
                Stay updated with all your activities and messages
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                  <Bell className="h-4 w-4" />
                  <span className="font-semibold">{unreadCount} unread</span>
                </div>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                >
                  <CheckCheck className="h-4 w-4 inline mr-2" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-muted/30 border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as NotificationStatus | 'all')}
              className="px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {typeFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.type}
                  onClick={() => setSelectedType(filter.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    selectedType === filter.type
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'bg-card hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{filter.label}</span>
                  {filter.type !== 'all' && (
                    <span className="px-2 py-0.5 bg-background/30 rounded-full text-xs">
                      {notifications.filter((n) => n.type === filter.type && n.status !== 'archived').length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
              <Bell className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2">No notifications found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'You\'re all caught up! Check back later for updates.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all group ${getPriorityStyles(
                  notification.priority
                )} ${notification.status === 'unread' ? 'ring-2 ring-primary/20' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="line-clamp-1">{notification.title}</h4>
                          {notification.status === 'unread' && (
                            <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {notification.actionUrl && (
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
                          View Details
                        </button>
                      )}
                      {notification.status === 'unread' && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg text-sm font-semibold transition-all"
                        >
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Mark as read
                        </button>
                      )}
                      {notification.status !== 'archived' && (
                        <button
                          onClick={() => handleArchive(notification.id)}
                          className="px-4 py-2 bg-muted hover:bg-muted/70 rounded-lg text-sm font-semibold transition-all opacity-0 group-hover:opacity-100"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="ml-auto p-2 text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
