export const GLOBAL_LEADERBOARD_KEY = 'playvault_global_leaderboard';
export const PER_GAME_LEADERBOARDS_KEY = 'playvault_per_game_leaderboards';
export const LEGACY_LEADERBOARD_KEY = 'playvault_leaderboard';

export const GAME_LOCAL_SCORE_KEYS = {
  snake: ['playvault_snake_high'],
  tetris: ['playvault_tetris_high'],
  '2048': ['playvault_2048_best'],
  stack: ['playvault_stack_high'],
  flappy: ['playvault_flappy_high'],
  dino: ['playvault_dino_high'],
  minesweeper: ['playvault_minesweeper_high'],
  wordle: ['playvault_wordle_high'],
  connect4: ['playvault_connect4_high'],
  'tic-tac-toe': ['playvault_tictactoe_high']
};

export function clearAllGameLocalHighScores() {
  Object.values(GAME_LOCAL_SCORE_KEYS).forEach((keys) => {
    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    });
  });
}

export function readGameLocalHighScore(gameId) {
  const keys = GAME_LOCAL_SCORE_KEYS[gameId];
  if (!keys) return 0;
  let best = 0;
  keys.forEach((key) => {
    try {
      const val = parseInt(localStorage.getItem(key) || '0', 10);
      if (Number.isFinite(val) && val > best) {
        best = val;
      }
    } catch (e) {}
  });
  return best;
}

export function buildPerGameMap(entries) {
  const map = {};
  (entries || []).forEach((e) => {
    if (!e || !e.gameId) return;
    if (!map[e.gameId]) map[e.gameId] = [];
    map[e.gameId].push(e);
  });
  Object.keys(map).forEach((gid) => {
    map[gid].sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
  });
  return map;
}

export function saveGlobalLeaderboard(entries) {
  const safeList = (entries || []).slice(0, 300);
  try {
    const serialized = JSON.stringify(safeList);
    localStorage.setItem(GLOBAL_LEADERBOARD_KEY, serialized);
    localStorage.setItem(LEGACY_LEADERBOARD_KEY, serialized);
    localStorage.setItem(PER_GAME_LEADERBOARDS_KEY, JSON.stringify(buildPerGameMap(safeList)));
  } catch (e) {}
  return safeList;
}

