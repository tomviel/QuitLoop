'use client';

interface LeaderboardEntry {
  rank: number;
  label: string;
  weeklyScore: number;
  totalScore: number;
  isMe: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
  totalParticipants: number;
  isTopTenPct: boolean;
  weekStart: string;
}

interface LeaderboardClientProps {
  data: LeaderboardData;
}

const RANK_ICONS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function formatWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function LeaderboardClient({ data }: LeaderboardClientProps) {
  const { leaderboard, myRank, totalParticipants, isTopTenPct, weekStart } = data;

  return (
    <div className="space-y-4">
      {/* My rank summary */}
      {myRank !== null && (
        <div className={`card ${isTopTenPct ? 'border-primary/40 bg-primary/5' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Your rank this week</p>
              <p className="text-2xl font-bold text-text-primary">
                #{myRank}
                <span className="text-sm text-text-muted font-normal ml-2">
                  of {totalParticipants}
                </span>
              </p>
            </div>
            {isTopTenPct && (
              <div className="text-right">
                <span className="text-xs font-bold bg-primary text-white px-2.5 py-1 rounded-full">
                  TOP 10%
                </span>
                <p className="text-xs text-text-muted mt-1">Keep it up!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {myRank === null && (
        <div className="card border-border">
          <p className="text-sm text-text-secondary">
            Complete a session this week to appear on the leaderboard.
          </p>
        </div>
      )}

      {/* Week label */}
      <p className="text-xs text-text-muted px-1">
        Week of {formatWeekStart(weekStart)}
      </p>

      {/* Rankings */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">No rankings yet this week.</p>
          <p className="text-text-muted text-xs mt-1">
            Complete a session to start earning points!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
                entry.isMe
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-bg-surface border-border'
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {RANK_ICONS[entry.rank] ? (
                  <span className="text-xl">{RANK_ICONS[entry.rank]}</span>
                ) : (
                  <span className="text-sm font-bold text-text-muted">
                    #{entry.rank}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${
                    entry.isMe ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {entry.label}
                </p>
                <p className="text-xs text-text-muted">
                  {entry.totalScore} total pts
                </p>
              </div>

              {/* Weekly score */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-text-primary">
                  {entry.weeklyScore}
                </p>
                <p className="text-xs text-text-muted">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
