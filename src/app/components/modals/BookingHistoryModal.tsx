import { X, Calendar, MapPin, Clock, Check, XCircle } from 'lucide-react';

interface Booking {
  id: string;
  facilityName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  price: number;
}

interface BookingHistoryModalProps {
  onClose: () => void;
}

export function BookingHistoryModal({ onClose }: BookingHistoryModalProps) {
  const bookings: Booking[] = [
    {
      id: '1',
      facilityName: 'Central Arena',
      date: '15 Jan 2026',
      time: '18:00',
      status: 'completed',
      price: 45,
    },
    {
      id: '2',
      facilityName: 'Green Field Sports Complex',
      date: '22 Jan 2026',
      time: '16:00',
      status: 'completed',
      price: 60,
    },
    {
      id: '3',
      facilityName: 'Central Arena',
      date: '05 Feb 2026',
      time: '18:00',
      status: 'confirmed',
      price: 45,
    },
    {
      id: '4',
      facilityName: 'Elite Tennis Club',
      date: '12 Jan 2026',
      time: '14:00',
      status: 'cancelled',
      price: 35,
    },
  ];

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-4 h-4" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Historique des Réservations</h2>
            <p className="text-sm text-muted-foreground">Vos réservations passées et à venir</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-muted transition-all flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold mb-2">{booking.facilityName}</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {booking.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {booking.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      {booking.status === 'confirmed'
                        ? 'Confirmé'
                        : booking.status === 'completed'
                        ? 'Terminé'
                        : 'Annulé'}
                    </div>
                    <div className="text-lg font-bold">${booking.price}</div>
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <button className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                      Voir Détails
                    </button>
                    <button className="flex-1 py-2 text-sm bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all">
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
