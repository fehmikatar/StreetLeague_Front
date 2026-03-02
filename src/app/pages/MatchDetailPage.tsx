import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  Target,
  Activity,
  TrendingUp,
  Share2,
  Bell,
  Edit,
} from 'lucide-react';

// This would typically come from route params and API
const MOCK_MATCH = {
  id: '123',
  title: 'Thunder Strikers vs Lightning FC',
  status: 'upcoming', // upcoming, live, completed
  date: '2026-02-10',
  time: '18:00',
  venue: {
    name: 'Municipal Football Field',
    address: '123 Rue du Sport, Paris',
  },
  teams: {
    home: {
      name: 'Thunder Strikers',
      logo: 'TS',
      players: 11,
      score: null,
      lineup: [
        { id: '1', name: 'Jordan Smith', position: 'Captain', jersey: '10', avatar: 'JS' },
        { id: '2', name: 'Alex Rivera', position: 'Forward', jersey: '9', avatar: 'AR' },
        { id: '3', name: 'Morgan Lee', position: 'Midfielder', jersey: '8', avatar: 'ML' },
        { id: '4', name: 'Taylor Brooks', position: 'Defender', jersey: '5', avatar: 'TB' },
        { id: '5', name: 'Casey Kim', position: 'Goalkeeper', jersey: '1', avatar: 'CK' },
      ],
    },
    away: {
      name: 'Lightning FC',
      logo: 'LFC',
      players: 11,
      score: null,
      lineup: [
        { id: '6', name: 'Sam Wilson', position: 'Captain', jersey: '10', avatar: 'SW' },
        { id: '7', name: 'Jamie Fox', position: 'Forward', jersey: '11', avatar: 'JF' },
        { id: '8', name: 'Chris Park', position: 'Midfielder', jersey: '7', avatar: 'CP' },
        { id: '9', name: 'Drew Martinez', position: 'Defender', jersey: '4', avatar: 'DM' },
        { id: '10', name: 'Riley Chen', position: 'Goalkeeper', jersey: '1', avatar: 'RC' },
      ],
    },
  },
  tournament: 'StreetLeague Spring Cup 2026',
  matchType: 'Tournament - Quarter Finals',
  referee: 'Jean Dupont',
  weather: {
    condition: 'Partly Cloudy',
    temperature: '18°C',
  },
  ticketPrice: 10,
  attendees: 45,
  maxAttendees: 100,
};

const COMPLETED_MATCH = {
  ...MOCK_MATCH,
  status: 'completed',
  teams: {
    home: {
      ...MOCK_MATCH.teams.home,
      score: 3,
    },
    away: {
      ...MOCK_MATCH.teams.away,
      score: 2,
    },
  },
  stats: {
    possession: { home: 58, away: 42 },
    shots: { home: 15, away: 12 },
    shotsOnTarget: { home: 8, away: 6 },
    corners: { home: 7, away: 5 },
    fouls: { home: 12, away: 15 },
    yellowCards: { home: 2, away: 3 },
    redCards: { home: 0, away: 0 },
  },
  timeline: [
    { time: '5\'', type: 'goal', team: 'home', player: 'Alex Rivera', description: 'Great header from corner' },
    { time: '23\'', type: 'goal', team: 'away', player: 'Jamie Fox', description: 'Penalty conversion' },
    { time: '42\'', type: 'card', team: 'away', player: 'Chris Park', cardType: 'yellow', description: 'Dangerous tackle' },
    { time: '58\'', type: 'goal', team: 'home', player: 'Jordan Smith', description: 'Long-range strike' },
    { time: '67\'', type: 'goal', team: 'away', player: 'Sam Wilson', description: 'Counter-attack finish' },
    { time: '85\'', type: 'goal', team: 'home', player: 'Morgan Lee', description: 'Close-range tap-in' },
  ],
  mvp: {
    name: 'Jordan Smith',
    avatar: 'JS',
    rating: 9.2,
    stats: '2 goals, 1 assist',
  },
};

