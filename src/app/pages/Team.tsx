import { Users, Crown, Shield, Zap, MessageCircle, Calendar, Trophy } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useState } from "react";
import { PlayerProfileModal } from "@/app/components/modals/PlayerProfileModal";

export function Team() {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const handleViewProfile = (member: any) => {
    setSelectedPlayer(member);
    setShowProfileModal(true);
  };

  const handleSendMessage = (member: any) => {
    alert(`Messagerie ouverte pour ${member.name}`);
  };

  const teamMembers = [
    {
      id: 1,
      name: "Alex Rivera",
      role: "Captain",
      position: "Forward",
      avatar: "AR",
      stats: { matches: 45, goals: 32, assists: 18 },
      status: "online",
    },
    {
      id: 2,
      name: "Morgan Lee",
      role: "Vice Captain",
      position: "Midfielder",
      avatar: "ML",
      stats: { matches: 43, goals: 15, assists: 28 },
      status: "online",
    },
    {
      id: 3,
      name: "Jordan Chen",
      role: "Member",
      position: "Defender",
      avatar: "JC",
      stats: { matches: 40, goals: 5, assists: 12 },
      status: "offline",
    },
    {
      id: 4,
      name: "Taylor Brooks",
      role: "Member",
      position: "Midfielder",
      avatar: "TB",
      stats: { matches: 38, goals: 20, assists: 15 },
      status: "online",
    },
    {
      id: 5,
      name: "Casey Kim",
      role: "Member",
      position: "Goalkeeper",
      avatar: "CK",
      stats: { matches: 42, goals: 0, assists: 8 },
      status: "offline",
    },
    {
      id: 6,
      name: "Sam Taylor",
      role: "Member",
      position: "Forward",
      avatar: "ST",
      stats: { matches: 35, goals: 28, assists: 10 },
      status: "online",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Team Practice",
      date: "Feb 3, 2026",
      time: "6:00 PM",
      location: "Central Arena",
    },
    {
      id: 2,
      title: "Strategy Meeting",
      date: "Feb 5, 2026",
      time: "7:30 PM",
      location: "Online",
    },
    {
      id: 3,
      title: "Championship Match",
      date: "Feb 8, 2026",
      time: "5:00 PM",
      location: "City Stadium",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Team Header */}
      <div className="relative h-48 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1752681305099-89eab8580496?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjB0ZWFtJTIwc3BvcnRzfGVufDF8fHx8MTc3MDA0NTA0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Team Banner"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl border-4 border-background">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="mb-2">Thunder Strikers</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />6 Members
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Rank #3
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    2,450 Points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border text-center">
            <div className="text-3xl font-bold text-primary mb-1">48</div>
            <div className="text-sm text-muted-foreground">Matches Won</div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border text-center">
            <div className="text-3xl font-bold text-accent mb-1">156</div>
            <div className="text-sm text-muted-foreground">Total Goals</div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border text-center">
            <div className="text-3xl font-bold" style={{ color: '#06D6A0' }}>72%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border text-center">
            <div className="text-3xl font-bold mb-1">4.8</div>
            <div className="text-sm text-muted-foreground">Team Rating</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Members */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3>Team Members</h3>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                  + Recruit Player
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-muted/30 rounded-2xl p-5 hover:bg-muted/50 transition-all border border-transparent hover:border-primary/30"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                          {member.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${
                            member.status === "online" ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base">{member.name}</h4>
                          {member.role === "Captain" && (
                            <Crown className="h-4 w-4 text-accent" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {member.position}
                        </p>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <div className="font-bold text-primary">{member.stats.matches}</div>
                        <div className="text-xs text-muted-foreground">Matches</div>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <div className="font-bold text-accent">{member.stats.goals}</div>
                        <div className="text-xs text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <div className="font-bold" style={{ color: '#06D6A0' }}>{member.stats.assists}</div>
                        <div className="text-xs text-muted-foreground">Assists</div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        className="flex-1 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                        onClick={() => handleSendMessage(member)}
                      >
                        <MessageCircle className="h-4 w-4 inline mr-1" />
                        Message
                      </button>
                      <button
                        className="flex-1 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-all"
                        onClick={() => handleViewProfile(member)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold mb-1">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1">
                          {event.date} • {event.time}
                        </p>
                        <p className="text-xs text-accent">{event.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => alert('Planification d\'entraînement ouverte')}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                >
                  Schedule Practice
                </button>
                <button 
                  onClick={() => alert('Nouveau défi lancé!')}
                  className="w-full py-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30"
                >
                  Start Challenge
                </button>
                <button 
                  onClick={() => alert('Paramètres d\'équipe')}
                  className="w-full py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all"
                >
                  Team Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Profile Modal */}
      {showProfileModal && selectedPlayer && (
        <PlayerProfileModal 
          player={selectedPlayer} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
}