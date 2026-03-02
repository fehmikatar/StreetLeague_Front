import { Trophy, Users, Target, TrendingUp, Plus, UserPlus } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export function Home() {
  const stats = [
    { label: "Matches Won", value: "48", icon: Trophy, change: "+12%" },
    { label: "Team Rating", value: "4.8", icon: Target, change: "+0.3" },
    { label: "Active Members", value: "24", icon: Users, change: "+5" },
    { label: "Win Rate", value: "72%", icon: TrendingUp, change: "+8%" },
  ];

  const badges = [
    { name: "Champion", icon: "🏆", earned: true },
    { name: "MVP", icon: "⭐", earned: true },
    { name: "Team Player", icon: "🤝", earned: true },
    { name: "Rookie Legend", icon: "🎯", earned: false },
    { name: "Marathon", icon: "🏃", earned: true },
    { name: "Perfect Score", icon: "💯", earned: false },
  ];

  const teamRoster = [
    { id: 1, name: "Alex Rivera", role: "Captain", avatar: "AR", status: "online" },
    { id: 2, name: "Morgan Lee", role: "Forward", avatar: "ML", status: "online" },
    { id: 3, name: "Jordan Chen", role: "Defender", avatar: "JC", status: "offline" },
    { id: 4, name: "Taylor Brooks", role: "Midfielder", avatar: "TB", status: "online" },
    { id: 5, name: "Casey Kim", role: "Goalkeeper", avatar: "CK", status: "offline" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1766823968084-a7b6f184fab5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwYXJlbmF8ZW58MXx8fHwxNzY5OTQzOTYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Stadium"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2">Welcome Back, Jordan! 👋</h1>
            <p className="text-muted-foreground">Ready to dominate the street league today?</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile & Badges */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Your Sports Profile</h3>
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1762025930827-9f1dda45aff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwcGxheWVyJTIwYWN0aW9ufGVufDF8fHx8MTc3MDAxMTM1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Profile"
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary border-4 border-card flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">12</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">Jordan Smith</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Multi-Sport Athlete • Level 12
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next Level</span>
                      <span className="font-semibold">2,450 / 3,000 XP</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: "82%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">156</div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-2xl font-bold text-accent">89</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-2xl font-bold" style={{ color: '#06D6A0' }}>32h</div>
                  <div className="text-xs text-muted-foreground">Played</div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3>Badges & Achievements</h3>
                <span className="text-sm text-muted-foreground">4/6 Earned</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.name}
                    className={`text-center p-4 rounded-xl border-2 transition-all ${
                      badge.earned
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-muted/30 opacity-50"
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className="text-xs font-semibold">{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Roster */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="mb-1">Your Team Roster</h3>
                <p className="text-sm text-muted-foreground">Thunder Strikers</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Recruit</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Join Team</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {teamRoster.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                      {member.avatar}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${
                        member.status === "online" ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.role}</div>
                  </div>
                  <button className="px-3 py-1 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                    View
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
              + Add More Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
