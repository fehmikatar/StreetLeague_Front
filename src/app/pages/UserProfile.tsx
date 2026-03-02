import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit2, Save, X, Shield, Bell, Lock, Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

type TabType = 'profile' | 'security' | 'preferences' | 'notifications';

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('user_name') || 'Jordan Smith',
    email: localStorage.getItem('user_email') || 'jordan.smith@example.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    birthdate: '1995-03-15',
    bio: 'Passionate football player and team captain. Love competing and building team spirit.',
    position: 'Midfielder',
    jerseyNumber: '10',
    sports: ['Football', 'Basketball', 'Tennis'],
  });

  const [tempData, setTempData] = useState(profileData);

  const [notificationSettings, setNotificationSettings] = useState({
    matchReminders: true,
    teamInvites: true,
    performanceUpdates: true,
    sponsorOffers: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    visibility: 'public',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = () => {
    setProfileData(tempData);
    localStorage.setItem('user_name', tempData.name);
    localStorage.setItem('user_email', tempData.email);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'preferences' as TabType, label: 'Preferences', icon: Bell },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-4 border border-border sticky top-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Profile Header Card */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start justify-between mb-6">
                    <h3>Personal Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                        >
                          <Save className="h-4 w-4" />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Avatar Section */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-bold">
                        {isEditing ? tempData.name.substring(0, 2).toUpperCase() : profileData.name.substring(0, 2).toUpperCase()}
                      </div>
                      {isEditing && (
                        <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all">
                          <Camera className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">{isEditing ? tempData.name : profileData.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {profileData.position} • Jersey #{profileData.jerseyNumber}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.sports.map((sport) => (
                          <span
                            key={sport}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold"
                          >
                            {sport}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <User className="inline h-4 w-4 mr-2" />
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempData.name}
                          onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl">{profileData.name}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Mail className="inline h-4 w-4 mr-2" />
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={tempData.email}
                          onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl">{profileData.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Phone className="inline h-4 w-4 mr-2" />
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={tempData.phone}
                          onChange={(e) => setTempData({ ...tempData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl">{profileData.phone}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Birth Date
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={tempData.birthdate}
                          onChange={(e) => setTempData({ ...tempData, birthdate: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl">
                          {new Date(profileData.birthdate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        <MapPin className="inline h-4 w-4 mr-2" />
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempData.location}
                          onChange={(e) => setTempData({ ...tempData, location: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl">{profileData.location}</div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Bio</label>
                      {isEditing ? (
                        <textarea
                          value={tempData.bio}
                          onChange={(e) => setTempData({ ...tempData, bio: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl">{profileData.bio}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sports Preferences */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="mb-6">Sports & Position</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Primary Position</label>
                      {isEditing ? (
                        <select
                          value={tempData.position}
                          onChange={(e) => setTempData({ ...tempData, position: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                          <option>Goalkeeper</option>
                          <option>Defender</option>
                          <option>Midfielder</option>
                          <option>Forward</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl">{profileData.position}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Jersey Number</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempData.jerseyNumber}
                          onChange={(e) => setTempData({ ...tempData, jerseyNumber: e.target.value })}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-muted/30 rounded-xl">{profileData.jerseyNumber}</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="mb-6">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Enter current password"
                        />
                        <button
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Enter new password"
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                      <Lock className="inline h-4 w-4 mr-2" />
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="mb-6">Two-Factor Authentication</h3>
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl mb-4">
                    <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Enhance your account security</p>
                      <p className="text-sm text-muted-foreground">
                        Enable two-factor authentication to add an extra layer of security to your account.
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                    Enable 2FA
                  </button>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border border-destructive/50">
                  <h3 className="mb-2 text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-6 py-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="mb-6">Account Preferences</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Language</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Timezone</label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="America/New_York">America/New York (GMT-5)</option>
                      <option value="America/Los_Angeles">America/Los Angeles (GMT-8)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Date Format</label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Profile Visibility</label>
                    <select
                      value={preferences.visibility}
                      onChange={(e) => setPreferences({ ...preferences, visibility: e.target.value })}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="public">Public - Everyone can see your profile</option>
                      <option value="friends">Friends Only - Only your team members</option>
                      <option value="private">Private - Only you</option>
                    </select>
                  </div>

                  <button className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="mb-6">Notification Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-4">Activity Notifications</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'matchReminders', label: 'Match Reminders', description: 'Get notified before your scheduled matches' },
                        { key: 'teamInvites', label: 'Team Invitations', description: 'Receive team and tournament invitations' },
                        { key: 'performanceUpdates', label: 'Performance Updates', description: 'New badges, achievements, and stats' },
                        { key: 'sponsorOffers', label: 'Sponsor Offers', description: 'Exclusive deals and promotions' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start justify-between p-4 bg-muted/30 rounded-xl">
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{item.label}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                              type="checkbox"
                              checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  [item.key]: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4">Notification Channels</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                        { key: 'pushNotifications', label: 'Push Notifications', icon: Bell },
                        { key: 'smsNotifications', label: 'SMS Notifications', icon: Phone },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-primary" />
                              <span className="font-semibold">{item.label}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                onChange={(e) =>
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    [item.key]: e.target.checked,
                                  })
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button className="w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                    Save Notification Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
