import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Filter,
  Download,
  Trash2,
  Eye,
  X,
  Save,
  Activity,
  AlertCircle,
} from 'lucide-react';

type MedicalRecord = {
  id: string;
  title: string;
  type: 'injury' | 'checkup' | 'lab' | 'diagnosis' | 'treatment' | 'other';
  date: string;
  doctor: string;
  facility: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  notes?: string;
  attachments?: string[];
  status: 'active' | 'completed' | 'archived';
};

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      title: 'Ankle Sprain Recovery',
      type: 'injury',
      date: '2026-01-28',
      doctor: 'Dr. Michael Chen',
      facility: 'Sports Medicine Clinic',
      description: 'Minor ankle sprain during match',
      diagnosis: 'Grade 1 lateral ankle sprain',
      treatment: 'RICE protocol, physical therapy 3x/week',
      medications: 'Ibuprofen 400mg as needed',
      notes: 'Return to play in 2-3 weeks. Follow PT exercises daily.',
      status: 'active',
    },
    {
      id: '2',
      title: 'Annual Physical Examination',
      type: 'checkup',
      date: '2026-01-15',
      doctor: 'Dr. Sarah Johnson',
      facility: 'StreetLeague Health Center',
      description: 'Annual sports physical examination',
      diagnosis: 'All systems normal. Excellent health status.',
      treatment: 'Continue current training regimen',
      notes: 'Blood pressure: 120/80. Heart rate: 62 bpm. All vitals normal.',
      status: 'completed',
    },
    {
      id: '3',
      title: 'Blood Test Results',
      type: 'lab',
      date: '2026-01-10',
      doctor: 'Dr. Sarah Johnson',
      facility: 'StreetLeague Health Center',
      description: 'Comprehensive metabolic panel and CBC',
      diagnosis: 'All values within normal range',
      notes: 'Vitamin D: 45 ng/mL (optimal). Iron levels: Normal. Cholesterol: 180 mg/dL.',
      status: 'completed',
    },
    {
      id: '4',
      title: 'Knee Pain Evaluation',
      type: 'diagnosis',
      date: '2025-12-20',
      doctor: 'Dr. Robert Martinez',
      facility: 'Orthopedic Sports Center',
      description: 'Evaluation of right knee discomfort',
      diagnosis: 'Mild patellofemoral pain syndrome',
      treatment: 'Strengthening exercises, ice after activity',
      medications: 'None required',
      notes: 'No structural damage. Continue with preventive exercises.',
      status: 'completed',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    title: '',
    type: 'other',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    facility: '',
    description: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    status: 'active',
  });

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddRecord = () => {
    if (newRecord.title && newRecord.date && newRecord.doctor) {
      const record: MedicalRecord = {
        id: Date.now().toString(),
        title: newRecord.title!,
        type: newRecord.type as MedicalRecord['type'],
        date: newRecord.date!,
        doctor: newRecord.doctor!,
        facility: newRecord.facility || '',
        description: newRecord.description || '',
        diagnosis: newRecord.diagnosis,
        treatment: newRecord.treatment,
        medications: newRecord.medications,
        notes: newRecord.notes,
        status: newRecord.status as MedicalRecord['status'],
      };
      setRecords([record, ...records]);
      setIsAddingRecord(false);
      setNewRecord({
        title: '',
        type: 'other',
        date: new Date().toISOString().split('T')[0],
        doctor: '',
        facility: '',
        description: '',
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: '',
        status: 'active',
      });
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this medical record?')) {
      setRecords(records.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'injury':
        return 'bg-destructive/10 text-destructive';
      case 'checkup':
        return 'bg-primary/10 text-primary';
      case 'lab':
        return 'bg-accent/10 text-accent';
      case 'diagnosis':
        return 'bg-chart-2/10 text-chart-2';
      case 'treatment':
        return 'bg-chart-3/10 text-chart-3';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent/10 text-accent';
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Medical Records</h1>
              <p className="text-muted-foreground">
                Complete medical history and health event tracking
              </p>
            </div>
            <button
              onClick={() => setIsAddingRecord(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Medical Record
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search records by title, doctor, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="injury">Injury</option>
                <option value="checkup">Checkup</option>
                <option value="lab">Lab Results</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="treatment">Treatment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Records List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3>Medical History ({filteredRecords.length} records)</h3>
              </div>
              <div className="divide-y divide-border">
                {filteredRecords.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No medical records found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchTerm || filterType !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Add your first medical record to get started'}
                    </p>
                  </div>
                ) : (
                  filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-6 hover:bg-muted/30 transition-all cursor-pointer"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold">{record.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(record.type)}`}>
                              {record.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{record.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>{record.doctor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(record);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecord(record.id);
                            }}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Record Details or Add Form */}
          <div className="space-y-6">
            {isAddingRecord ? (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3>Add Medical Record</h3>
                  <button
                    onClick={() => setIsAddingRecord(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Title *</label>
                    <input
                      type="text"
                      value={newRecord.title}
                      onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Ankle Sprain"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Type *</label>
                    <select
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as MedicalRecord['type'] })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="injury">Injury</option>
                      <option value="checkup">Checkup</option>
                      <option value="lab">Lab Results</option>
                      <option value="diagnosis">Diagnosis</option>
                      <option value="treatment">Treatment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Date *</label>
                    <input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Doctor *</label>
                    <input
                      type="text"
                      value={newRecord.doctor}
                      onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Dr. Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Facility</label>
                    <input
                      type="text"
                      value={newRecord.facility}
                      onChange={(e) => setNewRecord({ ...newRecord, facility: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Hospital or Clinic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      value={newRecord.description}
                      onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Brief description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Diagnosis</label>
                    <textarea
                      value={newRecord.diagnosis}
                      onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Medical diagnosis..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Treatment</label>
                    <textarea
                      value={newRecord.treatment}
                      onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Treatment plan..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status</label>
                    <select
                      value={newRecord.status}
                      onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value as MedicalRecord['status'] })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddRecord}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Save Record
                  </button>
                </div>
              </div>
            ) : selectedRecord ? (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3>Record Details</h3>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-2 hover:bg-muted rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-bold">{selectedRecord.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(selectedRecord.type)}`}>
                        {selectedRecord.type}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedRecord.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        <span>{selectedRecord.doctor}</span>
                      </div>
                      {selectedRecord.facility && (
                        <div className="text-sm text-muted-foreground">📍 {selectedRecord.facility}</div>
                      )}
                    </div>
                  </div>
                  
                  {selectedRecord.description && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Description</p>
                      <p className="text-sm text-muted-foreground">{selectedRecord.description}</p>
                    </div>
                  )}
                  
                  {selectedRecord.diagnosis && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Diagnosis</p>
                      <p className="text-sm text-muted-foreground">{selectedRecord.diagnosis}</p>
                    </div>
                  )}
                  
                  {selectedRecord.treatment && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Treatment</p>
                      <p className="text-sm text-muted-foreground">{selectedRecord.treatment}</p>
                    </div>
                  )}
                  
                  {selectedRecord.medications && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Medications</p>
                      <p className="text-sm text-muted-foreground">{selectedRecord.medications}</p>
                    </div>
                  )}
                  
                  {selectedRecord.notes && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground">{selectedRecord.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-4">
                    <button className="flex-1 py-3 border border-border hover:bg-muted rounded-xl transition-all text-sm font-semibold">
                      <Download className="h-4 w-4 inline mr-2" />
                      Export
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(selectedRecord.id)}
                      className="flex-1 py-3 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl transition-all text-sm font-semibold"
                    >
                      <Trash2 className="h-4 w-4 inline mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No record selected</p>
                <p className="text-sm text-muted-foreground">Select a record to view details</p>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Record Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm text-muted-foreground">Total Records</span>
                  <span className="font-bold">{records.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="font-bold text-primary">
                    {records.filter((r) => r.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/5 rounded-xl">
                  <span className="text-sm text-muted-foreground">Injuries</span>
                  <span className="font-bold text-accent">
                    {records.filter((r) => r.type === 'injury').length}
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
