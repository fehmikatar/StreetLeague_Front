import { Link } from 'react-router';
import {
  Trophy,
  MapPin,
  Calendar,
  Activity,
  Users,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Bell,
  Target,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

export default function UserDashboard() {
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'User';
    const type = localStorage.getItem('user_type') || 'player';
    setUserName(name);
    setUserType(type);
  }, []);

  const storedUserId = localStorage.getItem('user_id');
  const playerId = storedUserId ? parseInt(storedUserId, 10) : 1;

  const { data: performances, isLoading } = useQuery({
    queryKey: ['performances'],
    queryFn: performanceService.getAll,
  });

  const playerPerfs = performances?.filter(p => p.playerId === playerId) || [];
  const matchesPlayed = playerPerfs.length;
  const timePlayedHours = Math.round(playerPerfs.reduce((acc, p) => acc + p.timePlayed, 0) / 60);
  const avgRating = matchesPlayed > 0 ? (playerPerfs.reduce((acc, p) => acc + p.rating, 0) / matchesPlayed).toFixed(1) : '0.0';
  const totalDistance = playerPerfs.reduce((acc, p) => acc + p.distanceCovered, 0).toFixed(1);

  // Mock data
  const upcomingMatches = [
    {
      id: 1,
      title: 'Football Match',
      location: 'Central Park Field',
      date: '2026-02-10',
      time: '18:00',
      type: 'Football',
    },
    {
      id: 2,
      title: 'Basketball Match',
      location: 'Premium Court',
      date: '2026-02-12',
      time: '20:00',
      type: 'Basketball',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Booking confirmed',
      description: 'Central Park football field',
      time: '2 hours ago',
      icon: MapPin,
    },
    {
      id: 2,
      action: 'Match finished',
      description: 'Victory 3-2 against The Eagles',
      time: '1 day ago',
      icon: Trophy,
    },
    {
      id: 3,
      action: 'New member',
      description: 'Sophie Martin joined your team',
      time: '2 days ago',
      icon: Users,
    },
  ];

  const stats = [
    {
      label: 'Matches played',
      value: matchesPlayed.toString(),
      icon: Trophy,
      color: 'primary',
      trend: 'Total',
    },
    {
      label: 'Playtime (hours)',
      value: `${timePlayedHours}h`,
      icon: Clock,
      color: 'accent',
      trend: 'Cumulative',
    },
    {
      label: 'Distance (km)',
      value: totalDistance,
      icon: MapPin,
      color: 'primary',
      trend: 'Covered',
    },
    {
      label: 'Average rating',
      value: avgRating,
      icon: Star,
      color: 'accent',
      trend: '/ 10',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="mb-2">
            Welcome, <span className="text-primary">{userName}</span> 👋
          </h1>
          <p className="text-muted-foreground">
            Here is an overview of your sports activity
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/app/booking"
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold mb-1">Book</div>
                <div className="text-sm text-muted-foreground">A field</div>
              </div>
            </div>
          </Link>

          <Link
            to="/app/matches"
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="font-semibold mb-1">Matches</div>
                <div className="text-sm text-muted-foreground">See all</div>
              </div>
            </div>
          </Link>

          <Link
            to="/app/team"
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold mb-1">Team</div>
                <div className="text-sm text-muted-foreground">Manage</div>
              </div>
            </div>
          </Link>

          <Link
            to="/app/performance"
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="font-semibold mb-1">Stats</div>
                <div className="text-sm text-muted-foreground">View my performances</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}/10 rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    {stat.trend}
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Matches */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming matches
                </h3>
                <Link
                  to="/app/matches"
                  className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  See all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/app/matches/${match.id}`}
                    className="block bg-muted/50 rounded-xl p-4 hover:bg-muted transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-primary/10 text-primary border-0">
                            {match.type}
                          </Badge>
                          <h4 className="font-semibold group-hover:text-primary transition-colors">
                            {match.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{match.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{match.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {new Date(match.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(match.date).getFullYear()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                <Link
                  to="/booking"
                  className="block bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 text-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all"
                >
                  <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-semibold mb-1">Organize a new match</div>
                  <div className="text-sm text-muted-foreground">
                    Book a field and invite your team
                  </div>
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-accent" />
                  Recent activity
                </h3>
                <Link
                  to="/app/notifications"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  See all
                </Link>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-1">{activity.action}</div>
                        <div className="text-sm text-muted-foreground mb-1 truncate">
                          {activity.description}
                        </div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Performance Summary */}
            <Card className="p-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3>Progress this month</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Matches won</span>
                  <span className="font-semibold">75%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly goal</span>
                  <span className="font-semibold">8/10</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <Link
                to="/app/performance"
                className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-all"
              >
                View my complete stats
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}