export default function MatchDetailPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'lineup' | 'stats'>('overview');
  const [match] = useState(MOCK_MATCH); // Use COMPLETED_MATCH to see completed state
  const [isAttending, setIsAttending] = useState(false);

  const isUpcoming = match.status === 'upcoming';
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to matches
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Match Header Card */}
        <div className="bg-card rounded-2xl p-8 border border-border mb-8">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {isLive && (
                <span className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full font-semibold animate-pulse">
                  <span className="h-2 w-2 bg-destructive rounded-full" />
                  LIVE
                </span>
              )}
              {isUpcoming && (
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-full font-semibold">
                  Upcoming
                </span>
              )}
              {isCompleted && (
                <span className="px-4 py-2 bg-muted text-foreground rounded-full font-semibold">
                  Final
                </span>
              )}
              <span className="px-4 py-2 bg-accent/10 text-accent rounded-full font-semibold">
                {match.matchType}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-xl bg-muted hover:bg-muted/70 transition-all">
                <Share2 className="h-5 w-5" />
              </button>
              {isUpcoming && (
                <button className="p-3 rounded-xl bg-muted hover:bg-muted/70 transition-all">
                  <Bell className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-8 items-center mb-6">
            {/* Home Team */}
            <div className="text-center">
              <div className="h-24 w-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                {match.teams.home.logo}
              </div>
              <h3 className="mb-1">{match.teams.home.name}</h3>
              <p className="text-sm text-muted-foreground">{match.teams.home.players} players</p>
            </div>

            {/* Score or Time */}
            <div className="text-center">
              {isCompleted && 'score' in match.teams.home ? (
                <div className="flex items-center justify-center gap-6">
                  <div className="text-6xl font-bold text-primary">{match.teams.home.score}</div>
                  <div className="text-3xl text-muted-foreground">-</div>
                  <div className="text-6xl font-bold text-accent">{match.teams.away.score}</div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl font-bold mb-2">{match.time}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(match.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <div className="h-24 w-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                {match.teams.away.logo}
              </div>
              <h3 className="mb-1">{match.teams.away.name}</h3>
              <p className="text-sm text-muted-foreground">{match.teams.away.players} players</p>
            </div>
          </div>

          {/* Match Info */}
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold">{match.venue.name}</div>
                <div className="text-xs text-muted-foreground">{match.venue.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-accent" />
              <div>
                <div className="text-sm font-semibold">{match.tournament}</div>
                <div className="text-xs text-muted-foreground">Tournament</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold">
                  {match.attendees}/{match.maxAttendees} attending
                </div>
                <div className="text-xs text-muted-foreground">
                  {match.ticketPrice}€ per person
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-card rounded-2xl border border-border mb-8">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('lineup')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'lineup'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Lineup
            </button>
            {isCompleted && (
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  activeTab === 'stats'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Statistics
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {isUpcoming && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="mb-2">Join this match!</h4>
                        <p className="text-muted-foreground mb-4">
                          Show your support and be part of the action. Confirm your attendance now.
                        </p>
                        <button
                          onClick={() => setIsAttending(!isAttending)}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            isAttending
                              ? 'bg-muted text-foreground'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30'
                          }`}
                        >
                          {isAttending ? 'Cancel Attendance' : 'I\'m Attending'}
                        </button>
                      </div>
                      <Calendar className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="mb-4">Match Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-muted/30 rounded-xl">
                        <span className="text-muted-foreground">Date & Time</span>
                        <span className="font-semibold">
                          {new Date(match.date).toLocaleDateString()} at {match.time}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted/30 rounded-xl">
                        <span className="text-muted-foreground">Referee</span>
                        <span className="font-semibold">{match.referee}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted/30 rounded-xl">
                        <span className="text-muted-foreground">Weather</span>
                        <span className="font-semibold">
                          {match.weather.condition}, {match.weather.temperature}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4">Venue Information</h4>
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <div className="font-semibold mb-2">{match.venue.name}</div>
                      <div className="text-sm text-muted-foreground mb-4">{match.venue.address}</div>
                      <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lineup Tab */}
            {activeTab === 'lineup' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Home Team */}
                <div>
                  <h4 className="mb-4 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {match.teams.home.logo}
                    </span>
                    {match.teams.home.name}
                  </h4>
                  <div className="space-y-2">
                    {match.teams.home.lineup.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {player.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-muted-foreground">{player.position}</div>
                        </div>
                        <div className="text-2xl font-bold text-primary">#{player.jersey}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Away Team */}
                <div>
                  <h4 className="mb-4 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {match.teams.away.logo}
                    </span>
                    {match.teams.away.name}
                  </h4>
                  <div className="space-y-2">
                    {match.teams.away.lineup.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {player.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-muted-foreground">{player.position}</div>
                        </div>
                        <div className="text-2xl font-bold text-accent">#{player.jersey}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab (only for completed matches) */}
            {activeTab === 'stats' && isCompleted && 'stats' in COMPLETED_MATCH && (
              <div className="space-y-6">
                {/* MVP */}
                {'mvp' in COMPLETED_MATCH && (
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <Trophy className="h-12 w-12 text-accent" />
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Man of the Match</div>
                        <h3>{COMPLETED_MATCH.mvp.name}</h3>
                        <p className="text-muted-foreground">{COMPLETED_MATCH.mvp.stats}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary">{COMPLETED_MATCH.mvp.rating}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Match Stats */}
                <div>
                  <h4 className="mb-4">Match Statistics</h4>
                  <div className="space-y-4">
                    {Object.entries(COMPLETED_MATCH.stats).map(([key, value]) => {
                      const homeValue = value.home;
                      const awayValue = value.away;
                      const total = homeValue + awayValue;
                      const homePercentage = (homeValue / total) * 100;

                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold">{homeValue}</span>
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-semibold">{awayValue}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                            <div
                              className="bg-primary"
                              style={{ width: `${homePercentage}%` }}
                            />
                            <div
                              className="bg-accent"
                              style={{ width: `${100 - homePercentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline */}
                {'timeline' in COMPLETED_MATCH && (
                  <div>
                    <h4 className="mb-4">Match Timeline</h4>
                    <div className="space-y-3">
                      {COMPLETED_MATCH.timeline.map((event, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-4 p-4 rounded-xl ${
                            event.team === 'home' ? 'bg-primary/5' : 'bg-accent/5'
                          }`}
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                              event.team === 'home'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-accent text-accent-foreground'
                            }`}
                          >
                            {event.time}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {event.type === 'goal' && <Target className="h-4 w-4" />}
                              {event.type === 'card' && <Activity className="h-4 w-4" />}
                              <span className="font-semibold">{event.player}</span>
                              {event.type === 'card' && (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    event.cardType === 'yellow'
                                      ? 'bg-accent text-accent-foreground'
                                      : 'bg-destructive text-destructive-foreground'
                                  }`}
                                >
                                  {event.cardType}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
