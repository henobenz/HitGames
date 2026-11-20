import React, { useState, useMemo } from 'react';
import { Trophy, Clock, Play, Trash2, Plus, Gamepad2, RotateCcw } from 'lucide-react';

function formatDuration(totalSeconds = 0) {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  }
  if (mins > 0) return `${mins}m ${rem}s`;
  return `${rem}s`;
}

export const LeaderboardView = ({
  games,
  playStats,
  leaderboardEntries,
  defaultPlayerName,
  onSaveScore,
  onDeleteScore,
  onResetStats,
  onSelectGame
}) => {
  const [filterGameId, setFilterGameId] = useState('all');
  const [playerName, setPlayerName] = useState(defaultPlayerName || '');
  const [selectedGameId, setSelectedGameId] = useState(games[0]?.id || 'eggy-car');
  const [scoreInput, setScoreInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const gameLookup = useMemo(() => {
    const map = {};
    games.forEach(g => { map[g.id] = g; });
    return map;
  }, [games]);

  const totals = useMemo(() => {
    let sessions = 0;
    let seconds = 0;
    let topGame = null;
    let topSessions = 0;

    Object.entries(playStats || {}).forEach(([id, stat]) => {
      sessions += stat.sessions || 0;
      seconds += stat.totalSeconds || 0;
      if ((stat.sessions || 0) > topSessions && gameLookup[id]) {
        topSessions = stat.sessions || 0;
        topGame = gameLookup[id];
      }
    });

    return { sessions, seconds, topGame };
  }, [playStats, gameLookup]);

  const rankedGamesByActivity = useMemo(() => {
    return Object.entries(playStats || {})
      .filter(([id, stat]) => gameLookup[id] && (stat.sessions || 0) > 0)
      .map(([id, stat]) => ({
        game: gameLookup[id],
        sessions: stat.sessions || 0,
        totalSeconds: stat.totalSeconds || 0,
        lastPlayed: stat.lastPlayed || 0
      }))
      .sort((a, b) => {
        if (b.sessions !== a.sessions) return b.sessions - a.sessions;
        return b.totalSeconds - a.totalSeconds;
      });
  }, [playStats, gameLookup]);

  const filteredScores = useMemo(() => {
    return (leaderboardEntries || [])
      .filter(entry => filterGameId === 'all' || entry.gameId === filterGameId)
      .slice()
      .sort((a, b) => b.score - a.score);
  }, [leaderboardEntries, filterGameId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericScore = Number(scoreInput);
    if (!Number.isFinite(numericScore) || numericScore < 0) return;

    onSaveScore({
      gameId: selectedGameId,
      player: playerName.trim() || 'Player 1',
      score: numericScore,
      note: noteInput.trim()
    });
    setScoreInput('');
    setNoteInput('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Leaderboard Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0e1230] via-[#080b1f] to-[#050714] border border-purple-500/35 p-6 sm:p-8 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_28px_rgba(34,211,238,0.12)]">
        <div className="absolute -top-20 right-12 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Arcade Standings &amp; Session Records</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Verified local high scores and live play-time rankings tracked directly from your arcade sessions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {confirmReset ? (
              <div className="flex items-center gap-2 bg-[#04050f] border border-rose-500/40 rounded-xl px-3 py-1.5">
                <span className="text-xs text-rose-200">Clear all local records?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetStats();
                    setConfirmReset(false);
                  }}
                  className="neon-btn-danger px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="neon-btn-outline px-2.5 py-1 text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="neon-btn-outline flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Records</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real Activity Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Total Sessions</div>
          <div className="font-display text-2xl font-bold text-cyan-300 tabular-nums">
            {totals.sessions}
          </div>
        </div>
        <div className="bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Active Play Time</div>
          <div className="font-display text-2xl font-bold text-white tabular-nums">
            {formatDuration(totals.seconds)}
          </div>
        </div>
        <div className="bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Recorded High Scores</div>
          <div className="font-display text-2xl font-bold text-purple-300 tabular-nums">
            {leaderboardEntries.length}
          </div>
        </div>
        <div className="bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Most Played Game</div>
          <div className="font-display text-lg font-bold text-amber-300 truncate">
            {totals.topGame ? totals.topGame.title : 'None yet'}
          </div>
        </div>
      </div>

      {/* Main Split: High Scores Table (2 cols) + Most Played Ranking (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Score Logger + Standings Table */}
        <div className="lg:col-span-2 flex flex-col gap-5 bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
            <div>
              <h2 className="font-display text-lg font-bold text-white">High Score Standings</h2>
              <p className="text-xs text-slate-400">Record your best runs per game and filter standings</p>
            </div>
            <select
              value={filterGameId}
              onChange={(e) => setFilterGameId(e.target.value)}
              className="px-3 py-2 bg-[#04050f] border border-purple-500/35 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">All Games ({leaderboardEntries.length})</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          {/* Log New High Score Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-[#04050f]/90 border border-cyan-500/20 rounded-xl p-3.5">
            <input
              type="text"
              maxLength={18}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Player Tag (e.g. ACE)"
              className="sm:col-span-3 px-3 py-2 bg-[#080b1f] border border-purple-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="sm:col-span-4 px-3 py-2 bg-[#080b1f] border border-purple-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              placeholder="Score *"
              className="sm:col-span-2 px-3 py-2 bg-[#080b1f] border border-purple-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 tabular-nums"
            />
            <button
              type="submit"
              className="sm:col-span-3 neon-btn-cyan px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Score</span>
            </button>
          </form>

          {/* Scores List */}
          {filteredScores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-500/20 text-[11px] font-semibold text-slate-400">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Player</th>
                    <th className="py-2.5 px-3">Game</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                    <th className="py-2.5 px-3 text-right hidden sm:table-cell">Date</th>
                    <th className="py-2.5 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10 text-xs">
                  {filteredScores.map((entry, idx) => {
                    const game = gameLookup[entry.gameId];
                    const rankColor =
                      idx === 0
                        ? 'text-amber-300 font-bold'
                        : idx === 1
                        ? 'text-cyan-300 font-bold'
                        : idx === 2
                        ? 'text-purple-300 font-bold'
                        : 'text-slate-400';

                    return (
                      <tr key={entry.id} className="hover:bg-[#0d1130]/60 transition-colors">
                        <td className={`py-3 px-3 tabular-nums ${rankColor}`}>
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">
                          {entry.player}
                        </td>
                        <td className="py-3 px-3">
                          {game ? (
                            <button
                              type="button"
                              onClick={() => onSelectGame(game)}
                              className="flex items-center gap-2 text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                            >
                              <img
                                src={game.thumbnail || `./thumbnails/${game.id}.svg`}
                                alt={game.title}
                                referrerPolicy="no-referrer"
                                className="w-8 h-5 rounded object-cover border border-purple-500/30 shrink-0"
                              />
                              <span className="truncate max-w-[140px]">{game.title}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400">{entry.gameId}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-code font-bold text-cyan-300 tabular-nums">
                          {Number(entry.score).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-400 hidden sm:table-cell tabular-nums">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteScore(entry.id)}
                            title="Delete score"
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-[#04050f]/70 rounded-xl border border-purple-500/15">
              <Trophy className="w-8 h-8 text-purple-400/70 mb-2" />
              <div className="font-display text-sm font-bold text-white mb-1">
                No High Scores Recorded Yet
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Play any game and save your score above or right inside the game theater to climb the board.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Most Played Games (Real Session Tracking) */}
        <div className="flex flex-col gap-4 bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-5">
          <div className="pb-3 border-b border-purple-500/20">
            <h2 className="font-display text-lg font-bold text-white">Most Played</h2>
            <p className="text-xs text-slate-400">Ranked by your actual sessions &amp; play time</p>
          </div>

          {rankedGamesByActivity.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {rankedGamesByActivity.slice(0, 8).map((item, idx) => (
                <div
                  key={item.game.id}
                  onClick={() => onSelectGame(item.game)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#050716]/90 hover:bg-[#0d1130] border border-purple-500/20 hover:border-cyan-400/60 cursor-pointer transition-all group"
                >
                  <span className={`font-mono-code text-xs w-5 text-center tabular-nums ${
                    idx === 0 ? 'text-amber-300 font-bold' : idx === 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <img
                    src={item.game.thumbnail || `./thumbnails/${item.game.id}.svg`}
                    alt={item.game.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-8 rounded-lg object-cover border border-purple-500/30 shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 truncate transition-colors">
                      {item.game.title}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 tabular-nums">
                      <span>{item.sessions} {item.sessions === 1 ? 'play' : 'plays'}</span>
                      <span aria-hidden="true" className="text-purple-400/50">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400/80" />
                        {formatDuration(item.totalSeconds)}
                      </span>
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-purple-300 group-hover:text-cyan-300 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-[#04050f]/70 rounded-xl border border-purple-500/15 flex-1">
              <Gamepad2 className="w-8 h-8 text-cyan-400/70 mb-2" />
              <div className="font-display text-sm font-bold text-white mb-1">
                No Play History Yet
              </div>
              <p className="text-xs text-slate-400">
                Launch any game to automatically track sessions and active play duration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
