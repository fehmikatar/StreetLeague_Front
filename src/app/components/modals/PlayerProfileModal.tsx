import { X, Trophy, Target, Zap, Calendar } from 'lucide-react';

interface PlayerProfileModalProps {
  player: {
    name: string;
    avatar: string;
    position: string;
    stats: { matches: number; goals: number; assists: number };
  };
  onClose: () => void;
}

export function PlayerProfileModal({ player, onClose }: PlayerProfileModalProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Profil du Joueur</h2>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-muted transition-all flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Player Info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl">
              {player.avatar}
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">{player.name}</h3>
              <p className="text-muted-foreground mb-2">{player.position}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-primary/5 rounded-xl">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary mb-1">{player.stats.matches}</div>
              <div className="text-sm text-muted-foreground">Matchs</div>
            </div>
            <div className="text-center p-4 bg-accent/5 rounded-xl">
              <Target className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-accent mb-1">{player.stats.goals}</div>
              <div className="text-sm text-muted-foreground">Buts</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-xl">
              <Zap className="h-6 w-6 mx-auto mb-2" style={{ color: '#06D6A0' }} />
              <div className="text-2xl font-bold mb-1" style={{ color: '#06D6A0' }}>
                {player.stats.assists}
              </div>
              <div className="text-sm text-muted-foreground">Passes D.</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Activité Récente</h4>
            <div className="space-y-2">
              <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Match contre Thunder FC - 2 buts</span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Entraînement collectif - Présent</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">
              Envoyer un Message
            </button>
            <button className="flex-1 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/70 transition-all">
              Voir Statistiques Complètes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
