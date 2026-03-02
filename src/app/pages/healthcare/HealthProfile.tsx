import { useState } from 'react';
import {
  Heart,
  Edit,
  Save,
  X,
  User,
  Calendar,
  Activity,
  Ruler,
  Weight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function HealthProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: 'Jordan',
    lastName: 'Smith',
    dateOfBirth: '1995-06-15',
    gender: 'male',
    bloodType: 'O+',
    height: 178,
    
    // Current Health Metrics
    weight: 75.5,
    bodyFat: 18.5,
    muscleMass: 34.2,
    restingHeartRate: 62,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    
    // Medical History
    allergies: 'Pollen, Penicillin',
    chronicConditions: 'None',
    medications: 'None',
    emergencyContact: '+33 6 12 34 56 78',
    emergencyContactName: 'Marie Smith',
    
    // Fitness Level
    fitnessLevel: 'intermediate',
    activityLevel: 'active',
    weeklyExerciseHours: 8,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend/Supabase
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // Show success toast
  };

  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false);
  };

  const calculateBMI = () => {
    const heightInMeters = profileData.height / 100;
    return (profileData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateAge = () => {
    const today = new Date();
    const birthDate = new Date(profileData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: 'Underweight', color: 'text-accent' };
    if (bmi < 25) return { status: 'Healthy', color: 'text-primary' };
    if (bmi < 30) return { status: 'Overweight', color: 'text-accent' };
    return { status: 'Obese', color: 'text-destructive' };
  };

  const bmi = parseFloat(calculateBMI());
  const bmiStatus = getBMIStatus(bmi);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Health Profile</h1>
              <p className="text-muted-foreground">
                Manage your personal health information and metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all"
                  >
                    <X className="h-4 w-4 inline mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h3>Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Gender</label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Blood Type</label>
                  <select
                    name="bloodType"
                    value={profileData.bloodType}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={profileData.height}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Current Health Metrics */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-primary" />
                <h3>Current Health Metrics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={profileData.weight}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="bodyFat"
                    value={profileData.bodyFat}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Muscle Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="muscleMass"
                    value={profileData.muscleMass}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Resting Heart Rate (bpm)</label>
                  <input
                    type="number"
                    name="restingHeartRate"
                    value={profileData.restingHeartRate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Blood Pressure (Systolic)</label>
                  <input
                    type="number"
                    name="bloodPressureSystolic"
                    value={profileData.bloodPressureSystolic}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Blood Pressure (Diastolic)</label>
                  <input
                    type="number"
                    name="bloodPressureDiastolic"
                    value={profileData.bloodPressureDiastolic}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="h-5 w-5 text-accent" />
                <h3>Medical History</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Allergies</label>
                  <textarea
                    name="allergies"
                    value={profileData.allergies}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    placeholder="List any allergies..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Chronic Conditions</label>
                  <textarea
                    name="chronicConditions"
                    value={profileData.chronicConditions}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    placeholder="List any chronic conditions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Current Medications</label>
                  <textarea
                    name="medications"
                    value={profileData.medications}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={2}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    placeholder="List current medications..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={profileData.emergencyContactName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fitness Level */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3>Fitness Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Fitness Level</label>
                  <select
                    name="fitnessLevel"
                    value={profileData.fitnessLevel}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Activity Level</label>
                  <select
                    name="activityLevel"
                    value={profileData.activityLevel}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very-active">Very Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Weekly Exercise Hours</label>
                  <input
                    type="number"
                    name="weeklyExerciseHours"
                    value={profileData.weeklyExerciseHours}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Health Summary */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Profile Summary</h3>
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <p className="font-bold text-lg">
                  {profileData.firstName} {profileData.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{calculateAge()} years old</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm text-muted-foreground">Blood Type</span>
                  <span className="font-bold">{profileData.bloodType}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm text-muted-foreground">Height</span>
                  <span className="font-bold">{profileData.height} cm</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                  <span className="text-sm text-muted-foreground">Weight</span>
                  <span className="font-bold">{profileData.weight} kg</span>
                </div>
              </div>
            </div>

            {/* BMI Calculator */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="h-5 w-5 text-primary" />
                <h3>BMI Calculator</h3>
              </div>
              <div className="text-center p-6 bg-primary/5 rounded-xl mb-4">
                <div className="text-5xl font-bold text-primary mb-2">{calculateBMI()}</div>
                <div className={`text-sm font-semibold ${bmiStatus.color}`}>
                  {bmiStatus.status}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Underweight</span>
                  <span>&lt; 18.5</span>
                </div>
                <div className="flex justify-between text-primary font-semibold">
                  <span>Healthy</span>
                  <span>18.5 - 24.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overweight</span>
                  <span>25 - 29.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Obese</span>
                  <span>≥ 30</span>
                </div>
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-accent" />
                <h3>Health Tips</h3>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    💚 Your BMI is in the healthy range. Maintain your current lifestyle!
                  </p>
                </div>
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    🏃 Your activity level is great. Keep up the {profileData.weeklyExerciseHours} hours per week!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