export function loadGlobalLeaderboard(defaultPlayer = 'Player 1') {
  let entries = [];
  try {
    const rawGlobal = localStorage.getItem(GLOBAL_LEADERBOARD_KEY);
    const rawPerGame = localStorage.getItem(PER_GAME_LEADERBOARDS_KEY);
    const rawLegacy = localStorage.getItem(LEGACY_LEADERBOARD_KEY);

    const parsedGlobal = rawGlobal ? JSON.parse(rawGlobal) : [];
    const parsedPerGameMap = rawPerGame ? JSON.parse(rawPerGame) : {};
    const parsedPerGameList =
      parsedPerGameMap && typeof parsedPerGameMap === 'object'
        ? Object.values(parsedPerGameMap).flat()
        : [];
    const parsedLegacy = rawLegacy ? JSON.parse(rawLegacy) : [];

    const seenIds = new Set();
    [...parsedGlobal, ...parsedPerGameList, ...parsedLegacy].forEach((item) => {
      if (!item || !item.gameId || !Number.isFinite(Number(item.score))) return;
      const id = item.id || `${item.gameId}-${item.createdAt || Date.now()}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        entries.push({
          id,
          gameId: item.gameId,
          player: (item.player || 'Player 1').trim().slice(0, 18) || 'Player 1',
          score: Number(item.score),
          note: item.note || '',
          source: item.source || 'auto',
          createdAt: Number(item.createdAt) || Date.now()
        });
      }
    });
  } catch (e) {
    entries = [];
  }

  // Seed initial local high score only if that game has zero records yet
  const cleanPlayer = (defaultPlayer || 'Player 1').trim().slice(0, 18) || 'Player 1';
  const playerSlug = cleanPlayer.toLowerCase().replace(/[^a-z0-9]/g, '') || 'player1';
  let changed = false;

  Object.keys(GAME_LOCAL_SCORE_KEYS).forEach((gameId) => {
    const localBest = readGameLocalHighScore(gameId);
    if (localBest > 0) {
      const hasAnyForGame = entries.some((e) => e.gameId === gameId);
      if (!hasAnyForGame) {
        entries.unshift({
          id: `auto-${gameId}-${playerSlug}`,
          gameId,
          player: cleanPlayer,
          score: localBest,
          note: 'Earned in gameplay',
          source: 'auto',
          createdAt: Date.now()
        });
        changed = true;
      }
    }
  });

  if (changed) {
    saveGlobalLeaderboard(entries);
  }

  return entries;
}

export function getPlayerBestForGame(entries, gameId, player) {
  const cleanLower = ((player || 'Player 1').trim().slice(0, 18) || 'Player 1').toLowerCase();
  return (entries || [])
    .filter((e) => e.gameId === gameId && (e.player || '').trim().toLowerCase() === cleanLower)
    .reduce((max, e) => (e.score > max ? e.score : max), 0);
}

export function upsertAutoGameScore(entries, { gameId, player, score }) {
  const numericScore = Number(score);
  if (!gameId || !Number.isFinite(numericScore) || numericScore <= 0) return entries;

  const cleanPlayer = (player || 'Player 1').trim().slice(0, 18) || 'Player 1';
  const playerSlug = cleanPlayer.toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
  const playerCurrentBest = getPlayerBestForGame(entries, gameId, cleanPlayer);

  if (numericScore <= playerCurrentBest) {
    return entries;
  }

  const autoId = `auto-${gameId}-${playerSlug}`;
  const cleanLower = cleanPlayer.toLowerCase();
  const withoutOldPlayerAuto = (entries || []).filter(
    (e) =>
      e.id !== autoId &&
      e.id !== `auto-${gameId}` &&
      !(e.gameId === gameId && (e.player || '').trim().toLowerCase() === cleanLower)
  );

  const next = [
    {
      id: autoId,
      gameId,
      player: cleanPlayer,
      score: numericScore,
      note: 'Earned in gameplay',
      source: 'auto',
      createdAt: Date.now()
    },
    ...withoutOldPlayerAuto
  ].slice(0, 300);

  return saveGlobalLeaderboard(next);
}

export function readLiveGameScoreFromIframe(iframeEl, gameId) {
  let currentScore = 0;
  let domBestScore = 0;
  const localStorageBest = readGameLocalHighScore(gameId);

  if (!iframeEl) {
    return { currentScore, domBestScore, localStorageBest };
  }

  try {
    const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
    if (!doc) return { currentScore, domBestScore, localStorageBest };

    const scoreSelectors = ['#score', '#p1Score'];
    for (const sel of scoreSelectors) {
      const el = doc.querySelector(sel);
      if (el) {
        const parsed = parseInt((el.textContent || '').replace(/[^0-9-]/g, ''), 10);
        if (Number.isFinite(parsed) && parsed > currentScore) {
          currentScore = parsed;
        }
      }
    }

    const bestSelectors = ['#highScore', '#bestScore'];
    for (const sel of bestSelectors) {
      const el = doc.querySelector(sel);
      if (el) {
        const parsed = parseInt((el.textContent || '').replace(/[^0-9-]/g, ''), 10);
        if (Number.isFinite(parsed) && parsed > domBestScore) {
          domBestScore = parsed;
        }
      }
    }
  } catch (e) {
    // Cross-origin external games cannot be inspected directly
  }

  return { currentScore, domBestScore, localStorageBest };
}

export function computeBestScoreByGame(entries) {
  const map = {};
  (entries || []).forEach((e) => {
    if (!map[e.gameId] || e.score > map[e.gameId].score) {
      map[e.gameId] = e;
    }
  });
  return map;
}

export function computePerGameLeaderboard(entries, gameId) {
  if (!gameId) return [];
  return (entries || [])
    .filter((e) => e.gameId === gameId)
    .slice()
    .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
}

export function computeGlobalPlayerStandings(entries, games) {
  const validGameIds = new Set((games || []).map((g) => g.id));
  const gameTitleMap = {};
  (games || []).forEach((g) => {
    gameTitleMap[g.id] = g.title;
  });

  const byPlayer = {};

  (entries || []).forEach((e) => {
    if (validGameIds.size > 0 && !validGameIds.has(e.gameId)) return;
    const name = (e.player || 'Player 1').trim() || 'Player 1';
    const key = name.toLowerCase();
    if (!byPlayer[key]) {
      byPlayer[key] = {
        player: name,
        bestPerGame: {},
        submissions: 0,
        lastActive: 0
      };
    }
    const rec = byPlayer[key];
    rec.submissions += 1;
    if (e.createdAt > rec.lastActive) rec.lastActive = e.createdAt;
    if (rec.bestPerGame[e.gameId] === undefined || e.score > rec.bestPerGame[e.gameId]) {
      rec.bestPerGame[e.gameId] = e.score;
    }
  });

  return Object.values(byPlayer)
    .map((p) => {
      const gameIds = Object.keys(p.bestPerGame);
      const totalPoints = gameIds.reduce((sum, gid) => sum + p.bestPerGame[gid], 0);
      let topGameId = null;
      let topGameScore = 0;
      gameIds.forEach((gid) => {
        if (p.bestPerGame[gid] > topGameScore) {
          topGameScore = p.bestPerGame[gid];
          topGameId = gid;
        }
      });
      return {
        player: p.player,
        gamesScored: gameIds.length,
        totalPoints,
        submissions: p.submissions,
        lastActive: p.lastActive,
        bestPerGame: p.bestPerGame,
        topGameId,
        topGameTitle: topGameId ? gameTitleMap[topGameId] || topGameId : null,
        topGameScore
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.gamesScored - a.gamesScored;
    });
}
