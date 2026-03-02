import { Trophy, Calendar, Clock, MapPin, Users, TrendingUp, Flame } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

export function Matches() {
  const upcomingMatches = [
    {
      id: 1,
      opponent: "Street Warriors",
      date: "Feb 5, 2026",
      time: "6:00 PM",
      venue: "Central Arena",
      type: "League Match",
      status: "upcoming",
    },
    {
      id: 2,
      opponent: "Urban Legends",
      date: "Feb 8, 2026",
      time: "5:30 PM",
      venue: "City Stadium",
      type: "Tournament",
      status: "upcoming",
    },
    {
      id: 3,
      opponent: "Night Hawks",
      date: "Feb 12, 2026",
      time: "7:00 PM",
      venue: "West Sports Complex",
      type: "Friendly",
      status: "upcoming",
    },
  ];

  const recentMatches = [
    {
      id: 1,
      opponent: "Thunder FC",
      score: "3 - 1",
      result: "won",
      date: "Jan 29, 2026",
    },
    {
      id: 2,
      opponent: "Storm Chasers",
      score: "2 - 2",
      result: "draw",
      date: "Jan 26, 2026",
    },
    {
      id: 3,
      opponent: "Fire Dragons",
      score: "1 - 2",
      result: "lost",
      date: "Jan 22, 2026",
    },
  ];

  const tournamentBracket = [
    {
      round: "Quarter Finals",
      matches: [
        { team1: "Thunder Strikers", team2: "Street Warriors", winner: "Thunder Strikers" },
        { team1: "Urban Legends", team2: "Night Hawks", winner: null },
      ],
    },
    {
      round: "Semi Finals",
      matches: [
        { team1: "Thunder Strikers", team2: "TBD", winner: null },
        { team1: "TBD", team2: "TBD", winner: null },
      ],
    },
    {
      round: "Finals",
      matches: [{ team1: "TBD", team2: "TBD", winner: null }],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-56 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center shadow-2xl">
                <Trophy className="h-8 w-8 text-accent-foreground" />
              </div>
              <div>
                <h1 className="mb-1">Match & Tournament Arena</h1>
                <p className="text-muted-foreground">
                  Track your competitions and climb the leaderboards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">48</div>
            </div>
            <div className="text-sm text-muted-foreground">Total Wins</div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div className="text-2xl font-bold">72%</div>
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Flame className="h-5 w-5" style={{ color: '#06D6A0' }} />
              </div>
              <div className="text-2xl font-bold">5</div>
            </div>
            <div className="text-sm text-muted-foreground">Win Streak</div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div className="text-2xl font-bold">#3</div>
            </div>
            <div className="text-sm text-muted-foreground">League Rank</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Matches Timeline */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Upcoming Matches</h3>
              <div className="space-y-4">
                {upcomingMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="relative p-5 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl hover:from-primary/10 hover:to-primary/5 transition-all border border-border hover:border-primary/50"
                  >
                    {index < upcomingMatches.length - 1 && (
                      <div className="absolute left-8 top-full h-4 w-0.5 bg-border" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                        <Trophy className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="mb-1">vs {match.opponent}</h4>
                            <span className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full">
                              {match.type}
                            </span>
                          </div>
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                            Details
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {match.date}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {match.time}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {match.venue}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
                + Schedule New Match
              </button>
            </div>

            {/* Tournament Bracket */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Tournament Bracket - Street League Championship</h3>
              <div className="space-y-8 overflow-x-auto pb-4">
                <div className="flex gap-8 min-w-max">
                  {tournamentBracket.map((round, roundIndex) => (
                    <div key={roundIndex} className="flex-1 min-w-[280px]">
                      <h4 className="text-sm font-semibold mb-4 text-center text-muted-foreground">
                        {round.round}
                      </h4>
                      <div className="space-y-12">
                        {round.matches.map((match, matchIndex) => (
                          <div
                            key={matchIndex}
                            className="bg-muted/30 rounded-xl border border-border overflow-hidden"
                          >
                            <div
                              className={`p-4 border-b border-border ${
                                match.winner === match.team1
                                  ? "bg-primary/10 border-l-4 border-l-primary"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{match.team1}</span>
                                {match.winner === match.team1 && (
                                  <Trophy className="h-4 w-4 text-primary" />
                                )}
                              </div>
                            </div>
                            <div
                              className={`p-4 ${
                                match.winner === match.team2
                                  ? "bg-primary/10 border-l-4 border-l-primary"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`${
                                    match.team2 === "TBD"
                                      ? "text-muted-foreground italic"
                                      : "font-semibold"
                                  }`}
                                >
                                  {match.team2}
                                </span>
                                {match.winner === match.team2 && (
                                  <Trophy className="h-4 w-4 text-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Results */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-6">Recent Results</h3>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">{match.opponent}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          match.result === "won"
                            ? "bg-primary/10 text-primary"
                            : match.result === "lost"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {match.result.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{match.score}</span>
                      <span className="text-xs text-muted-foreground">{match.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/30">
                  Register for Tournament
                </button>
                <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                  Challenge Team
                </button>
                <button className="w-full py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all">
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
