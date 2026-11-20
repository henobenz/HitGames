export const GLOBAL_LEADERBOARD_KEY = 'playvault_global_leaderboard';
export const LEGACY_LEADERBOARD_KEY = 'playvault_leaderboard';

export const GAME_LOCAL_SCORE_KEYS = {
  snake: ['playvault_snake_high'],
  tetris: ['playvault_tetris_high'],
  '2048': ['playvault_2048_best'],
  stack: ['playvault_stack_high'],
  flappy: ['playvault_flappy_high'],
  dino: ['playvault_dino_high']
};

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

export function loadGlobalLeaderboard(defaultPlayer = 'Player 1') {
  let entries = [];
  try {
    const rawGlobal = localStorage.getItem(GLOBAL_LEADERBOARD_KEY);
    const rawLegacy = localStorage.getItem(LEGACY_LEADERBOARD_KEY);
    const parsedGlobal = rawGlobal ? JSON.parse(rawGlobal) : [];
    const parsedLegacy = rawLegacy ? JSON.parse(rawLegacy) : [];

    const seenIds = new Set();
    [...parsedGlobal, ...parsedLegacy].forEach((item) => {
      if (!item || !item.gameId || !Number.isFinite(Number(item.score))) return;
      const id = item.id || `${item.gameId}-${item.createdAt || Date.now()}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        entries.push({
          id,
          gameId: item.gameId,
          player: (item.player || 'Player 1').trim().slice(0, 18),
          score: Number(item.score),
          note: item.note || '',
          source: item.source || 'manual',
          createdAt: Number(item.createdAt) || Date.now()
        });
      }
    });
  } catch (e) {
    entries = [];
  }

  // Merge any higher scores stored directly by individual local HTML5 games
  const cleanPlayer = (defaultPlayer || 'Player 1').trim().slice(0, 18) || 'Player 1';
  let changed = false;
  Object.keys(GAME_LOCAL_SCORE_KEYS).forEach((gameId) => {
    const localBest = readGameLocalHighScore(gameId);
    if (localBest > 0) {
      const currentTop = entries
        .filter((e) => e.gameId === gameId)
        .reduce((max, e) => (e.score > max ? e.score : max), 0);

      if (localBest > currentTop) {
        entries.unshift({
          id: `auto-${gameId}`,
          gameId,
          player: cleanPlayer,
          score: localBest,
          note: 'Auto-synced high score',
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

export function saveGlobalLeaderboard(entries) {
  const safeList = (entries || []).slice(0, 200);
  try {
    const serialized = JSON.stringify(safeList);
    localStorage.setItem(GLOBAL_LEADERBOARD_KEY, serialized);
    localStorage.setItem(LEGACY_LEADERBOARD_KEY, serialized);
  } catch (e) {}
  return safeList;
}

export function upsertAutoGameScore(entries, { gameId, player, score }) {
  const numericScore = Number(score);
  if (!gameId || !Number.isFinite(numericScore) || numericScore <= 0) return entries;

  const cleanPlayer = (player || 'Player 1').trim().slice(0, 18) || 'Player 1';
  const currentGameBest = entries
    .filter((e) => e.gameId === gameId)
    .reduce((max, e) => (e.score > max ? e.score : max), 0);

  if (numericScore <= currentGameBest) {
    return entries;
  }

  const autoId = `auto-${gameId}-${cleanPlayer.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const withoutOldAuto = entries.filter((e) => e.id !== autoId && e.id !== `auto-${gameId}`);
  const next = [
    {
      id: autoId,
      gameId,
      player: cleanPlayer,
      score: numericScore,
      note: 'Auto-synced high score',
      source: 'auto',
      createdAt: Date.now()
    },
    ...withoutOldAuto
  ].slice(0, 200);

  return saveGlobalLeaderboard(next);
}

export function readLiveGameScoreFromIframe(iframeEl, gameId) {
  let currentScore = 0;
  let bestScore = readGameLocalHighScore(gameId);

  if (!iframeEl) {
    return { currentScore, bestScore };
  }

  try {
    const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
    if (!doc) return { currentScore, bestScore };

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
        if (Number.isFinite(parsed) && parsed > bestScore) {
          bestScore = parsed;
        }
      }
    }

    if (currentScore > bestScore) {
      bestScore = currentScore;
    }
  } catch (e) {
    // Cross-origin external games cannot be inspected directly; rely on manual submission
  }

  return { currentScore, bestScore };
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

export function computeGlobalPlayerStandings(entries, games) {
  const validGameIds = new Set((games || []).map((g) => g.id));
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
      return {
        player: p.player,
        gamesScored: gameIds.length,
        totalPoints,
        submissions: p.submissions,
        lastActive: p.lastActive
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.gamesScored - a.gamesScored;
    });
}
