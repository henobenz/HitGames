import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, X, ChevronUp, Plus, ArrowUpRight, Trash2, Play, Users, Gamepad2 } from 'lucide-react';
import {
  computeBestScoreByGame,
  computeGlobalPlayerStandings
} from '../utils/leaderboardStore';

export const PersistentLeaderboardDrawer = ({
  games = [],
  leaderboardEntries = [],
  activeGame = null,
  defaultPlayerName = '',
  onSaveScore,
  onDeleteScore,
  onSelectGame,
  onOpenFullLeaderboard
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('playvault_lb_drawer_tab') || 'top';
  });
  const [filterGameId, setFilterGameId] = useState('all');
  const [playerName, setPlayerName] = useState(defaultPlayerName || '');
  const [selectedGameId, setSelectedGameId] = useState(activeGame?.id || games[0]?.id || 'eggy-car');
  const [scoreInput, setScoreInput] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (defaultPlayerName && !playerName) {
      setPlayerName(defaultPlayerName);
    }
  }, [defaultPlayerName, playerName]);

  useEffect(() => {
    if (activeGame?.id) {
      setSelectedGameId(activeGame.id);
    } else if (games.length > 0 && !games.some((g) => g.id === selectedGameId)) {
      setSelectedGameId(games[0].id);
    }
  }, [activeGame?.id, games, selectedGameId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('playvault_lb_drawer_tab', tab);
  };

  const gameLookup = useMemo(() => {
    const map = {};
    games.forEach((g) => { map[g.id] = g; });
    return map;
  }, [games]);

  const bestByGame = useMemo(
    () => computeBestScoreByGame(leaderboardEntries),
    [leaderboardEntries]
  );

  const playerStandings = useMemo(
    () => computeGlobalPlayerStandings(leaderboardEntries, games),
    [leaderboardEntries, games]
  );

  const topScores = useMemo(() => {
    return leaderboardEntries
      .filter((e) => filterGameId === 'all' || e.gameId === filterGameId)
      .slice()
      .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt)
      .slice(0, 30);
  }, [leaderboardEntries, filterGameId]);

  const highestRecord = useMemo(() => {
    if (leaderboardEntries.length === 0) return null;
    return leaderboardEntries.reduce((best, curr) => (curr.score > best.score ? curr : best), leaderboardEntries[0]);
  }, [leaderboardEntries]);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    const numeric = Number(scoreInput);
    if (!Number.isFinite(numeric) || numeric < 0 || !onSaveScore) return;
    onSaveScore({
      gameId: selectedGameId,
      player: playerName.trim() || 'Player 1',
      score: numeric,
      note: ''
    });
    setScoreInput('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2.5 pointer-events-none">
      {/* Slide-up Persistent Global Leaderboard Panel */}
      {isOpen && (
        <aside
          aria-label="Global Leaderboard"
          className="pointer-events-auto w-[calc(100vw-2rem)] sm:w-[420px] max-h-[78vh] flex flex-col bg-[#06091a]/95 backdrop-blur-xl border border-purple-500/45 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.88),0_0_32px_rgba(34,211,238,0.18)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0a0f29] border-b border-purple-500/25 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold text-white leading-none">
                  Global Leaderboard
                </h2>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  {leaderboardEntries.length} saved {leaderboardEntries.length === 1 ? 'record' : 'records'} across all games
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onOpenFullLeaderboard && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullLeaderboard();
                  }}
                  title="Open Full Leaderboard Page"
                  className="neon-btn-outline px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <span>Full View</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize Global Leaderboard"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-purple-500/15 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-[#040612] border-b border-purple-500/20 shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange('top')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'top'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top Scores</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('games')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>All Games</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('players')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'players'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Players</span>
            </button>
          </div>

          {/* Quick Score Logger */}
          <form
            onSubmit={handleQuickSubmit}
            className="p-3 bg-[#080c22] border-b border-purple-500/20 flex flex-col gap-2 shrink-0"
          >
            <div className="grid grid-cols-12 gap-1.5">
              <input
                type="text"
                maxLength={18}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player Tag"
                className="col-span-4 px-2.5 py-1.5 bg-[#04050f] border border-purple-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="col-span-5 px-2 py-1.5 bg-[#04050f] border border-purple-500/30 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {games.map((g) => (
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
                placeholder="Score"
                className="col-span-3 px-2.5 py-1.5 bg-[#04050f] border border-purple-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 tabular-nums"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                {justSaved ? (
                  <span className="text-emerald-300 font-medium">Saved to localStorage!</span>
                ) : (
                  'Local games auto-sync; log any score anytime.'
                )}
              </span>
              <button
                type="submit"
                className="neon-btn-cyan px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Log Score</span>
              </button>
            </div>
          </form>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {activeTab === 'top' && (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-slate-400">Filter by game</span>
                  <select
                    value={filterGameId}
                    onChange={(e) => setFilterGameId(e.target.value)}
                    className="px-2.5 py-1 bg-[#04050f] border border-purple-500/30 rounded-lg text-[11px] text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="all">All Games ({leaderboardEntries.length})</option>
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                {topScores.length > 0 ? (
                  topScores.map((entry, idx) => {
                    const game = gameLookup[entry.gameId];
                    const rankClass =
                      idx === 0
                        ? 'text-amber-300 font-bold'
                        : idx === 1
                        ? 'text-cyan-300 font-bold'
                        : idx === 2
                        ? 'text-purple-300 font-bold'
                        : 'text-slate-400';

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#090d24] border border-purple-500/20 hover:border-cyan-400/45 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`font-mono-code text-xs w-6 text-center tabular-nums ${rankClass}`}>
                            #{idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">
                                {entry.player}
                              </span>
                              {entry.source === 'auto' && (
                                <span className="text-[10px] text-cyan-300/80 font-medium">
                                  · Synced
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (game && onSelectGame) {
                                  onSelectGame(game);
                                  setIsOpen(false);
                                }
                              }}
                              className="text-[11px] text-slate-400 hover:text-cyan-300 truncate block text-left cursor-pointer"
                            >
                              {game ? game.title : entry.gameId}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-code text-xs font-bold text-cyan-300 tabular-nums">
                            {Number(entry.score).toLocaleString()}
                          </span>
                          {onDeleteScore && (
                            <button
                              type="button"
                              onClick={() => onDeleteScore(entry.id)}
                              title="Delete entry"
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-xs text-slate-400">
                    No high scores recorded yet. Play any game or log a score above!
                  </div>
                )}
              </>
            )}

            {activeTab === 'games' && (
              <div className="flex flex-col gap-2">
                {games.map((g) => {
                  const best = bestByGame[g.id];
                  return (
                    <div
                      key={g.id}
                      onClick={() => {
                        if (onSelectGame) {
                          onSelectGame(g);
                          setIsOpen(false);
                        }
                      }}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#090d24] border border-purple-500/20 hover:border-cyan-400/55 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={g.thumbnail || `./thumbnails/${g.id}.svg`}
                          alt={g.title}
                          referrerPolicy="no-referrer"
                          className="w-11 h-7 rounded object-cover border border-purple-500/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate transition-colors">
                            {g.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {best ? `Holder: ${best.player}` : g.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {best ? (
                          <span className="font-mono-code text-xs font-bold text-amber-300 tabular-nums">
                            {Number(best.score).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 group-hover:text-cyan-300">
                            <Play className="w-3 h-3" />
                            Play
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'players' && (
              playerStandings.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {playerStandings.map((p, idx) => (
                    <div
                      key={p.player}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#090d24] border border-purple-500/20"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`font-mono-code text-xs w-6 text-center tabular-nums ${
                          idx === 0 ? 'text-amber-300 font-bold' : idx === 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{p.player}</div>
                          <div className="text-[11px] text-slate-400 tabular-nums">
                            {p.gamesScored} {p.gamesScored === 1 ? 'game' : 'games'} · {p.submissions} {p.submissions === 1 ? 'run' : 'runs'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono-code text-xs font-bold text-cyan-300 tabular-nums">
                          {Number(p.totalPoints).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">total best pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">
                  Play games or record scores to build player standings.
                </div>
              )
            )}
          </div>
        </aside>
      )}

      {/* Persistent Docked Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto neon-btn-purple flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-[0_12px_32px_rgba(0,0,0,0.75),0_0_20px_rgba(168,85,247,0.45)] cursor-pointer"
      >
        <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
        <span>Global Leaderboard</span>
        <span className="px-1.5 py-0.5 rounded-md bg-[#04050f]/75 border border-cyan-400/40 text-[11px] text-cyan-300 font-mono-code tabular-nums">
          {highestRecord ? Number(highestRecord.score).toLocaleString() : leaderboardEntries.length}
        </span>
        <ChevronUp className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};
