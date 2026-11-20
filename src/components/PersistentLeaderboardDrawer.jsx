import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, X, ChevronUp, ArrowUpRight, Trash2, Play, Globe, Layers, User } from 'lucide-react';
import {
  computeBestScoreByGame,
  computeGlobalPlayerStandings,
  computePerGameLeaderboard
} from '../utils/leaderboardStore';

export const PersistentLeaderboardDrawer = ({
  games = [],
  leaderboardEntries = [],
  defaultPlayerName = '',
  activeGameId = null,
  onUpdatePlayerName,
  onDeleteScore,
  onSelectGame,
  onOpenFullLeaderboard
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('playvault_lb_drawer_tab');
    return saved === 'global' || saved === 'per-game' || saved === 'runs' ? saved : 'global';
  });
  const [selectedGameId, setSelectedGameId] = useState('');
  const [playerTagInput, setPlayerTagInput] = useState(defaultPlayerName || '');

  useEffect(() => {
    if (defaultPlayerName !== undefined) {
      setPlayerTagInput(defaultPlayerName);
    }
  }, [defaultPlayerName]);

  useEffect(() => {
    if (activeGameId) {
      setSelectedGameId(activeGameId);
    } else if (!selectedGameId && games.length > 0) {
      setSelectedGameId(games[0].id);
    }
  }, [activeGameId, games, selectedGameId]);

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

  // Type 1: Global Combined Leaderboard across every game
  const globalStandings = useMemo(
    () => computeGlobalPlayerStandings(leaderboardEntries, games),
    [leaderboardEntries, games]
  );

  // Type 2: Separate leaderboard for the currently chosen game
  const selectedGame = gameLookup[selectedGameId] || games[0] || null;
  const perGameBoard = useMemo(
    () => computePerGameLeaderboard(leaderboardEntries, selectedGame?.id),
    [leaderboardEntries, selectedGame]
  );

  const topRuns = useMemo(() => {
    return leaderboardEntries
      .slice()
      .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt)
      .slice(0, 30);
  }, [leaderboardEntries]);

  const highestGlobalTotal = globalStandings[0]?.totalPoints || 0;

  const handleTagBlurOrSubmit = (e) => {
    if (e) e.preventDefault();
    if (onUpdatePlayerName) {
      onUpdatePlayerName(playerTagInput);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2.5 pointer-events-none">
      {isOpen && (
        <aside
          aria-label="PlayVault Leaderboards"
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
                  Leaderboards
                </h2>
                <span className="text-[11px] text-slate-400 tabular-nums">
                  Global Combined + {games.length} Separate Game Boards
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onOpenFullLeaderboard && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullLeaderboard(activeTab === 'per-game' ? 'per-game' : 'global', selectedGame?.id);
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
                aria-label="Minimize Leaderboards"
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
              onClick={() => handleTabChange('global')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'global'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('per-game')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'per-game'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Per Game</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('runs')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'runs'
                  ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top Runs</span>
            </button>
          </div>

          {/* Active Player Tag & Gameplay-Only Notice */}
          <form
            onSubmit={handleTagBlurOrSubmit}
            className="px-3 py-2.5 bg-[#080c22] border-b border-purple-500/20 flex items-center justify-between gap-2 shrink-0"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <input
                type="text"
                maxLength={18}
                value={playerTagInput}
                onChange={(e) => setPlayerTagInput(e.target.value)}
                onBlur={handleTagBlurOrSubmit}
                placeholder="Your Player Tag (Player 1)"
                className="w-full px-2.5 py-1 bg-[#04050f] border border-purple-500/30 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <span className="text-[11px] text-cyan-300/80 whitespace-nowrap shrink-0">
              Earned in-game only
            </span>
          </form>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {/* Tab 1: Global Combined Points Leaderboard */}
            {activeTab === 'global' && (
              globalStandings.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] text-slate-400 px-1">
                    Combined points earned across all games
                  </div>
                  {globalStandings.map((p, idx) => (
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
                          <div className="text-[11px] text-slate-400 tabular-nums truncate">
                            {p.gamesScored} {p.gamesScored === 1 ? 'game' : 'games'}
                            {p.topGameTitle ? ` · Best: ${p.topGameTitle}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono-code text-xs font-bold text-cyan-300 tabular-nums">
                          {Number(p.totalPoints).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">total pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">
                  Play games to earn points—your scores across all games combine here!
                </div>
              )
            )}

            {/* Tab 2: Separate Leaderboard Per Game */}
            {activeTab === 'per-game' && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedGame?.id || ''}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-[#04050f] border border-purple-500/35 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} {bestByGame[g.id] ? `(Best: ${Number(bestByGame[g.id].score).toLocaleString()})` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedGame && onSelectGame && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectGame(selectedGame);
                        setIsOpen(false);
                      }}
                      className="neon-btn-cyan px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      <span>Play</span>
                    </button>
                  )}
                </div>

                {perGameBoard.length > 0 ? (
                  perGameBoard.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#090d24] border border-purple-500/20"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`font-mono-code text-xs w-6 text-center tabular-nums ${
                          idx === 0 ? 'text-amber-300 font-bold' : idx === 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{entry.player}</div>
                          <div className="text-[10px] text-slate-400 tabular-nums">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono-code text-xs font-bold text-amber-300 tabular-nums">
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
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 bg-[#04050f]/70 rounded-xl border border-purple-500/15 px-4">
                    No records yet on the {selectedGame?.title || 'game'} leaderboard. Play to claim #1!
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: All Individual High Score Runs */}
            {activeTab === 'runs' && (
              topRuns.length > 0 ? (
                topRuns.map((entry, idx) => {
                  const game = gameLookup[entry.gameId];
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#090d24] border border-purple-500/20 hover:border-cyan-400/45 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`font-mono-code text-xs w-6 text-center tabular-nums ${
                          idx === 0 ? 'text-amber-300 font-bold' : idx === 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{entry.player}</div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGameId(entry.gameId);
                              handleTabChange('per-game');
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
                  No high scores yet. Play any game and earn points to climb the leaderboard!
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
        <span>Leaderboards</span>
        <span className="px-1.5 py-0.5 rounded-md bg-[#04050f]/75 border border-cyan-400/40 text-[11px] text-cyan-300 font-mono-code tabular-nums">
          {highestGlobalTotal > 0 ? highestGlobalTotal.toLocaleString() : leaderboardEntries.length}
        </span>
        <ChevronUp className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};
