import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Clock, Play, Trash2, Gamepad2, RotateCcw, Globe, Layers } from 'lucide-react';
import {
  computeBestScoreByGame,
  computeGlobalPlayerStandings,
  computePerGameLeaderboard
} from '../utils/leaderboardStore';

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
  initialBoardType = 'global',
  initialGameId = null,
  onUpdatePlayerName,
  onDeleteScore,
  onResetStats,
  onSelectGame
}) => {
  const [boardType, setBoardType] = useState(initialBoardType); // 'global' | 'per-game'
  const [selectedPerGameId, setSelectedPerGameId] = useState(() => {
    if (initialGameId) return initialGameId;
    return games[0]?.id || '';
  });
  const [showAllRuns, setShowAllRuns] = useState(false);
  const [playerName, setPlayerName] = useState(defaultPlayerName || '');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setBoardType(initialBoardType);
  }, [initialBoardType]);

  useEffect(() => {
    if (initialGameId) {
      setSelectedPerGameId(initialGameId);
    } else if (!selectedPerGameId && games.length > 0) {
      const firstScored = games.find((g) => (leaderboardEntries || []).some((e) => e.gameId === g.id));
      setSelectedPerGameId((firstScored || games[0]).id);
    }
  }, [initialGameId, games, selectedPerGameId, leaderboardEntries]);

  useEffect(() => {
    setPlayerName(defaultPlayerName || '');
  }, [defaultPlayerName]);

  const gameLookup = useMemo(() => {
    const map = {};
    games.forEach((g) => { map[g.id] = g; });
    return map;
  }, [games]);

  const bestByGame = useMemo(
    () => computeBestScoreByGame(leaderboardEntries),
    [leaderboardEntries]
  );

  // Type 1: Global Combined Points Leaderboard
  const globalPlayerStandings = useMemo(
    () => computeGlobalPlayerStandings(leaderboardEntries, games),
    [leaderboardEntries, games]
  );

  // Type 2: Selected Game's Own Separate Leaderboard
  const activePerGame = gameLookup[selectedPerGameId] || games[0] || null;
  const activePerGameEntries = useMemo(
    () => computePerGameLeaderboard(leaderboardEntries, activePerGame?.id),
    [leaderboardEntries, activePerGame]
  );

  const perGameCounts = useMemo(() => {
    const counts = {};
    (leaderboardEntries || []).forEach((e) => {
      counts[e.gameId] = (counts[e.gameId] || 0) + 1;
    });
    return counts;
  }, [leaderboardEntries]);

  const allRunsSorted = useMemo(() => {
    return (leaderboardEntries || [])
      .slice()
      .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
  }, [leaderboardEntries]);

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

  const handleTagSave = (e) => {
    e.preventDefault();
    if (onUpdatePlayerName) {
      onUpdatePlayerName(playerName);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dual-Leaderboard Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0e1230] via-[#080b1f] to-[#050714] border border-purple-500/35 p-6 sm:p-8 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_28px_rgba(34,211,238,0.12)]">
        <div className="absolute -top-20 right-12 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Dual Arcade Ranking System</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {boardType === 'global' ? 'Global Leaderboard' : 'Per-Game Leaderboards'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {boardType === 'global'
                ? 'Combined points earned across every game—play multiple titles to build your total global score.'
                : 'Every game maintains its own separate leaderboard—pick any game to inspect its individual champions.'}
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

        {/* 2-Type Mode Switcher */}
        <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setBoardType('global')}
            className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              boardType === 'global'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                : 'bg-[#04050f]/75 border-purple-500/25 hover:border-purple-400/60'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                boardType === 'global'
                  ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-purple-500/15 text-slate-400 border border-purple-500/25'
              }`}>
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-white">
                  1. Global Leaderboard
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Combined points earned across every game
                </div>
              </div>
            </div>
            <span className="font-mono-code text-xs font-bold text-cyan-300 tabular-nums shrink-0">
              {globalPlayerStandings.length} {globalPlayerStandings.length === 1 ? 'player' : 'players'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setBoardType('per-game')}
            className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              boardType === 'per-game'
                ? 'bg-gradient-to-r from-purple-500/25 to-cyan-500/15 border-purple-400/75 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                : 'bg-[#04050f]/75 border-purple-500/25 hover:border-purple-400/60'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                boardType === 'per-game'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-400/50'
                  : 'bg-purple-500/15 text-slate-400 border border-purple-500/25'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-white">
                  2. Per-Game Leaderboards
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Separate leaderboard for each of the {games.length} games
                </div>
              </div>
            </div>
            <span className="font-mono-code text-xs font-bold text-purple-300 tabular-nums shrink-0">
              {games.length} boards
            </span>
          </button>
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
          <div className="text-xs text-slate-400 mb-1">Games With Records</div>
          <div className="font-display text-2xl font-bold text-purple-300 tabular-nums">
            {Object.keys(bestByGame).length}/{games.length}
          </div>
        </div>
        <div className="bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Most Played Game</div>
          <div className="font-display text-lg font-bold text-amber-300 truncate">
            {totals.topGame ? totals.topGame.title : 'None yet'}
          </div>
        </div>
      </div>

      {/* Active Player Tag Bar (Scores earned strictly in gameplay) */}
      <form
        onSubmit={handleTagSave}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#080b1f]/90 border border-cyan-500/25 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2.5 flex-1">
          <span className="text-xs font-semibold text-cyan-300 whitespace-nowrap">Active Player Tag:</span>
          <input
            type="text"
            maxLength={18}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onBlur={() => onUpdatePlayerName && onUpdatePlayerName(playerName)}
            placeholder="Player 1"
            className="flex-1 max-w-xs px-3 py-1.5 bg-[#04050f] border border-purple-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="neon-btn-outline px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Set Tag
          </button>
        </div>
        <span className="text-[11px] text-slate-400">
          Scores increase automatically only as you play games and earn points.
        </span>
      </form>

      {/* Main Content Split: Active Leaderboard Type (2 cols) + Most Played Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5 bg-[#080b1f]/90 border border-purple-500/25 rounded-2xl p-5">
          {boardType === 'global' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Global Combined Points Standings
                  </h2>
                  <p className="text-xs text-slate-400">
                    Each player&apos;s best earned scores from every game summed into one global total
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAllRuns(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      !showAllRuns
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/25 text-cyan-300 border border-cyan-400/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Global Ranks ({globalPlayerStandings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllRuns(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      showAllRuns
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/25 text-cyan-300 border border-cyan-400/60'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Game Records ({allRunsSorted.length})
                  </button>
                </div>
              </div>

              {!showAllRuns ? (
                globalPlayerStandings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-purple-500/20 text-[11px] font-semibold text-slate-400">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Player</th>
                          <th className="py-2.5 px-3 text-right">Games Scored</th>
                          <th className="py-2.5 px-3 hidden sm:table-cell">Best Game</th>
                          <th className="py-2.5 px-3 text-right">Global Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/10 text-xs">
                        {globalPlayerStandings.map((p, idx) => (
                          <tr key={p.player} className="hover:bg-[#0d1130]/60 transition-colors">
                            <td className={`py-3 px-3 tabular-nums ${
                              idx === 0
                                ? 'text-amber-300 font-bold'
                                : idx === 1
                                ? 'text-cyan-300 font-bold'
                                : idx === 2
                                ? 'text-purple-300 font-bold'
                                : 'text-slate-400'
                            }`}>
                              #{idx + 1}
                            </td>
                            <td className="py-3 px-3 font-semibold text-white">
                              <div>{p.player}</div>
                            </td>
                            <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                              {p.gamesScored}/{games.length}
                            </td>
                            <td className="py-3 px-3 hidden sm:table-cell">
                              {p.topGameTitle ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPerGameId(p.topGameId);
                                    setBoardType('per-game');
                                  }}
                                  className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                                >
                                  {p.topGameTitle} ({Number(p.topGameScore).toLocaleString()})
                                </button>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-mono-code font-bold text-cyan-300 tabular-nums">
                              {Number(p.totalPoints).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-[#04050f]/70 rounded-xl border border-purple-500/15">
                    <Globe className="w-8 h-8 text-cyan-400/70 mb-2" />
                    <div className="font-display text-sm font-bold text-white mb-1">
                      No Global Points Earned Yet
                    </div>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Play any game and earn points—your best score from each game combines automatically into your Global Leaderboard ranking.
                    </p>
                  </div>
                )
              ) : (
                allRunsSorted.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-purple-500/20 text-[11px] font-semibold text-slate-400">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Player</th>
                          <th className="py-2.5 px-3">Game</th>
                          <th className="py-2.5 px-3 text-right">Score</th>
                          <th className="py-2.5 px-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/10 text-xs">
                        {allRunsSorted.map((entry, idx) => {
                          const game = gameLookup[entry.gameId];
                          return (
                            <tr key={entry.id} className="hover:bg-[#0d1130]/60 transition-colors">
                              <td className={`py-3 px-3 tabular-nums ${
                                idx === 0 ? 'text-amber-300 font-bold' : idx === 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'
                              }`}>
                                #{idx + 1}
                              </td>
                              <td className="py-3 px-3 font-semibold text-white">{entry.player}</td>
                              <td className="py-3 px-3">
                                {game ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPerGameId(game.id);
                                      setBoardType('per-game');
                                    }}
                                    className="text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                                  >
                                    {game.title}
                                  </button>
                                ) : entry.gameId}
                              </td>
                              <td className="py-3 px-3 text-right font-mono-code font-bold text-cyan-300 tabular-nums">
                                {Number(entry.score).toLocaleString()}
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
                  <div className="py-10 text-center text-xs text-slate-400">
                    No game records saved yet. Play any game to earn points!
                  </div>
                )
              )}
            </>
          ) : (
            /* Type 2: Separate Leaderboard For Every Single Game */
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    {activePerGame ? `${activePerGame.title} Leaderboard` : 'Game Leaderboard'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dedicated standings for {activePerGame?.title || 'this game'} only
                  </p>
                </div>

                {activePerGame && (
                  <div className="flex items-center gap-2">
                    <select
                      value={activePerGame.id}
                      onChange={(e) => setSelectedPerGameId(e.target.value)}
                      className="px-3 py-2 bg-[#04050f] border border-purple-500/35 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title} ({perGameCounts[g.id] || 0})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onSelectGame(activePerGame)}
                      className="neon-btn-cyan px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Play</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dedicated Per-Game Leaderboard Table */}
              {activePerGameEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-purple-500/20 text-[11px] font-semibold text-slate-400">
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3 text-right">High Score</th>
                        <th className="py-2.5 px-3 text-right hidden sm:table-cell">Date</th>
                        <th className="py-2.5 px-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10 text-xs">
                      {activePerGameEntries.map((entry, idx) => (
                        <tr key={entry.id} className="hover:bg-[#0d1130]/60 transition-colors">
                          <td className={`py-3 px-3 tabular-nums ${
                            idx === 0
                              ? 'text-amber-300 font-bold'
                              : idx === 1
                              ? 'text-cyan-300 font-bold'
                              : idx === 2
                              ? 'text-purple-300 font-bold'
                              : 'text-slate-400'
                          }`}>
                            #{idx + 1}
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">{entry.player}</td>
                          <td className="py-3 px-3 text-right font-mono-code font-bold text-amber-300 tabular-nums">
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
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-[#04050f]/70 rounded-xl border border-purple-500/15">
                  <Trophy className="w-7 h-7 text-purple-400/70 mb-2" />
                  <div className="font-display text-sm font-bold text-white mb-1">
                    No {activePerGame?.title || 'Game'} Scores Yet
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mb-3">
                    Play {activePerGame?.title || 'this game'} and gain points to claim #1 on its dedicated leaderboard.
                  </p>
                  {activePerGame && (
                    <button
                      type="button"
                      onClick={() => onSelectGame(activePerGame)}
                      className="neon-btn-cyan px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Launch {activePerGame.title} →
                    </button>
                  )}
                </div>
              )}

              {/* All Individual Game Boards Grid */}
              <div className="pt-2 border-t border-purple-500/20">
                <div className="text-xs font-semibold text-slate-300 mb-3">
                  Select Any Game&apos;s Separate Leaderboard ({games.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {games.map((g) => {
                    const best = bestByGame[g.id];
                    const count = perGameCounts[g.id] || 0;
                    const isSelected = activePerGame?.id === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedPerGameId(g.id)}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0e1436] border-cyan-400/70 shadow-[0_0_14px_rgba(34,211,238,0.2)]'
                            : 'bg-[#04050f]/80 border-purple-500/20 hover:border-purple-400/60 hover:bg-[#0d1130]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={g.thumbnail || `./thumbnails/${g.id}.svg`}
                            alt={g.title}
                            referrerPolicy="no-referrer"
                            className="w-11 h-7 rounded-lg object-cover border border-purple-500/30 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{g.title}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {best ? `#1 ${best.player} · ${count} ${count === 1 ? 'rank' : 'ranks'}` : g.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {best ? (
                            <span className="font-mono-code text-xs font-bold text-amber-300 tabular-nums">
                              {Number(best.score).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">Empty</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
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
