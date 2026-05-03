import { Trophy, Users, Target, TrendingUp, Plus, UserPlus, Loader2, Bot } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useQuery } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { badgeService } from '@/services/badgeService';
import { badgePlayerService } from '@/services/badgePlayerService';
import { playerLevelService } from '@/services/playerLevelService';

export function Home() {
  const storedUserId = localStorage.getItem('user_id');
  const playerId = storedUserId ? parseInt(storedUserId, 10) : 1;
  const userName = localStorage.getItem('user_name') || 'Player';
  const role = localStorage.getItem('user_type') === 'ROLE_ADMIN' ? 'Administrator' : 'Player';

  // Fetch Backend Data
  const { data: performances, isLoading: loadingPerf } = useQuery({
    queryKey: ['performances'],
    queryFn: performanceService.getAll,
  });

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: badgeService.getAll,
  });

  const { data: earnedBadges, isLoading: loadingEarned } = useQuery({
    queryKey: ['earnedBadges', playerId],
    queryFn: () => badgePlayerService.getEarnedByPlayer(playerId),
  });

  const { data: playerLevel, isLoading: loadingLevel } = useQuery({
    queryKey: ['playerLevel', playerId],
    queryFn: () => playerLevelService.getByPlayerId(playerId),
  });

  const isLoading = loadingPerf || loadingBadges || loadingEarned || loadingLevel;

  // Calcul des statistiques
  const playerPerfs = performances?.filter(p => p.playerId === playerId) || [];
  const matchesPlayed = playerPerfs.length;
  const totalGoals = playerPerfs.reduce((acc, p) => acc + p.score, 0);
  const timePlayed = Math.round(playerPerfs.reduce((acc, p) => acc + p.timePlayed, 0) / 60); // en heures
  const avgRating = matchesPlayed > 0 ? (playerPerfs.reduce((acc, p) => acc + p.rating, 0) / matchesPlayed).toFixed(1) : '0.0';

  const stats = [
    { label: "Matches Played", value: matchesPlayed.toString(), icon: Trophy, change: "Active" },
    { label: "Overall Rating", value: avgRating, icon: Target, change: "Average" },
    { label: "Goals Scored", value: totalGoals.toString(), icon: Users, change: "Total" },
    { label: "Playtime", value: `${timePlayed}h`, icon: TrendingUp, change: "Hours" },
  ];

  const badgesWithStatus = badges?.slice(0, 6).map(b => ({
    name: b.name,
    icon: b.iconUrl || "🏆", // Fallback si pas d'icône
    earned: earnedBadges?.some(eb => eb.badge.id === b.id) || false,
  })) || [];

  const teamRoster = [
    { id: 1, name: "Alex Rivera", role: "Captain", avatar: "AR", status: "online" },
    { id: 2, name: "Morgan Lee", role: "Forward", avatar: "ML", status: "online" },
    { id: 3, name: "Jordan Chen", role: "Defender", avatar: "JC", status: "offline" },
    { id: 4, name: "Taylor Brooks", role: "Midfielder", avatar: "TB", status: "online" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-primary">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading sports profile...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="mb-2">Welcome Back, {userName.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground">Ready to dominate the Street League today?</p>
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
                  <h4 className="mb-1">{userName}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {role} • Level {playerLevel?.level || 1} ({playerLevel?.rank || 'Novice'})
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next Level</span>
                      <span className="font-semibold">{playerLevel?.xp || 0} / {(playerLevel?.level || 1) * 1000} XP</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${Math.min(((playerLevel?.xp || 0) / ((playerLevel?.level || 1) * 1000)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{matchesPlayed}</div>
                  <div className="text-xs text-muted-foreground">Matches Played</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-2xl font-bold text-accent">{totalGoals}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-2xl font-bold" style={{ color: '#06D6A0' }}>{timePlayed}h</div>
                  <div className="text-xs text-muted-foreground">Playtime</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Link to="/app/ai-coach" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg">
                  <Bot className="w-5 h-5" />
                  Ask AI Coach
                </Link>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3>Badges & Achievements</h3>
                <span className="text-sm text-muted-foreground">{badgesWithStatus.filter(b => b.earned).length}/{badges?.length || 0} Earned</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {badgesWithStatus.map((badge) => (
                  <div
                    key={badge.name}
                    className={`text-center p-4 rounded-xl border-2 transition-all ${
                      badge.earned
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-muted/30 opacity-50"
                    }`}
                  >
                    <div className="text-3xl mb-2 flex justify-center">
                      {badge.icon.startsWith('http') ? <img src={badge.icon} alt={badge.name} className="h-8 w-8 object-contain" /> : badge.icon}
                    </div>
                    <div className="text-xs font-semibold break-words">{badge.name}</div>
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
