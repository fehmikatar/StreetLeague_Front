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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

export default function UserDashboard() {
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('user_name') || 'Utilisateur';
    const type = localStorage.getItem('user_type') || 'player';
    setUserName(name);
    setUserType(type);
  }, []);

  // Mock data
  const upcomingMatches = [
    {
      id: 1,
      title: 'Match de Football',
      location: 'Terrain Parc Central',
      date: '2026-02-10',
      time: '18:00',
      type: 'Football',
    },
    {
      id: 2,
      title: 'Match de Basketball',
      location: 'Court Premium',
      date: '2026-02-12',
      time: '20:00',
      type: 'Basketball',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Réservation confirmée',
      description: 'Terrain de foot Parc Central',
      time: 'Il y a 2 heures',
      icon: MapPin,
    },
    {
      id: 2,
      action: 'Match terminé',
      description: 'Victoire 3-2 contre Les Aigles',
      time: 'Il y a 1 jour',
      icon: Trophy,
    },
    {
      id: 3,
      action: 'Nouveau membre',
      description: 'Sophie Martin a rejoint votre équipe',
      time: 'Il y a 2 jours',
      icon: Users,
    },
  ];

  const stats = [
    {
      label: 'Matchs joués',
      value: '24',
      icon: Trophy,
      color: 'primary',
      trend: '+12%',
    },
    {
      label: 'Heures de jeu',
      value: '48h',
      icon: Clock,
      color: 'accent',
      trend: '+8%',
    },
    {
      label: 'Terrains visités',
      value: '12',
      icon: MapPin,
      color: 'primary',
      trend: '+3',
    },
    {
      label: 'Note moyenne',
      value: '4.8',
      icon: Star,
      color: 'accent',
      trend: '+0.2',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="mb-2">
            Bienvenue, <span className="text-primary">{userName}</span> 👋
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de votre activité sportive
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
                <div className="font-semibold mb-1">Réserver</div>
                <div className="text-sm text-muted-foreground">Un terrain</div>
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
                <div className="font-semibold mb-1">Matchs</div>
                <div className="text-sm text-muted-foreground">Voir tout</div>
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
                <div className="font-semibold mb-1">Équipe</div>
                <div className="text-sm text-muted-foreground">Gérer</div>
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
                <div className="text-sm text-muted-foreground">Voir mes performances</div>
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
                  Prochains matchs
                </h3>
                <Link
                  to="/app/matches"
                  className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  Voir tout
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
                          {new Date(match.date).toLocaleDateString('fr-FR', {
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
                  <div className="font-semibold mb-1">Organiser un nouveau match</div>
                  <div className="text-sm text-muted-foreground">
                    Réservez un terrain et invitez votre équipe
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
                  Activité récente
                </h3>
                <Link
                  to="/app/notifications"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Tout voir
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
                <h3>Progression ce mois-ci</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Matchs gagnés</span>
                  <span className="font-semibold">75%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Objectif mensuel</span>
                  <span className="font-semibold">8/10</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <Link
                to="/performance"
                className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-all"
              >
                Voir mes stats complètes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}