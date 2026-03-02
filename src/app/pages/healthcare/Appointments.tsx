import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Check,
  X,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';

type Appointment = {
  id: string;
  type: 'medical' | 'nutrition' | 'training' | 'checkup' | 'followup' | 'other';
  title: string;
  doctor: string;
  date: string;
  time: string;
  duration: number; // in minutes
  facility: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reminder: boolean;
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      type: 'medical',
      title: 'Medical Checkup',
      doctor: 'Dr. Sarah Johnson',
      date: '2026-02-10',
      time: '14:00',
      duration: 30,
      facility: 'StreetLeague Health Center',
      address: '123 Sports Avenue, City',
      phone: '+33 1 23 45 67 89',
      email: 'contact@streetleague-health.com',
      notes: 'Bring previous test results',
      status: 'confirmed',
      reminder: true,
    },
    {
      id: '2',
      type: 'nutrition',
      title: 'Nutrition Consultation',
      doctor: 'Dr. Michael Chen',
      date: '2026-02-15',
      time: '10:30',
      duration: 60,
      facility: 'Sports Nutrition Clinic',
      address: '456 Wellness Street, City',
      phone: '+33 1 98 76 54 32',
      email: 'nutrition@clinic.com',
      notes: 'Diet plan review and adjustments',
      status: 'pending',
      reminder: true,
    },
    {
      id: '3',
      type: 'followup',
      title: 'Ankle Injury Follow-up',
      doctor: 'Dr. Robert Martinez',
      date: '2026-02-20',
      time: '16:00',
      duration: 45,
      facility: 'Orthopedic Sports Center',
      address: '789 Recovery Road, City',
      phone: '+33 1 11 22 33 44',
      notes: 'Check recovery progress',
      status: 'confirmed',
      reminder: true,
    },
  ]);

  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    type: 'medical',
    title: '',
    doctor: '',
    date: '',
    time: '',
    duration: 30,
    facility: '',
    address: '',
    phone: '',
    email: '',
    notes: '',
    status: 'pending',
    reminder: true,
  });

  const handleAddAppointment = () => {
    if (newAppointment.title && newAppointment.doctor && newAppointment.date && newAppointment.time) {
      const appointment: Appointment = {
        id: Date.now().toString(),
        type: newAppointment.type as Appointment['type'],
        title: newAppointment.title!,
        doctor: newAppointment.doctor!,
        date: newAppointment.date!,
        time: newAppointment.time!,
        duration: newAppointment.duration || 30,
        facility: newAppointment.facility || '',
        address: newAppointment.address,
        phone: newAppointment.phone,
        email: newAppointment.email,
        notes: newAppointment.notes,
        status: newAppointment.status as Appointment['status'],
        reminder: newAppointment.reminder || false,
      };
      setAppointments([...appointments, appointment].sort((a, b) => 
        new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
      ));
      setIsAddingAppointment(false);
      resetNewAppointment();
    }
  };

  const resetNewAppointment = () => {
    setNewAppointment({
      type: 'medical',
      title: '',
      doctor: '',
      date: '',
      time: '',
      duration: 30,
      facility: '',
      address: '',
      phone: '',
      email: '',
      notes: '',
      status: 'pending',
      reminder: true,
    });
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status } : apt
      )
    );
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(appointments.filter((apt) => apt.id !== id));
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(null);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'bg-primary/10 text-primary';
      case 'nutrition':
        return 'bg-accent/10 text-accent';
      case 'training':
        return 'bg-chart-2/10 text-chart-2';
      case 'checkup':
        return 'bg-chart-3/10 text-chart-3';
      case 'followup':
        return 'bg-chart-4/10 text-chart-4';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary/10 text-primary';
      case 'pending':
        return 'bg-accent/10 text-accent';
      case 'completed':
        return 'bg-chart-2/10 text-chart-2';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== 'cancelled' && apt.status !== 'completed' && new Date(apt.date) >= new Date()
  );

  const pastAppointments = appointments.filter(
    (apt) => apt.status === 'completed' || new Date(apt.date) < new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Appointments</h1>
              <p className="text-muted-foreground">
                Schedule and manage medical and training appointments
              </p>
            </div>
            <button
              onClick={() => setIsAddingAppointment(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Schedule Appointment
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar/List View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-card rounded-2xl border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h3>Upcoming Appointments ({upcomingAppointments.length})</h3>
                </div>
              </div>
              <div className="divide-y divide-border">
                {upcomingAppointments.length === 0 ? (
                  <div className="p-12 text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Schedule your first appointment to get started
                    </p>
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-6 hover:bg-muted/30 transition-all cursor-pointer"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold">{appointment.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(appointment.type)}`}>
                              {appointment.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>{appointment.doctor}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{appointment.date}</span>
                              <Clock className="w-4 h-4 ml-2" />
                              <span>
                                {appointment.time} ({appointment.duration} min)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.facility}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {appointment.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(appointment.id, 'confirmed');
                              }}
                              className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all"
                              title="Confirm"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAppointment(appointment.id);
                            }}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div className="bg-card rounded-2xl border border-border">
                <div className="p-6 border-b border-border">
                  <h3>Past Appointments ({pastAppointments.length})</h3>
                </div>
                <div className="divide-y divide-border">
                  {pastAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-6 hover:bg-muted/30 transition-all cursor-pointer opacity-75"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold">{appointment.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(appointment.type)}`}>
                              {appointment.type}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>{appointment.doctor}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{appointment.date}</span>
                              <Clock className="w-4 h-4 ml-2" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Add Form or Details */}
          <div className="space-y-6">
            {isAddingAppointment ? (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3>Schedule Appointment</h3>
                  <button
                    onClick={() => {
                      setIsAddingAppointment(false);
                      resetNewAppointment();
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Appointment Type *</label>
                    <select
                      value={newAppointment.type}
                      onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value as Appointment['type'] })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="medical">Medical</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="training">Training</option>
                      <option value="checkup">Checkup</option>
                      <option value="followup">Follow-up</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Title *</label>
                    <input
                      type="text"
                      value={newAppointment.title}
                      onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Annual Checkup"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Doctor/Specialist *</label>
                    <input
                      type="text"
                      value={newAppointment.doctor}
                      onChange={(e) => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Dr. Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Date *</label>
                      <input
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Time *</label>
                      <input
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                        className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={newAppointment.duration}
                      onChange={(e) => setNewAppointment({ ...newAppointment, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Facility</label>
                    <input
                      type="text"
                      value={newAppointment.facility}
                      onChange={(e) => setNewAppointment({ ...newAppointment, facility: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Hospital or Clinic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Address</label>
                    <input
                      type="text"
                      value={newAppointment.address}
                      onChange={(e) => setNewAppointment({ ...newAppointment, address: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Notes</label>
                    <textarea
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Additional notes..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="reminder"
                      checked={newAppointment.reminder}
                      onChange={(e) => setNewAppointment({ ...newAppointment, reminder: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="reminder" className="text-sm">
                      Send reminder notification
                    </label>
                  </div>
                  <button
                    onClick={handleAddAppointment}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
                  >
                    <CalendarIcon className="h-4 w-4 inline mr-2" />
                    Schedule Appointment
                  </button>
                </div>
              </div>
            ) : selectedAppointment ? (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3>Appointment Details</h3>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-bold">{selectedAppointment.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(selectedAppointment.type)}`}>
                        {selectedAppointment.type}
                      </span>
                    </div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Doctor</p>
                        <p className="text-muted-foreground">{selectedAppointment.doctor}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">Date & Time</p>
                        <p className="text-muted-foreground">
                          {selectedAppointment.date} at {selectedAppointment.time}
                        </p>
                        <p className="text-xs text-muted-foreground">Duration: {selectedAppointment.duration} minutes</p>
                      </div>
                    </div>
                    
                    {selectedAppointment.facility && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">Location</p>
                          <p className="text-muted-foreground">{selectedAppointment.facility}</p>
                          {selectedAppointment.address && (
                            <p className="text-xs text-muted-foreground">{selectedAppointment.address}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedAppointment.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">Phone</p>
                          <p className="text-muted-foreground">{selectedAppointment.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedAppointment.notes && (
                      <div className="flex items-start gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Notes</p>
                          <p className="text-muted-foreground">{selectedAppointment.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedAppointment.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment.id, 'confirmed');
                        setSelectedAppointment({ ...selectedAppointment, status: 'confirmed' });
                      }}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all text-sm font-semibold"
                    >
                      <Check className="h-4 w-4 inline mr-2" />
                      Confirm Appointment
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                    className="w-full py-3 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl transition-all text-sm font-semibold"
                  >
                    <Trash2 className="h-4 w-4 inline mr-2" />
                    Cancel Appointment
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border text-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No appointment selected</p>
                <p className="text-sm text-muted-foreground">Select an appointment to view details</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Appointment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm text-muted-foreground">Total Appointments</span>
                  <span className="font-bold">{appointments.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                  <span className="text-sm text-muted-foreground">Upcoming</span>
                  <span className="font-bold text-primary">{upcomingAppointments.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/5 rounded-xl">
                  <span className="text-sm text-muted-foreground">Pending Confirmation</span>
                  <span className="font-bold text-accent">
                    {appointments.filter((a) => a.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
