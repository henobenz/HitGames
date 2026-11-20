(function () {
  if (window.__PLAYVAULT_MOUNTED__) return;
  window.__PLAYVAULT_MOUNTED__ = true;

  var CLOAK_OPTIONS = [
    { id: 'default', label: 'Default (NexArcade)', title: 'NexArcade — Neon Arcade Hub', faviconUrl: './favicon.svg' },
    { id: 'classroom', label: 'Google Classroom', title: 'Classes — Google Classroom', faviconUrl: 'https://ssl.gstatic.com/classroom/favicon.png' },
    { id: 'drive', label: 'Google Drive', title: 'My Drive — Google Drive', faviconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
    { id: 'docs', label: 'Google Docs', title: 'Untitled Document — Google Docs', faviconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico' },
    { id: 'canvas', label: 'Canvas LMS', title: 'Dashboard — Canvas', faviconUrl: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
    { id: 'wikipedia', label: 'Wikipedia', title: 'Calculus — Wikipedia', faviconUrl: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' }
  ];

  var CATEGORIES = ['All', 'Featured', 'Favorites', 'Action', 'Puzzle', 'Retro', 'Arcade', 'Casual', 'Strategy'];

  var state = {
    games: [],
    gamesBasePrefix: './',
    loading: true,
    selectedGame: null,
    activeView: 'catalog',
    searchQuery: '',
    selectedCategory: 'All',
    sortBy: 'featured',
    favorites: [],
    recentIds: [],
    playStats: {},
    leaderboardEntries: [],
    lbBoardType: 'global',
    lbPerGameId: '',
    lbShowAllRuns: false,
    playerHandle: '',
    spotlightIndex: 0,
    isSpotlightPaused: false,
    isPanicOpen: false,
    isCloakOpen: false,
    currentCloak: 'default',
    copiedShare: false,
    theaterSeconds: 0,
    theaterScoreSaved: false,
    lbConfirmReset: false,
    isDrawerOpen: false,
    drawerTab: 'global',
    drawerPerGameId: '',
    liveScore: 0,
    initialLocalBest: 0
  };

  var playTimerId = null;
  var spotlightTimerId = null;

  function injectStyles() {
    if (document.getElementById('pv-fallback-styles')) return;
    var style = document.createElement('style');
    style.id = 'pv-fallback-styles';
    style.textContent = [
      '*,*::before,*::after{box-sizing:border-box}',
      'body{margin:0;background-color:#04050f;background-image:radial-gradient(circle at 18% 0%,rgba(168,85,247,0.16) 0%,transparent 45%),radial-gradient(circle at 82% 8%,rgba(34,211,238,0.14) 0%,transparent 42%),radial-gradient(rgba(56,189,248,0.08) 1px,transparent 1px);background-size:100% 100%,100% 100%,28px 28px;background-attachment:fixed;color:#f1f5f9;font-family:"Plus Jakarta Sans",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;overflow-x:hidden}',
      'button,input,select,textarea{font:inherit;color:inherit}',
      'button{cursor:pointer;background:none;border:none}',
      '.pv-app{min-height:100vh;display:flex;flex-direction:column;color:#f1f5f9}',
      '.pv-header{position:sticky;top:0;z-index:40;background:rgba(5,7,22,0.9);backdrop-filter:blur(12px);border-bottom:1px solid rgba(168,85,247,0.28);box-shadow:0 4px 24px rgba(34,211,238,0.08)}',
      '.pv-header-inner{max-width:1280px;margin:0 auto;padding:0 20px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:24px}',
      '.pv-brand{display:flex;align-items:center;gap:10px;cursor:pointer;white-space:nowrap;flex-shrink:0}',
      '.pv-brand-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(147,51,234,0.35),rgba(34,211,238,0.2));border:1px solid rgba(34,211,238,0.55);box-shadow:0 0 14px rgba(34,211,238,0.3);display:flex;align-items:center;justify-content:center;color:#67e8f9;font-weight:800}',
      '.pv-brand-text{font-family:"Chakra Petch","Plus Jakarta Sans",sans-serif;font-size:20px;font-weight:700;background:linear-gradient(90deg,#67e8f9,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.02em}',
      '.pv-nav{display:flex;align-items:center;gap:20px;font-size:14px;font-weight:500;color:#cbd5e1;overflow-x:auto}',
      '.pv-nav button{padding:4px 0;white-space:nowrap;transition:color .15s}',
      '.pv-nav button:hover{color:#fff}',
      '.pv-nav button.active{color:#67e8f9;font-weight:600;text-shadow:0 0 10px rgba(34,211,238,0.7)}',
      '.pv-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}',
      '.pv-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;font-size:12px;font-weight:600;border:1px solid rgba(56,189,248,0.32);background:rgba(11,15,38,0.88);color:#e2e8f0;white-space:nowrap;box-shadow:0 0 10px rgba(34,211,238,0.08);transition:transform .18s,border-color .18s,box-shadow .18s}',
      '.pv-btn:hover{border-color:rgba(34,211,238,0.8);color:#fff;box-shadow:0 0 16px rgba(34,211,238,0.35),0 0 24px rgba(168,85,247,0.2)}',
      '.pv-btn-primary{background:linear-gradient(135deg,#22d3ee,#38bdf8);border-color:rgba(165,243,252,0.7);color:#04050f;box-shadow:0 0 14px rgba(34,211,238,0.45),0 0 26px rgba(168,85,247,0.25)}',
      '.pv-btn-primary:hover{filter:brightness(1.08);color:#04050f;box-shadow:0 0 22px rgba(34,211,238,0.7),0 0 36px rgba(168,85,247,0.4)}',
      '.pv-btn-purple{background:linear-gradient(135deg,#9333ea,#7c3aed);border-color:rgba(216,180,254,0.55);color:#fff;box-shadow:0 0 14px rgba(168,85,247,0.5),0 0 26px rgba(34,211,238,0.2)}',
      '.pv-btn-purple:hover{filter:brightness(1.1);box-shadow:0 0 22px rgba(168,85,247,0.75),0 0 36px rgba(34,211,238,0.35)}',
      '.pv-btn-danger{background:rgba(244,63,94,0.12);border-color:rgba(244,63,94,0.45);color:#fda4af}',
      '.pv-btn-danger:hover{background:rgba(244,63,94,0.22);border-color:rgba(251,113,133,0.9);box-shadow:0 0 18px rgba(244,63,94,0.45)}',
      '.pv-main{flex:1;max-width:1280px;width:100%;margin:0 auto;padding:32px 20px}',
      '.pv-hero{position:relative;border-radius:16px;background:linear-gradient(135deg,#0e1230,#080b1f,#050714);border:1px solid rgba(168,85,247,0.35);padding:28px;margin-bottom:24px;box-shadow:0 20px 45px rgba(0,0,0,0.75),0 0 28px rgba(168,85,247,0.14);display:grid;grid-template-columns:1.35fr 1fr;gap:24px;align-items:stretch}',
      '.pv-hero-thumb{position:relative;border-radius:12px;overflow:hidden;border:1px solid rgba(34,211,238,0.35);background:#050716;min-height:200px;cursor:pointer;box-shadow:0 0 24px rgba(34,211,238,0.18)}',
      '.pv-hero-thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .24s}',
      '.pv-hero-thumb:hover img{transform:scale(1.05)}',
      '.pv-hero-kicker{font-size:12px;font-weight:700;color:#67e8f9;display:flex;align-items:center;gap:8px}',
      '.pv-hero h1{font-family:"Chakra Petch","Plus Jakarta Sans",sans-serif;margin:10px 0 8px;font-size:32px;font-weight:700;color:#fff;letter-spacing:-0.02em}',
      '.pv-hero p{margin:0 0 18px;font-size:14px;color:#cbd5e1;line-height:1.6;max-width:640px}',
      '.pv-dots{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:12px}',
      '.pv-dot{height:6px;width:8px;border-radius:999px;background:#334155;transition:all .2s}',
      '.pv-dot.active{width:26px;background:linear-gradient(90deg,#22d3ee,#a855f7);box-shadow:0 0 8px rgba(34,211,238,0.7)}',
      '.pv-recent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:24px}',
      '.pv-recent-card{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;background:rgba(8,11,31,0.9);border:1px solid rgba(168,85,247,0.25);text-align:left;transition:border-color .18s,background .18s}',
      '.pv-recent-card:hover{border-color:rgba(34,211,238,0.65);background:rgba(14,19,51,0.95)}',
      '.pv-recent-card img{width:64px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(168,85,247,0.3);flex-shrink:0}',
      '.pv-controls{display:flex;flex-direction:column;gap:14px;margin-bottom:20px}',
      '.pv-controls-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}',
      '.pv-search{position:relative;flex:1;min-width:240px;max-width:440px}',
      '.pv-search input{width:100%;padding:10px 34px 10px 14px;background:#080b1f;border:1px solid rgba(168,85,247,0.3);border-radius:12px;font-size:14px;color:#fff;outline:none;transition:border-color .18s,box-shadow .18s}',
      '.pv-search input:focus{border-color:#22d3ee;box-shadow:0 0 16px rgba(34,211,238,0.2)}',
      '.pv-sort{display:flex;align-items:center;gap:8px;font-size:12px;color:#94a3b8}',
      '.pv-sort select{padding:8px 12px;background:#080b1f;border:1px solid rgba(168,85,247,0.3);border-radius:12px;color:#e2e8f0;font-size:12px;outline:none}',
      '.pv-tabs{display:flex;align-items:center;gap:8px;overflow-x:auto;padding-bottom:4px}',
      '.pv-tab{padding:7px 14px;border-radius:12px;font-size:12px;font-weight:600;color:#94a3b8;white-space:nowrap;border:1px solid rgba(168,85,247,0.16);background:rgba(8,11,31,0.65);transition:all .18s}',
      '.pv-tab:hover{color:#fff;border-color:rgba(168,85,247,0.45)}',
      '.pv-tab.active{background:linear-gradient(90deg,rgba(34,211,238,0.2),rgba(168,85,247,0.24));color:#67e8f9;border-color:rgba(34,211,238,0.6);box-shadow:0 0 14px rgba(34,211,238,0.22)}',
      '.pv-meta-bar{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(168,85,247,0.2);margin-bottom:20px;font-size:12px;color:#94a3b8}',
      '.pv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}',
      '.pv-card{position:relative;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(13,17,43,0.96),rgba(7,9,24,0.98));border:1px solid rgba(139,92,246,0.24);border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .24s cubic-bezier(0.16,1,0.3,1),border-color .24s,box-shadow .24s;box-shadow:0 10px 26px -8px rgba(0,0,0,0.75)}',
      '.pv-card:hover{transform:translateY(-6px) scale(1.01);border-color:rgba(34,211,238,0.75);box-shadow:0 20px 38px -10px rgba(0,0,0,0.85),0 0 22px rgba(34,211,238,0.28),0 0 38px rgba(168,85,247,0.24)}',
      '.pv-card-thumb{position:relative;aspect-ratio:16/10;background:#050716;border-bottom:1px solid rgba(168,85,247,0.2);display:flex;align-items:center;justify-content:center;overflow:hidden}',
      '.pv-card-thumb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .24s}',
      '.pv-card:hover .pv-card-thumb img{transform:scale(1.06)}',
      '.pv-fav-btn{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:8px;border:1px solid rgba(34,211,238,0.28);background:rgba(5,7,22,0.8);color:#cbd5e1;display:flex;align-items:center;justify-content:center;font-size:14px}',
      '.pv-fav-btn.active{background:rgba(168,85,247,0.25);border-color:rgba(168,85,247,0.65);color:#fcd34d;box-shadow:0 0 12px rgba(168,85,247,0.4)}',
      '.pv-card-body{padding:16px;display:flex;flex-direction:column;flex:1}',
      '.pv-card-meta{font-size:12px;color:#94a3b8;margin-bottom:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
      '.pv-card-title{font-family:"Chakra Petch","Plus Jakarta Sans",sans-serif;margin:0 0 6px;font-size:16px;font-weight:700;color:#fff;transition:color .2s}',
      '.pv-card:hover .pv-card-title{color:#67e8f9}',
      '.pv-card-desc{margin:0 0 12px;font-size:12px;color:#94a3b8;line-height:1.5;flex:1}',
      '.pv-card-foot{padding-top:10px;border-top:1px solid rgba(168,85,247,0.16);display:flex;justify-content:space-between;font-size:11px;color:#94a3b8}',
      '.pv-theater{display:flex;flex-direction:column;gap:20px}',
      '.pv-player-box{background:#04050f;border:1px solid rgba(168,85,247,0.35);border-radius:16px;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.7),0 0 28px rgba(34,211,238,0.14)}',
      '.pv-player-bar{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;padding:10px 16px;background:#090c22;border-bottom:1px solid rgba(168,85,247,0.25)}',
      '.pv-player-frame{position:relative;width:100%;height:min(78vh,580px);background:#04050f;overflow:hidden}',
      '.pv-player-frame iframe{width:100%;height:100%;border:none}',
      '.pv-curtain{position:absolute;inset:0;z-index:10;background:#04050f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;transition:opacity .3s}',
      '.pv-curtain img{width:160px;aspect-ratio:16/10;object-fit:cover;border-radius:12px;border:1px solid rgba(34,211,238,0.4);box-shadow:0 0 24px rgba(34,211,238,0.28)}',
      '.pv-details-grid{display:grid;grid-template-columns:2fr 1fr;gap:20px}',
      '.pv-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}',
      '.pv-lb-grid{display:grid;grid-template-columns:1.8fr 1fr;gap:20px}',
      '@media(max-width:900px){.pv-details-grid,.pv-hero,.pv-lb-grid{grid-template-columns:1fr}.pv-stats-grid{grid-template-columns:repeat(2,1fr)}.pv-nav{display:none}}',
      '.pv-panel{background:rgba(8,11,31,0.9);border:1px solid rgba(168,85,247,0.25);border-radius:16px;padding:20px}',
      '.pv-field{width:100%;padding:9px 12px;background:#04050f;border:1px solid rgba(168,85,247,0.35);border-radius:10px;color:#fff;font-size:13px;outline:none}',
      '.pv-field:focus{border-color:#22d3ee}',
      '.pv-table{width:100%;border-collapse:collapse;font-size:13px}',
      '.pv-table th{text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;color:#94a3b8;border-bottom:1px solid rgba(168,85,247,0.2)}',
      '.pv-table td{padding:10px 12px;border-bottom:1px solid rgba(168,85,247,0.12)}',
      '.pv-dropdown{position:relative}',
      '.pv-dropdown-menu{position:absolute;right:0;top:100%;margin-top:8px;width:220px;background:#0a0e26;border:1px solid rgba(168,85,247,0.4);border-radius:12px;padding:6px 0;z-index:60;box-shadow:0 16px 32px rgba(0,0,0,0.75)}',
      '.pv-dropdown-item{width:100%;text-align:left;padding:8px 12px;font-size:12px;color:#cbd5e1;display:flex;justify-content:space-between;align-items:center}',
      '.pv-dropdown-item:hover{background:rgba(168,85,247,0.18)}',
      '.pv-footer{margin-top:auto;border-top:1px solid rgba(168,85,247,0.2);background:rgba(4,5,15,0.95);padding:24px 20px;font-size:12px;color:#94a3b8}',
      '.pv-footer-inner{max-width:1280px;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px}',
      '.pv-drawer-wrap{position:fixed;bottom:16px;right:16px;z-index:35;display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none}',
      '.pv-drawer-wrap>*{pointer-events:auto}',
      '.pv-drawer{width:min(420px,calc(100vw - 2rem));max-height:76vh;display:flex;flex-direction:column;background:rgba(6,9,26,0.97);backdrop-filter:blur(16px);border:1px solid rgba(168,85,247,0.45);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,0.88),0 0 28px rgba(34,211,238,0.18);overflow:hidden}',
      '.pv-drawer-body{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}',
      '.pv-panic{position:fixed;inset:0;z-index:100;background:#f8f9fa;color:#1e293b;display:flex;flex-direction:column;overflow:auto}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDuration(totalSeconds) {
    var s = Math.max(0, Math.floor(totalSeconds || 0));
    if (s < 60) return s + 's';
    var mins = Math.floor(s / 60);
    var hrs = Math.floor(mins / 60);
    if (hrs > 0) return hrs + 'h ' + (mins % 60) + 'm';
    return mins + 'm ' + (s % 60) + 's';
  }

  function formatClock(totalSeconds) {
    var m = Math.floor((totalSeconds || 0) / 60);
    var s = (totalSeconds || 0) % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function extractIframeSrc(iframeHtmlOrUrl) {
    if (!iframeHtmlOrUrl) return '';
    var trimmed = iframeHtmlOrUrl.trim();
    var src = trimmed;
    if (trimmed.indexOf('<iframe') === 0) {
      var match = trimmed.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) src = match[1];
    }
    if (src.indexOf('/games/') === 0) {
      src = '.' + src;
    }
    if (state.gamesBasePrefix === './public/' && src.indexOf('./games/') === 0) {
      src = './public/' + src.slice(2);
    }
    return src;
  }

  function resolveAssetUrl(pathStr, fallbackPath) {
    var raw = pathStr || fallbackPath || './thumbnails/default.svg';
    if (raw.indexOf('/thumbnails/') === 0 || raw.indexOf('/og-thumbnail') === 0) {
      raw = '.' + raw;
    }
    if (state.gamesBasePrefix === './public/' && raw.indexOf('./') === 0 && raw.indexOf('./public/') !== 0) {
      raw = './public/' + raw.slice(2);
    }
    return raw;
  }

  function applyCloak(option) {
    state.currentCloak = option.id;
    localStorage.setItem('playvault_cloak', option.id);
    document.title = option.title;
    var link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.type = option.faviconUrl.indexOf('.svg') !== -1 ? 'image/svg+xml' : 'image/x-icon';
    link.href = option.faviconUrl;
  }

  function selectGame(game) {
    if (!game) return;
    state.selectedGame = game;
    state.activeView = 'catalog';
    state.isDrawerOpen = false;
    state.drawerPerGameId = game.id;
    state.lbPerGameId = game.id;
    state.theaterSeconds = 0;
    state.liveScore = 0;
    state.theaterScoreSaved = false;
    state.initialLocalBest = LOCAL_HIGH_KEYS[game.id]
      ? parseInt(localStorage.getItem(LOCAL_HIGH_KEYS[game.id]) || '0', 10) || 0
      : 0;

    state.recentIds = [game.id].concat(state.recentIds.filter(function (id) { return id !== game.id; })).slice(0, 6);
    localStorage.setItem('playvault_recent', JSON.stringify(state.recentIds));

    var curr = state.playStats[game.id] || { sessions: 0, totalSeconds: 0, lastPlayed: 0 };
    state.playStats[game.id] = {
      sessions: (curr.sessions || 0) + 1,
      totalSeconds: curr.totalSeconds || 0,
      lastPlayed: Date.now()
    };
    localStorage.setItem('playvault_stats', JSON.stringify(state.playStats));

    startPlayTimer();
    render();
  }

  function stopPlayTimer() {
    if (playTimerId) {
      clearInterval(playTimerId);
      playTimerId = null;
    }
  }

  var LOCAL_HIGH_KEYS = {
    snake: 'playvault_snake_high',
    tetris: 'playvault_tetris_high',
    '2048': 'playvault_2048_best',
    stack: 'playvault_stack_high',
    flappy: 'playvault_flappy_high',
    dino: 'playvault_dino_high',
    minesweeper: 'playvault_minesweeper_high',
    wordle: 'playvault_wordle_high',
    connect4: 'playvault_connect4_high',
    'tic-tac-toe': 'playvault_tictactoe_high'
  };

  function buildPerGameMap(entries) {
    var map = {};
    (entries || []).forEach(function (e) {
      if (!e || !e.gameId) return;
      if (!map[e.gameId]) map[e.gameId] = [];
      map[e.gameId].push(e);
    });
    Object.keys(map).forEach(function (gid) {
      map[gid].sort(function (a, b) { return b.score - a.score || b.createdAt - a.createdAt; });
    });
    return map;
  }

  function persistLeaderboard(entries) {
    state.leaderboardEntries = (entries || []).slice(0, 300);
    try {
      var serialized = JSON.stringify(state.leaderboardEntries);
      localStorage.setItem('playvault_global_leaderboard', serialized);
      localStorage.setItem('playvault_leaderboard', serialized);
      localStorage.setItem('playvault_per_game_leaderboards', JSON.stringify(buildPerGameMap(state.leaderboardEntries)));
    } catch (e) {}
  }

  function loadLeaderboardFromStorage() {
    var list = [];
    var seen = {};
    try {
      var g = JSON.parse(localStorage.getItem('playvault_global_leaderboard') || '[]');
      var pgMap = JSON.parse(localStorage.getItem('playvault_per_game_leaderboards') || '{}');
      var pgList = [];
      if (pgMap && typeof pgMap === 'object') {
        Object.keys(pgMap).forEach(function (k) {
          if (Array.isArray(pgMap[k])) pgList = pgList.concat(pgMap[k]);
        });
      }
      var l = JSON.parse(localStorage.getItem('playvault_leaderboard') || '[]');
      g.concat(pgList, l).forEach(function (item) {
        if (!item || !item.gameId || isNaN(Number(item.score))) return;
        var id = item.id || (item.gameId + '-' + (item.createdAt || Date.now()));
        if (!seen[id]) {
          seen[id] = true;
          list.push({
            id: id,
            gameId: item.gameId,
            player: String(item.player || 'Player 1').trim().slice(0, 18) || 'Player 1',
            score: Number(item.score),
            note: item.note || '',
            source: item.source || 'auto',
            createdAt: Number(item.createdAt) || Date.now()
          });
        }
      });
    } catch (e) {}

    var changed = false;
    var activePlayer = (localStorage.getItem('playvault_player_name') || state.playerHandle || 'Player 1').trim().slice(0, 18) || 'Player 1';
    var playerSlug = activePlayer.toLowerCase().replace(/[^a-z0-9]/g, '') || 'player1';
    Object.keys(LOCAL_HIGH_KEYS).forEach(function (gid) {
      var localBest = parseInt(localStorage.getItem(LOCAL_HIGH_KEYS[gid]) || '0', 10);
      if (localBest > 0) {
        var hasAny = list.some(function (x) { return x.gameId === gid; });
        if (!hasAny) {
          list.unshift({
            id: 'auto-' + gid + '-' + playerSlug,
            gameId: gid,
            player: activePlayer,
            score: localBest,
            note: 'Earned in gameplay',
            source: 'auto',
            createdAt: Date.now()
          });
          changed = true;
        }
      }
    });
    if (changed) persistLeaderboard(list);
    else state.leaderboardEntries = list;
  }

  function computePerGameBoard(gameId) {
    return state.leaderboardEntries
      .filter(function (e) { return e.gameId === gameId; })
      .slice()
      .sort(function (a, b) { return b.score - a.score || b.createdAt - a.createdAt; });
  }

  function computeGlobalStandings() {
    var gameTitleMap = {};
    state.games.forEach(function (g) { gameTitleMap[g.id] = g.title; });
    var byPlayer = {};
    state.leaderboardEntries.forEach(function (e) {
      if (state.games.length > 0 && !gameTitleMap[e.gameId]) return;
      var name = String(e.player || 'Player 1').trim() || 'Player 1';
      var key = name.toLowerCase();
      if (!byPlayer[key]) {
        byPlayer[key] = { player: name, bestPerGame: {}, submissions: 0 };
      }
      var rec = byPlayer[key];
      rec.submissions += 1;
      if (rec.bestPerGame[e.gameId] === undefined || e.score > rec.bestPerGame[e.gameId]) {
        rec.bestPerGame[e.gameId] = e.score;
      }
    });
    return Object.keys(byPlayer).map(function (k) {
      var p = byPlayer[k];
      var gids = Object.keys(p.bestPerGame);
      var total = 0;
      var topGameId = null;
      var topGameScore = 0;
      gids.forEach(function (gid) {
        total += p.bestPerGame[gid];
        if (p.bestPerGame[gid] > topGameScore) {
          topGameScore = p.bestPerGame[gid];
          topGameId = gid;
        }
      });
      return {
        player: p.player,
        gamesScored: gids.length,
        totalPoints: total,
        submissions: p.submissions,
        topGameId: topGameId,
        topGameTitle: topGameId ? gameTitleMap[topGameId] : null,
        topGameScore: topGameScore
      };
    }).sort(function (a, b) {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.gamesScored - a.gamesScored;
    });
  }

  function upsertAutoScore(gameId, scoreVal) {
    var numeric = Number(scoreVal);
    if (!gameId || isNaN(numeric) || numeric <= 0) return false;
    var cleanPlayer = (localStorage.getItem('playvault_player_name') || state.playerHandle || 'Player 1').trim().slice(0, 18) || 'Player 1';
    var cleanLower = cleanPlayer.toLowerCase();
    var playerBest = state.leaderboardEntries
      .filter(function (e) { return e.gameId === gameId && String(e.player || '').trim().toLowerCase() === cleanLower; })
      .reduce(function (m, e) { return e.score > m ? e.score : m; }, 0);
    if (numeric <= playerBest) return false;
    var playerSlug = cleanLower.replace(/[^a-z0-9]/g, '') || 'player';
    var autoId = 'auto-' + gameId + '-' + playerSlug;
    var filtered = state.leaderboardEntries.filter(function (e) {
      return e.id !== autoId &&
        e.id !== ('auto-' + gameId) &&
        !(e.gameId === gameId && String(e.player || '').trim().toLowerCase() === cleanLower);
    });
    persistLeaderboard([{ id: autoId, gameId: gameId, player: cleanPlayer, score: numeric, note: 'Earned in gameplay', source: 'auto', createdAt: Date.now() }].concat(filtered));
    return true;
  }

  function syncScoreFromIframe() {
    if (!state.selectedGame) return;
    var g = state.selectedGame;
    var src = extractIframeSrc(g.iframe);
    if (/^https?:\/\//i.test(src)) return;

    var current = 0;
    var domBest = 0;
    var localStorageBest = LOCAL_HIGH_KEYS[g.id] ? parseInt(localStorage.getItem(LOCAL_HIGH_KEYS[g.id]) || '0', 10) || 0 : 0;
    var frame = document.getElementById('pv-game-iframe');
    if (frame) {
      try {
        var doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
        if (doc) {
          ['#score', '#p1Score'].forEach(function (sel) {
            var el = doc.querySelector(sel);
            if (el) {
              var v = parseInt((el.textContent || '').replace(/[^0-9-]/g, ''), 10);
              if (!isNaN(v) && v > current) current = v;
            }
          });
          ['#highScore', '#bestScore'].forEach(function (sel) {
            var el = doc.querySelector(sel);
            if (el) {
              var v = parseInt((el.textContent || '').replace(/[^0-9-]/g, ''), 10);
              if (!isNaN(v) && v > domBest) domBest = v;
            }
          });
        }
      } catch (e) {}
    }

    if (current > 0) {
      state.liveScore = current;
      var lsEl = document.getElementById('pv-live-score');
      if (lsEl) {
        lsEl.textContent = '· Score: ' + current.toLocaleString();
        lsEl.style.display = 'inline';
      }
    }

    var earned = current;
    var hasZeroEntries = !state.leaderboardEntries.some(function (e) { return e.gameId === g.id; });
    if (localStorageBest > state.initialLocalBest && localStorageBest > earned) {
      earned = localStorageBest;
      state.initialLocalBest = localStorageBest;
    } else if (hasZeroEntries) {
      earned = Math.max(earned, domBest, localStorageBest);
    }

    if (earned > 0 && upsertAutoScore(g.id, earned)) {
      var listEl = document.getElementById('pv-theater-game-lb');
      if (listEl) {
        var board = computePerGameBoard(g.id).slice(0, 5);
        listEl.innerHTML = board.map(function (entry, idx) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:8px;background:#080b1f;border:1px solid rgba(168,85,247,0.18);font-size:12px">' +
            '<span><strong style="color:' + (idx === 0 ? '#fcd34d' : idx === 1 ? '#67e8f9' : '#94a3b8') + ';font-family:monospace;margin-right:8px">#' + (idx + 1) + '</strong><strong style="color:#fff">' + escapeHtml(entry.player) + '</strong></span>' +
            '<span style="font-family:monospace;font-weight:700;color:#fcd34d">' + Number(entry.score).toLocaleString() + '</span></div>';
        }).join('');
      }
    }
  }

  function startPlayTimer() {
    stopPlayTimer();
    if (!state.selectedGame) return;
    playTimerId = setInterval(function () {
      if (!state.selectedGame || state.isPanicOpen) return;
      state.theaterSeconds += 1;
      var id = state.selectedGame.id;
      var curr = state.playStats[id] || { sessions: 1, totalSeconds: 0, lastPlayed: Date.now() };
      curr.totalSeconds = (curr.totalSeconds || 0) + 1;
      curr.lastPlayed = Date.now();
      state.playStats[id] = curr;
      if (state.theaterSeconds % 5 === 0) {
        localStorage.setItem('playvault_stats', JSON.stringify(state.playStats));
      }
      var el = document.getElementById('pv-live-timer');
      if (el) el.textContent = formatClock(state.theaterSeconds);
      syncScoreFromIframe();
    }, 1000);
  }

  function updatePlayerHandle(newName) {
    var cleanPlayer = String(newName || '').trim().slice(0, 18) || 'Player 1';
    state.playerHandle = cleanPlayer;
    localStorage.setItem('playvault_player_name', cleanPlayer);
  }

  function launchRandomGame() {
    if (!state.games.length) return;
    var pool = state.games.length > 1 && state.selectedGame
      ? state.games.filter(function (g) { return g.id !== state.selectedGame.id; })
      : state.games;
    var picked = pool[Math.floor(Math.random() * pool.length)];
    selectGame(picked);
  }

  function getFilteredGames() {
    var q = state.searchQuery.toLowerCase().trim();
    return state.games
      .filter(function (game) {
        if (state.selectedCategory === 'Featured' && !game.featured) return false;
        if (state.selectedCategory === 'Favorites' && state.favorites.indexOf(game.id) === -1) return false;
        if (['All', 'Featured', 'Favorites'].indexOf(state.selectedCategory) === -1) {
          if ((game.category || '').toLowerCase() !== state.selectedCategory.toLowerCase()) return false;
        }
        if (q) {
          var tags = Array.isArray(game.tags) ? game.tags.join(' ') : '';
          var haystack = [game.title, game.category, game.description, tags].join(' ').toLowerCase();
          return haystack.indexOf(q) !== -1;
        }
        return true;
      })
      .sort(function (a, b) {
        if (state.sortBy === 'featured') return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        if (state.sortBy === 'sessions') {
          var sa = (state.playStats[a.id] && state.playStats[a.id].sessions) || 0;
          var sb = (state.playStats[b.id] && state.playStats[b.id].sessions) || 0;
          if (sb !== sa) return sb - sa;
          return (a.title || '').localeCompare(b.title || '');
        }
        if (state.sortBy === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
        if (state.sortBy === 'category') return (a.category || '').localeCompare(b.category || '') || (a.title || '').localeCompare(b.title || '');
        return 0;
      });
  }

  function renderLeaderboardHtml() {
    var gamesMap = {};
    state.games.forEach(function (g) { gamesMap[g.id] = g; });

    var totalSessions = 0;
    var totalSeconds = 0;
    Object.keys(state.playStats).forEach(function (k) {
      totalSessions += state.playStats[k].sessions || 0;
      totalSeconds += state.playStats[k].totalSeconds || 0;
    });

    var mostPlayed = state.games
      .map(function (g) {
        var st = state.playStats[g.id] || {};
        return { game: g, sessions: st.sessions || 0, totalSeconds: st.totalSeconds || 0 };
      })
      .filter(function (x) { return x.sessions > 0; })
      .sort(function (a, b) { return b.sessions - a.sessions || b.totalSeconds - a.totalSeconds; });

    var globalStandings = computeGlobalStandings();
    var activeGame = gamesMap[state.lbPerGameId] || state.games[0] || null;
    var perGameBoard = activeGame ? computePerGameBoard(activeGame.id) : [];
    var bestByGame = {};
    state.leaderboardEntries.forEach(function (e) {
      if (!bestByGame[e.gameId] || e.score > bestByGame[e.gameId].score) bestByGame[e.gameId] = e;
    });

    var topTitle = mostPlayed.length > 0 ? mostPlayed[0].game.title : 'No plays yet';

    var out = '<div style="display:flex;flex-direction:column;gap:20px">';
    out += '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px">';
    out += '<div><div style="font-size:12px;font-weight:700;color:#67e8f9;margin-bottom:4px">NexArcade Ranking System</div>';
    out += '<h1 style="font-family:&quot;Chakra Petch&quot;,sans-serif;margin:0;font-size:30px;color:#fff">' + (state.lbBoardType === 'global' ? 'Global Leaderboard' : 'Per-Game Leaderboards') + '</h1>';
    out += '<p style="margin:4px 0 0;font-size:13px;color:#94a3b8">' + (state.lbBoardType === 'global' ? 'Combined points earned across every game—play multiple titles to climb higher.' : 'Every game maintains its own separate leaderboard—pick any game to view its champions.') + '</p></div>';
    if (!state.lbConfirmReset) {
      out += '<button id="pv-lb-reset-ask" class="pv-btn pv-btn-danger">Reset Records</button>';
    } else {
      out += '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.4)">';
      out += '<span style="font-size:12px;color:#fecdd3">Clear all stats &amp; scores?</span>';
      out += '<button id="pv-lb-reset-yes" class="pv-btn pv-btn-danger" style="padding:4px 10px">Confirm</button>';
      out += '<button id="pv-lb-reset-no" class="pv-btn" style="padding:4px 10px">Cancel</button></div>';
    }
    out += '</div>';

    // 2-Type Mode Switcher
    out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">';
    out += '<button data-lb-type="global" class="pv-panel" style="text-align:left;cursor:pointer;border-color:' + (state.lbBoardType === 'global' ? '#22d3ee' : 'rgba(168,85,247,0.25)') + ';background:' + (state.lbBoardType === 'global' ? 'rgba(34,211,238,0.12)' : 'rgba(8,11,31,0.9)') + '">';
    out += '<div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:15px;font-weight:700;color:#fff">1. Global Leaderboard</div>';
    out += '<div style="font-size:11px;color:#94a3b8;margin-top:3px">Combined points across every game (' + globalStandings.length + ' players)</div></button>';
    out += '<button data-lb-type="per-game" class="pv-panel" style="text-align:left;cursor:pointer;border-color:' + (state.lbBoardType === 'per-game' ? '#a855f7' : 'rgba(168,85,247,0.25)') + ';background:' + (state.lbBoardType === 'per-game' ? 'rgba(168,85,247,0.16)' : 'rgba(8,11,31,0.9)') + '">';
    out += '<div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:15px;font-weight:700;color:#fff">2. Per-Game Leaderboards</div>';
    out += '<div style="font-size:11px;color:#94a3b8;margin-top:3px">Separate leaderboard for each of the ' + state.games.length + ' games</div></button>';
    out += '</div>';

    out += '<div class="pv-stats-grid">';
    out += '<div class="pv-panel"><div style="font-size:12px;color:#94a3b8;margin-bottom:4px">Total Sessions</div><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:24px;font-weight:700;color:#67e8f9">' + totalSessions + '</div></div>';
    out += '<div class="pv-panel"><div style="font-size:12px;color:#94a3b8;margin-bottom:4px">Active Play Time</div><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:24px;font-weight:700;color:#c084fc">' + escapeHtml(formatDuration(totalSeconds)) + '</div></div>';
    out += '<div class="pv-panel"><div style="font-size:12px;color:#94a3b8;margin-bottom:4px">Games With Records</div><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:24px;font-weight:700;color:#fcd34d">' + Object.keys(bestByGame).length + '/' + state.games.length + '</div></div>';
    out += '<div class="pv-panel"><div style="font-size:12px;color:#94a3b8;margin-bottom:4px">Most Played Game</div><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:18px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(topTitle) + '</div></div>';
    out += '</div>';

    // Player Tag Form (Scores earned strictly in-game)
    out += '<form id="pv-lb-tag-form" class="pv-panel" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px">';
    out += '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:220px"><span style="font-size:12px;font-weight:700;color:#67e8f9;white-space:nowrap">Active Player Tag:</span>';
    out += '<input id="pv-lb-player" class="pv-field" style="max-width:200px;padding:6px 10px;font-size:12px" type="text" maxlength="18" placeholder="Player 1" value="' + escapeHtml(state.playerHandle) + '">';
    out += '<button type="submit" class="pv-btn" style="padding:6px 12px">Set Tag</button></div>';
    out += '<span style="font-size:11px;color:#94a3b8">Scores increase automatically only as you play games and earn points.</span></form>';

    out += '<div class="pv-lb-grid">';
    out += '<div class="pv-panel" style="padding:20px">';

    if (state.lbBoardType === 'global') {
      out += '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid rgba(168,85,247,0.2)">';
      out += '<div><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:16px;font-weight:700;color:#fff">Global Combined Points Standings</div><div style="font-size:11px;color:#94a3b8">Sum of your best earned score in every game</div></div>';
      out += '<div style="display:flex;gap:6px"><button id="pv-lb-view-global" class="pv-tab ' + (!state.lbShowAllRuns ? 'active' : '') + '">Global Ranks (' + globalStandings.length + ')</button>';
      out += '<button id="pv-lb-view-runs" class="pv-tab ' + (state.lbShowAllRuns ? 'active' : '') + '">All Game Records (' + state.leaderboardEntries.length + ')</button></div></div>';

      if (!state.lbShowAllRuns) {
        if (globalStandings.length === 0) {
          out += '<div style="padding:36px 20px;text-align:center;color:#94a3b8;font-size:13px">No global points earned yet. Play any game to start building your combined total!</div>';
        } else {
          out += '<div style="overflow-x:auto"><table class="pv-table"><thead><tr><th>Rank</th><th>Player</th><th style="text-align:right">Games</th><th>Top Game</th><th style="text-align:right">Global Points</th></tr></thead><tbody>';
          globalStandings.forEach(function (p, idx) {
            out += '<tr><td style="font-family:monospace;color:' + (idx === 0 ? '#fcd34d' : idx === 1 ? '#67e8f9' : '#94a3b8') + '">#' + (idx + 1) + '</td>';
            out += '<td><strong style="color:#fff">' + escapeHtml(p.player) + '</strong></td>';
            out += '<td style="text-align:right;color:#cbd5e1">' + p.gamesScored + '/' + state.games.length + '</td>';
            out += '<td style="color:#94a3b8">' + (p.topGameTitle ? escapeHtml(p.topGameTitle) + ' (' + Number(p.topGameScore).toLocaleString() + ')' : '—') + '</td>';
            out += '<td style="text-align:right;font-family:&quot;Chakra Petch&quot;,sans-serif;font-weight:700;color:#67e8f9">' + Number(p.totalPoints).toLocaleString() + '</td></tr>';
          });
          out += '</tbody></table></div>';
        }
      } else {
        var allRuns = state.leaderboardEntries.slice().sort(function (a, b) { return b.score - a.score || b.createdAt - a.createdAt; });
        if (allRuns.length === 0) {
          out += '<div style="padding:36px 20px;text-align:center;color:#94a3b8;font-size:13px">No high scores recorded yet.</div>';
        } else {
          out += '<div style="overflow-x:auto"><table class="pv-table"><thead><tr><th>Rank</th><th>Player</th><th>Game</th><th style="text-align:right">Score</th><th style="text-align:right">Action</th></tr></thead><tbody>';
          allRuns.forEach(function (entry, idx) {
            var gm = gamesMap[entry.gameId];
            out += '<tr><td style="font-family:monospace;color:' + (idx === 0 ? '#fcd34d' : idx === 1 ? '#67e8f9' : '#94a3b8') + '">#' + (idx + 1) + '</td>';
            out += '<td><strong style="color:#fff">' + escapeHtml(entry.player) + '</strong></td>';
            out += '<td><button data-select-pergame="' + escapeHtml(entry.gameId) + '" style="color:#67e8f9">' + escapeHtml(gm ? gm.title : entry.gameId) + '</button></td>';
            out += '<td style="text-align:right;font-family:&quot;Chakra Petch&quot;,sans-serif;font-weight:700;color:#67e8f9">' + Number(entry.score).toLocaleString() + '</td>';
            out += '<td style="text-align:right"><button data-del-score="' + escapeHtml(entry.id) + '" style="color:#94a3b8;font-size:12px" title="Remove">✕</button></td></tr>';
          });
          out += '</tbody></table></div>';
        }
      }
    } else {
      out += '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid rgba(168,85,247,0.2)">';
      out += '<div><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:16px;font-weight:700;color:#fff">' + escapeHtml(activeGame ? activeGame.title + ' Leaderboard' : 'Game Leaderboard') + '</div>';
      out += '<div style="font-size:11px;color:#94a3b8">Dedicated standings for this game only</div></div>';
      if (activeGame) {
        out += '<div style="display:flex;gap:8px;align-items:center"><select id="pv-lb-pergame-select" class="pv-field" style="width:auto;padding:6px 10px;font-size:12px">';
        state.games.forEach(function (gm) {
          out += '<option value="' + escapeHtml(gm.id) + '"' + (activeGame.id === gm.id ? ' selected' : '') + '>' + escapeHtml(gm.title) + '</option>';
        });
        out += '</select><button data-open-game="' + escapeHtml(activeGame.id) + '" class="pv-btn pv-btn-primary">Play</button></div>';
      }
      out += '</div>';

      if (perGameBoard.length === 0) {
        out += '<div style="padding:32px 20px;text-align:center;color:#94a3b8;font-size:13px">No scores recorded for ' + escapeHtml(activeGame ? activeGame.title : 'this game') + ' yet. Play and gain points to claim #1!</div>';
      } else {
        out += '<div style="overflow-x:auto"><table class="pv-table"><thead><tr><th>Rank</th><th>Player</th><th style="text-align:right">High Score</th><th style="text-align:right">Action</th></tr></thead><tbody>';
        perGameBoard.forEach(function (entry, idx) {
          out += '<tr><td style="font-family:monospace;color:' + (idx === 0 ? '#fcd34d' : idx === 1 ? '#67e8f9' : '#94a3b8') + '">#' + (idx + 1) + '</td>';
          out += '<td><strong style="color:#fff">' + escapeHtml(entry.player) + '</strong></td>';
          out += '<td style="text-align:right;font-family:&quot;Chakra Petch&quot;,sans-serif;font-weight:700;color:#fcd34d">' + Number(entry.score).toLocaleString() + '</td>';
          out += '<td style="text-align:right"><button data-del-score="' + escapeHtml(entry.id) + '" style="color:#94a3b8;font-size:12px" title="Remove">✕</button></td></tr>';
        });
        out += '</tbody></table></div>';
      }

      out += '<div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(168,85,247,0.2)">';
      out += '<div style="font-size:12px;font-weight:700;color:#cbd5e1;margin-bottom:10px">All Separate Game Leaderboards (' + state.games.length + ')</div>';
      out += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px">';
      state.games.forEach(function (gm) {
        var gb = bestByGame[gm.id];
        var isSel = activeGame && activeGame.id === gm.id;
        out += '<button data-select-pergame="' + escapeHtml(gm.id) + '" style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:10px;border:1px solid ' + (isSel ? '#22d3ee' : 'rgba(168,85,247,0.22)') + ';background:' + (isSel ? '#0e1436' : '#050716') + ';text-align:left">';
        out += '<span style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-right:8px">' + escapeHtml(gm.title) + '</span>';
        out += '<span style="font-family:monospace;font-size:11px;font-weight:700;color:' + (gb ? '#fcd34d' : '#64748b') + '">' + (gb ? Number(gb.score).toLocaleString() : 'Empty') + '</span></button>';
      });
      out += '</div></div>';
    }
    out += '</div>';

    // Most Played Sidebar
    out += '<div class="pv-panel"><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:14px">Your Most Played</div>';
    if (mostPlayed.length === 0) {
      out += '<p style="font-size:13px;color:#94a3b8">Launch any game from the catalog to start tracking your session counts and play time.</p>';
    } else {
      mostPlayed.slice(0, 10).forEach(function (item, idx) {
        out += '<div data-select-game="' + escapeHtml(item.game.id) + '" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px;border:1px solid rgba(168,85,247,0.2);border-radius:10px;margin-bottom:8px;cursor:pointer;background:#050716">';
        out += '<div style="min-width:0"><div style="font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="color:#67e8f9;font-family:monospace;margin-right:6px">#' + (idx + 1) + '</span>' + escapeHtml(item.game.title) + '</div>';
        out += '<div style="font-size:11px;color:#94a3b8">' + escapeHtml(item.game.category) + ' · ' + escapeHtml(formatDuration(item.totalSeconds)) + '</div></div>';
        out += '<div style="font-size:12px;font-weight:700;color:#c084fc;white-space:nowrap">' + item.sessions + (item.sessions === 1 ? ' play' : ' plays') + '</div></div>';
      });
    }
    out += '</div></div></div>';
    return out;
  }

  function render() {
    var root = document.getElementById('root');
    if (!root) return;

    if (state.isPanicOpen) {
      root.innerHTML =
        '<div class="pv-panic">' +
          '<div style="background:#fff;border-bottom:1px solid #e2e8f0;padding:10px 20px;display:flex;justify-content:space-between;align-items:center">' +
            '<div><strong>AP Calculus BC — Semester Exam Review</strong> <span style="color:#64748b;font-size:12px">Saved to Drive</span></div>' +
            '<button id="pv-exit-panic" style="padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;color:#334155">Return to Games (Esc)</button>' +
          '</div>' +
          '<div style="max-width:760px;margin:32px auto;background:#fff;border:1px solid #e2e8f0;padding:40px;line-height:1.7;font-size:14px">' +
            '<h1 style="margin-top:0;font-size:22px;border-bottom:1px solid #e2e8f0;padding-bottom:10px">Section 4.3: Analytical Applications of the Definite Integral</h1>' +
            '<p>Let <em>f</em> be a continuous real-valued function defined on a closed interval [<em>a</em>, <em>b</em>]. If <em>F</em> is an antiderivative of <em>f</em> on [<em>a</em>, <em>b</em>], then:</p>' +
            '<div style="background:#f8fafc;border-left:3px solid #3b82f6;padding:12px;font-family:monospace;text-align:center;margin:16px 0">∫[a to b] f(x) dx = F(b) - F(a)</div>' +
            '<p>Review problems 12–24 prior to Friday\'s cumulative assessment.</p>' +
          '</div>' +
        '</div>';
      document.getElementById('pv-exit-panic').onclick = function () {
        state.isPanicOpen = false;
        render();
      };
      return;
    }

    var filtered = getFilteredGames();
    var spotlight = state.games.length > 0 ? state.games[state.spotlightIndex % state.games.length] : null;
    var bestByGame = {};
    state.leaderboardEntries.forEach(function (e) {
      if (bestByGame[e.gameId] === undefined || e.score > bestByGame[e.gameId]) bestByGame[e.gameId] = e.score;
    });

    var html = '<div class="pv-app">';
    html += '<header class="pv-header"><div class="pv-header-inner">';
    html += '<div class="pv-brand" id="pv-home"><div class="pv-brand-icon"><svg viewBox="0 0 32 32" fill="none" style="width:20px;height:20px"><path d="M6 23V9L14 23V9" stroke="#22d3ee" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 9L26 23M26 9L18 23" stroke="#c084fc" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:20px;font-weight:700;letter-spacing:0.03em"><span style="color:#fff">Nex</span><span class="pv-brand-text">Arcade</span></span></div>';
    html += '<nav class="pv-nav">';
    ['All', 'Action', 'Puzzle', 'Retro', 'Favorites'].forEach(function (cat) {
      var label = cat === 'All' ? 'All Games' : cat;
      var active = state.activeView === 'catalog' && state.selectedCategory === cat && !state.selectedGame;
      html += '<button data-nav-cat="' + cat + '" class="' + (active ? 'active' : '') + '">' + label + '</button>';
    });
    html += '<button id="pv-nav-leaderboard" class="' + (state.activeView === 'leaderboard' && !state.selectedGame ? 'active' : '') + '">Leaderboard</button>';
    html += '</nav>';
    html += '<div class="pv-actions">';
    html += '<div class="pv-dropdown"><button id="pv-cloak-toggle" class="pv-btn">Cloak Tab</button>';
    if (state.isCloakOpen) {
      html += '<div class="pv-dropdown-menu">';
      CLOAK_OPTIONS.forEach(function (opt) {
        html += '<button class="pv-dropdown-item" data-cloak="' + opt.id + '"><span>' + escapeHtml(opt.label) + '</span><span>' + (state.currentCloak === opt.id ? '✓' : '') + '</span></button>';
      });
      html += '</div>';
    }
    html += '</div>';
    html += '<button id="pv-panic-btn" class="pv-btn pv-btn-danger">Panic (Esc)</button>';
    html += '</div></div></header>';

    html += '<main class="pv-main">';

    if (state.selectedGame) {
      var g = state.selectedGame;
      var iframeSrc = extractIframeSrc(g.iframe);
      var isExternal = /^https?:\/\//i.test(iframeSrc);
      var isFav = state.favorites.indexOf(g.id) !== -1;
      var gStats = state.playStats[g.id] || {};
      var gBest = bestByGame[g.id];

      html += '<div class="pv-theater">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#94a3b8">';
      html += '<button id="pv-back-btn" style="color:#67e8f9;font-weight:600">← Back to All Games</button>';
      html += '<span>' + escapeHtml(g.category) + ' · ' + escapeHtml(g.title) + '</span></div>';

      html += '<div id="pv-player-box" class="pv-player-box">';
      html += '<div class="pv-player-bar">';
      html += '<div style="display:flex;align-items:center;gap:10px"><span style="font-weight:700;color:#fff;font-size:14px">' + escapeHtml(g.title) + ' <span style="color:#67e8f9;font-weight:400">· ' + escapeHtml(g.category) + '</span></span>';
      html += '<span id="pv-live-timer" style="font-family:monospace;font-size:11px;color:#67e8f9;padding:2px 8px;border-radius:6px;border:1px solid rgba(34,211,238,0.3);background:#050716">' + formatClock(state.theaterSeconds) + '</span>';
      html += '<span id="pv-live-score" style="font-family:monospace;font-size:11px;color:#fcd34d;display:' + (state.liveScore > 0 ? 'inline' : 'none') + '">· Score: ' + state.liveScore.toLocaleString() + '</span></div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">';
      html += '<button id="pv-reload-btn" class="pv-btn">Restart</button>';
      html += '<button id="pv-theater-fav" class="pv-btn">' + (isFav ? '★ Favorited' : '☆ Favorite') + '</button>';
      if (!isExternal) {
        html += '<button id="pv-popout-btn" class="pv-btn">Popout</button>';
      }
      html += '<button id="pv-share-btn" class="pv-btn">' + (state.copiedShare ? 'Copied!' : 'Share') + '</button>';
      html += '<button id="pv-fullscreen-btn" class="pv-btn pv-btn-purple">Fullscreen</button>';
      html += '</div></div>';
      var selectedThumb = resolveAssetUrl(g.thumbnail, './thumbnails/' + g.id + '.svg');
      var sandboxAttr = isExternal ? ' sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"' : '';
      html += '<div class="pv-player-frame"><iframe id="pv-game-iframe" src="' + escapeHtml(iframeSrc) + '" title="' + escapeHtml(g.title) + '" scrolling="no" referrerpolicy="no-referrer"' + sandboxAttr + ' allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe>';
      html += '<div id="pv-launch-curtain" class="pv-curtain"><img src="' + escapeHtml(selectedThumb) + '" alt="' + escapeHtml(g.title) + '" referrerpolicy="no-referrer"><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-weight:700;color:#fff;font-size:16px">' + escapeHtml(g.title) + '</div></div>';
      html += '</div></div>';

      html += '<div class="pv-details-grid">';
      html += '<div style="display:flex;flex-direction:column;gap:20px">';
      html += '<div class="pv-panel"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">';
      html += '<h2 style="margin:0;color:#fff;font-size:20px">' + escapeHtml(g.title) + '</h2>';
      html += '<div style="font-size:12px;color:#cbd5e1">' + escapeHtml(g.category) + (gStats.sessions ? ' · ' + gStats.sessions + ' sessions' : '') + (gBest !== undefined ? ' · <span style="color:#fcd34d">Best ' + Number(gBest).toLocaleString() + '</span>' : '') + '</div></div>';
      html += '<p style="color:#cbd5e1;font-size:14px;line-height:1.6">' + escapeHtml(g.description) + '</p>';
      html += '<div style="background:#04050f;border:1px solid rgba(34,211,238,0.25);border-radius:10px;padding:12px;margin-top:14px"><div style="font-size:11px;font-weight:700;color:#67e8f9;text-transform:uppercase;margin-bottom:4px">Controls (Keyboard, Mouse &amp; Touch)</div><div style="font-size:12px;color:#e2e8f0;font-family:monospace">' + escapeHtml(g.controls) + '</div></div></div>';

      // Dedicated Per-Game Leaderboard Card inside Theater
      var thBoard = computePerGameBoard(g.id);
      html += '<div class="pv-panel" style="display:flex;flex-direction:column;gap:10px">';
      html += '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px">';
      html += '<strong style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:14px;color:#fff">' + escapeHtml(g.title) + ' Leaderboard</strong>';
      html += '<button type="button" id="pv-theater-open-lb" style="font-size:12px;color:#67e8f9;font-weight:600">All Leaderboards →</button></div>';
      html += '<div id="pv-theater-game-lb" style="display:flex;flex-direction:column;gap:6px">';
      if (thBoard.length > 0) {
        thBoard.slice(0, 5).forEach(function (entry, idx) {
          html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:8px;background:#080b1f;border:1px solid rgba(168,85,247,0.18);font-size:12px">' +
            '<span><strong style="color:' + (idx === 0 ? '#fcd34d' : idx === 1 ? '#67e8f9' : '#94a3b8') + ';font-family:monospace;margin-right:8px">#' + (idx + 1) + '</strong><strong style="color:#fff">' + escapeHtml(entry.player) + '</strong></span>' +
            '<span style="font-family:monospace;font-weight:700;color:#fcd34d">' + Number(entry.score).toLocaleString() + '</span></div>';
        });
      } else {
        html += '<div style="font-size:12px;color:#94a3b8">' + (isExternal ? 'External sandboxed game — session play time is tracked automatically.' : 'No scores recorded for this game yet. Play and earn points to claim #1!') + '</div>';
      }
      html += '</div></div></div>';

      html += '<div class="pv-panel"><div style="font-size:12px;font-weight:700;color:#67e8f9;text-transform:uppercase;margin-bottom:10px">More to Play</div>';
      state.games.filter(function (x) { return x.id !== g.id; }).slice(0, 4).forEach(function (rel) {
        var relSessions = (state.playStats[rel.id] && state.playStats[rel.id].sessions) || 0;
        html += '<div data-select-game="' + escapeHtml(rel.id) + '" style="padding:10px;border:1px solid rgba(168,85,247,0.22);border-radius:10px;margin-bottom:8px;cursor:pointer;background:#050716"><div style="font-size:13px;font-weight:700;color:#fff">' + escapeHtml(rel.title) + '</div><div style="font-size:11px;color:#94a3b8">' + escapeHtml(rel.category) + (relSessions > 0 ? ' · ' + relSessions + ' plays' : '') + '</div></div>';
      });
      html += '</div></div></div>';
    } else if (state.activeView === 'leaderboard') {
      html += renderLeaderboardHtml();
    } else {
      if (state.selectedCategory === 'All' && !state.searchQuery && spotlight) {
        var spThumb = resolveAssetUrl(spotlight.thumbnail, './thumbnails/' + spotlight.id + '.svg');
        var spSessions = (state.playStats[spotlight.id] && state.playStats[spotlight.id].sessions) || 0;
        html += '<div id="pv-hero-box" class="pv-hero"><div>';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">';
        html += '<div class="pv-hero-kicker">Featured Spotlight · ' + escapeHtml(spotlight.category) + ' · ' + ((state.spotlightIndex % state.games.length) + 1) + '/' + state.games.length + '</div>';
        html += '<div style="display:flex;gap:6px"><button id="pv-sp-prev" class="pv-btn" style="padding:4px 8px">◀</button><button id="pv-sp-next" class="pv-btn" style="padding:4px 8px">▶</button></div></div>';
        html += '<h1>' + escapeHtml(spotlight.title) + '</h1>';
        html += '<p>' + escapeHtml(spotlight.description) + '</p>';
        html += '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px"><button id="pv-spotlight-play" class="pv-btn pv-btn-primary" style="padding:10px 18px;font-size:14px">Play Now →</button>';
        html += '<button id="pv-spotlight-next" class="pv-btn" style="padding:10px 14px">Next Spotlight</button>';
        if (spSessions > 0) {
          html += '<span style="font-size:12px;color:#d8b4fe">Played ' + spSessions + (spSessions === 1 ? ' time' : ' times') + '</span>';
        }
        html += '</div><div class="pv-dots">';
        state.games.forEach(function (gm, idx) {
          var activeDot = idx === (state.spotlightIndex % state.games.length);
          html += '<button class="pv-dot ' + (activeDot ? 'active' : '') + '" data-sp-idx="' + idx + '" title="' + escapeHtml(gm.title) + '"></button>';
        });
        html += '</div></div>';
        html += '<div class="pv-hero-thumb" id="pv-spotlight-thumb"><img src="' + escapeHtml(spThumb) + '" alt="' + escapeHtml(spotlight.title) + ' spotlight thumbnail" referrerpolicy="no-referrer"></div></div>';
      }

      // Continue Playing Strip
      var gamesMap = {};
      state.games.forEach(function (gm) { gamesMap[gm.id] = gm; });
      var recentGames = state.recentIds.map(function (id) { return gamesMap[id]; }).filter(Boolean).slice(0, 4);
      if (state.selectedCategory === 'All' && !state.searchQuery && recentGames.length > 0) {
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><strong style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:14px;color:#fff">Continue Playing</strong><button id="pv-open-lb-strip" style="font-size:12px;color:#67e8f9">Open Leaderboard →</button></div>';
        html += '<div class="pv-recent-grid">';
        recentGames.forEach(function (rg) {
          var rThumb = resolveAssetUrl(rg.thumbnail, './thumbnails/' + rg.id + '.svg');
          var rSessions = (state.playStats[rg.id] && state.playStats[rg.id].sessions) || 1;
          html += '<button class="pv-recent-card" data-open-game="' + escapeHtml(rg.id) + '"><img src="' + escapeHtml(rThumb) + '" alt="' + escapeHtml(rg.title) + '" referrerpolicy="no-referrer"><div style="min-width:0"><div style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(rg.title) + '</div><div style="font-size:11px;color:#94a3b8">' + escapeHtml(rg.category) + ' · ' + rSessions + (rSessions === 1 ? ' play' : ' plays') + '</div></div></button>';
        });
        html += '</div>';
      }

      html += '<div class="pv-controls"><div class="pv-controls-row">';
      html += '<div class="pv-search"><input id="pv-search-input" type="text" value="' + escapeHtml(state.searchQuery) + '" placeholder="Search games, tags, or categories... (Press /)"></div>';
      html += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><button id="pv-random-btn" class="pv-btn pv-btn-purple">Random Game</button>';
      html += '<div class="pv-sort"><span>Sort:</span><select id="pv-sort-select"><option value="featured"' + (state.sortBy === 'featured' ? ' selected' : '') + '>Featured First</option><option value="sessions"' + (state.sortBy === 'sessions' ? ' selected' : '') + '>Most Played (Yours)</option><option value="alphabetical"' + (state.sortBy === 'alphabetical' ? ' selected' : '') + '>Title (A-Z)</option><option value="category"' + (state.sortBy === 'category' ? ' selected' : '') + '>Category</option></select></div></div>';
      html += '</div><div class="pv-tabs">';
      CATEGORIES.forEach(function (cat) {
        var extra = (cat === 'Favorites' && state.favorites.length > 0) ? ' (' + state.favorites.length + ')' : '';
        html += '<button data-tab-cat="' + cat + '" class="pv-tab ' + (state.selectedCategory === cat ? 'active' : '') + '">' + cat + extra + '</button>';
      });
      html += '</div></div>';

      html += '<div class="pv-meta-bar"><span>Showing <strong style="color:#67e8f9">' + filtered.length + '</strong> games</span><span>Press <kbd style="background:#0a0e26;border:1px solid rgba(168,85,247,0.4);border-radius:4px;padding:1px 6px;color:#67e8f9">/</kbd> to search · <kbd style="background:#0a0e26;border:1px solid rgba(168,85,247,0.4);border-radius:4px;padding:1px 6px;color:#67e8f9">Esc</kbd> for Panic Cloak</span></div>';

      if (state.loading) {
        html += '<div style="padding:40px;text-align:center;color:#94a3b8">Loading games from games.json...</div>';
      } else if (filtered.length === 0) {
        html += '<div class="pv-panel" style="text-align:center;padding:48px"><h3 style="margin:0 0 8px;color:#fff">No Games Found</h3><p style="color:#94a3b8;font-size:13px">Try another filter or search term.</p></div>';
      } else {
        html += '<div class="pv-grid">';
        filtered.forEach(function (game) {
          var fav = state.favorites.indexOf(game.id) !== -1;
          var thumbUrl = resolveAssetUrl(game.thumbnail, './thumbnails/' + game.id + '.svg');
          var sessionCount = (state.playStats[game.id] && state.playStats[game.id].sessions) || 0;
          var hasTouch = /touch|tap|drag|swipe/i.test(game.controls || '');
          html += '<div class="pv-card" data-open-game="' + escapeHtml(game.id) + '">';
          html += '<div class="pv-card-thumb">';
          html += '<img src="' + escapeHtml(thumbUrl) + '" alt="' + escapeHtml(game.title) + ' thumbnail" referrerpolicy="no-referrer" loading="lazy" onerror="this.style.display=\'none\'">';
          if (game.isCustom) {
            html += '<button class="pv-fav-btn" style="left:10px;right:auto;border-color:rgba(244,63,94,0.45);color:#fda4af" data-remove-id="' + escapeHtml(game.id) + '" title="Remove custom game">✕</button>';
          }
          html += '<button class="pv-fav-btn ' + (fav ? 'active' : '') + '" data-fav-id="' + escapeHtml(game.id) + '" title="Favorite">' + (fav ? '★' : '☆') + '</button>';
          html += '</div>';
          html += '<div class="pv-card-body">';
          var cardBest = bestByGame[game.id];
          html += '<div class="pv-card-meta"><span style="color:#67e8f9">' + escapeHtml(game.category) + '</span><span>·</span><span>' + (hasTouch ? 'Touch &amp; Keyboard' : 'Keyboard &amp; Mouse') + '</span>' + (cardBest > 0 ? '<span>·</span><span style="color:#fcd34d;font-weight:700">Best ' + Number(cardBest).toLocaleString() + '</span>' : sessionCount > 0 ? '<span>·</span><span style="color:#d8b4fe">' + sessionCount + (sessionCount === 1 ? ' play' : ' plays') + '</span>' : '') + '</div>';
          html += '<h3 class="pv-card-title">' + escapeHtml(game.title) + '</h3>';
          html += '<p class="pv-card-desc">' + escapeHtml(game.description) + '</p>';
          html += '<div class="pv-card-foot"><span>' + escapeHtml((game.controls || '').split('·')[0]) + '</span><span style="color:#c084fc;font-weight:700">Play →</span></div>';
          html += '</div></div>';
        });
        html += '</div>';
      }
    }

    html += '</main>';
    html += '<footer class="pv-footer"><div class="pv-footer-inner"><span><strong style="color:#fff">Nex</strong><strong style="color:#67e8f9">Arcade</strong> · Neon Arcade Portal · Instant browser arcade games</span><div style="display:flex;gap:16px"><button id="pv-foot-lb">Leaderboard</button><button id="pv-foot-random">Random Game</button><button id="pv-foot-panic">Panic Mode</button></div></div></footer>';

    // Persistent Floating Dual Leaderboard Drawer
    if (state.games.length > 0) {
      var drGlobalStandings = computeGlobalStandings();
      var drTopGlobal = drGlobalStandings[0] ? drGlobalStandings[0].totalPoints : state.leaderboardEntries.length;
      var drawerGamesMap = {};
      state.games.forEach(function (gm) { drawerGamesMap[gm.id] = gm; });
      var drActiveGame = drawerGamesMap[state.drawerPerGameId] || state.selectedGame || state.games[0];
      var drPerGameBoard = drActiveGame ? computePerGameBoard(drActiveGame.id) : [];

      html += '<div class="pv-drawer-wrap">';
      if (state.isDrawerOpen) {
        html += '<aside class="pv-drawer">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#0a0f29;border-bottom:1px solid rgba(168,85,247,0.25)">';
        html += '<div><div style="font-family:&quot;Chakra Petch&quot;,sans-serif;font-size:14px;font-weight:700;color:#fff">Leaderboards</div><div style="font-size:11px;color:#94a3b8">Global Combined + ' + state.games.length + ' Game Boards</div></div>';
        html += '<div style="display:flex;gap:6px"><button id="pv-dr-full" class="pv-btn" style="padding:4px 8px;font-size:11px">Full View ↗</button><button id="pv-dr-close" style="color:#94a3b8;font-size:14px;padding:2px 6px">✕</button></div></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:8px;background:#040612;border-bottom:1px solid rgba(168,85,247,0.2)">';
        html += '<button data-dr-tab="global" class="pv-tab ' + (state.drawerTab === 'global' ? 'active' : '') + '">Global</button>';
        html += '<button data-dr-tab="per-game" class="pv-tab ' + (state.drawerTab === 'per-game' ? 'active' : '') + '">Per Game</button>';
        html += '<button data-dr-tab="runs" class="pv-tab ' + (state.drawerTab === 'runs' ? 'active' : '') + '">Top Runs</button></div>';
        html += '<form id="pv-dr-tag-form" style="padding:10px 12px;background:#080c22;border-bottom:1px solid rgba(168,85,247,0.2);display:flex;justify-content:space-between;align-items:center;gap:8px">';
        html += '<input id="pv-dr-player" class="pv-field" style="flex:1;padding:6px 8px;font-size:12px" type="text" maxlength="18" placeholder="Player Tag (Player 1)" value="' + escapeHtml(state.playerHandle) + '">';
        html += '<span style="font-size:11px;color:#67e8f9;white-space:nowrap">Earned in-game only</span></form>';
        html += '<div class="pv-drawer-body">';
        if (state.drawerTab === 'global') {
          if (drGlobalStandings.length === 0) {
            html += '<div style="padding:24px;text-align:center;font-size:12px;color:#94a3b8">Play games to earn points—your scores across all games combine here!</div>';
          } else {
            drGlobalStandings.forEach(function (p, idx) {
              html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:10px;background:#090d24;border:1px solid rgba(168,85,247,0.2)">';
              html += '<div style="min-width:0"><div style="font-size:12px;font-weight:700;color:#fff"><span style="color:#67e8f9;font-family:monospace;margin-right:6px">#' + (idx + 1) + '</span>' + escapeHtml(p.player) + '</div>';
              html += '<div style="font-size:11px;color:#94a3b8">' + p.gamesScored + (p.gamesScored === 1 ? ' game' : ' games') + (p.topGameTitle ? ' · Best: ' + escapeHtml(p.topGameTitle) : '') + '</div></div>';
              html += '<span style="font-family:monospace;font-size:12px;font-weight:700;color:#67e8f9">' + Number(p.totalPoints).toLocaleString() + '</span></div>';
            });
          }
        } else if (state.drawerTab === 'per-game') {
          html += '<div style="display:flex;gap:6px;margin-bottom:4px"><select id="pv-dr-pergame-select" class="pv-field" style="flex:1;padding:6px 8px;font-size:12px">';
          state.games.forEach(function (gm) {
            html += '<option value="' + escapeHtml(gm.id) + '"' + (drActiveGame && drActiveGame.id === gm.id ? ' selected' : '') + '>' + escapeHtml(gm.title) + '</option>';
          });
          html += '</select>';
          if (drActiveGame) {
            html += '<button data-open-game="' + escapeHtml(drActiveGame.id) + '" class="pv-btn pv-btn-primary" style="padding:6px 10px">Play</button>';
          }
          html += '</div>';
          if (drPerGameBoard.length === 0) {
            html += '<div style="padding:20px;text-align:center;font-size:12px;color:#94a3b8">No scores yet on ' + escapeHtml(drActiveGame ? drActiveGame.title : 'this game') + ' leaderboard.</div>';
          } else {
            drPerGameBoard.forEach(function (entry, idx) {
              html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:10px;background:#090d24;border:1px solid rgba(168,85,247,0.2)">';
              html += '<div style="font-size:12px;font-weight:700;color:#fff"><span style="color:' + (idx === 0 ? '#fcd34d' : '#67e8f9') + ';font-family:monospace;margin-right:6px">#' + (idx + 1) + '</span>' + escapeHtml(entry.player) + '</div>';
              html += '<span style="font-family:monospace;font-size:12px;font-weight:700;color:#fcd34d">' + Number(entry.score).toLocaleString() + '</span></div>';
            });
          }
        } else {
          var ranked = state.leaderboardEntries.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 20);
          if (ranked.length === 0) {
            html += '<div style="padding:24px;text-align:center;font-size:12px;color:#94a3b8">No scores yet. Play a game to start earning points!</div>';
          } else {
            ranked.forEach(function (entry, idx) {
              var gm = drawerGamesMap[entry.gameId];
              html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-radius:10px;background:#090d24;border:1px solid rgba(168,85,247,0.2)">';
              html += '<div style="min-width:0"><div style="font-size:12px;font-weight:700;color:#fff"><span style="color:#67e8f9;font-family:monospace;margin-right:6px">#' + (idx + 1) + '</span>' + escapeHtml(entry.player) + '</div>';
              html += '<div style="font-size:11px;color:#94a3b8">' + escapeHtml(gm ? gm.title : entry.gameId) + '</div></div>';
              html += '<span style="font-family:monospace;font-size:12px;font-weight:700;color:#67e8f9">' + Number(entry.score).toLocaleString() + '</span></div>';
            });
          }
        }
        html += '</div></aside>';
      }
      html += '<button id="pv-dr-toggle" class="pv-btn pv-btn-purple" style="padding:10px 14px;font-size:12px;box-shadow:0 12px 30px rgba(0,0,0,0.75),0 0 20px rgba(168,85,247,0.45)">Leaderboards · ' + Number(drTopGlobal).toLocaleString() + '</button>';
      html += '</div>';
    }

    html += '</div>';
    root.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    var home = document.getElementById('pv-home');
    if (home) home.onclick = function () { stopPlayTimer(); state.selectedCategory = 'All'; state.activeView = 'catalog'; state.selectedGame = null; render(); };

    var navLb = document.getElementById('pv-nav-leaderboard');
    if (navLb) navLb.onclick = function () { stopPlayTimer(); state.selectedGame = null; state.activeView = 'leaderboard'; render(); };
    var footLb = document.getElementById('pv-foot-lb');
    if (footLb) footLb.onclick = function () { stopPlayTimer(); state.selectedGame = null; state.activeView = 'leaderboard'; render(); };
    var stripLb = document.getElementById('pv-open-lb-strip');
    if (stripLb) stripLb.onclick = function () { stopPlayTimer(); state.selectedGame = null; state.activeView = 'leaderboard'; render(); };

    document.querySelectorAll('[data-nav-cat],[data-tab-cat]').forEach(function (el) {
      el.onclick = function () {
        stopPlayTimer();
        state.selectedCategory = el.getAttribute('data-nav-cat') || el.getAttribute('data-tab-cat');
        state.activeView = 'catalog';
        state.selectedGame = null;
        render();
      };
    });

    var cloakToggle = document.getElementById('pv-cloak-toggle');
    if (cloakToggle) cloakToggle.onclick = function () { state.isCloakOpen = !state.isCloakOpen; render(); };

    document.querySelectorAll('[data-cloak]').forEach(function (el) {
      el.onclick = function () {
        var opt = CLOAK_OPTIONS.find(function (o) { return o.id === el.getAttribute('data-cloak'); });
        if (opt) applyCloak(opt);
        state.isCloakOpen = false;
        render();
      };
    });

    var panicBtn = document.getElementById('pv-panic-btn');
    if (panicBtn) panicBtn.onclick = function () { state.isPanicOpen = true; render(); };
    var footPanic = document.getElementById('pv-foot-panic');
    if (footPanic) footPanic.onclick = function () { state.isPanicOpen = true; render(); };

    var randBtn = document.getElementById('pv-random-btn');
    if (randBtn) randBtn.onclick = launchRandomGame;
    var footRand = document.getElementById('pv-foot-random');
    if (footRand) footRand.onclick = launchRandomGame;

    var searchInput = document.getElementById('pv-search-input');
    if (searchInput) {
      searchInput.oninput = function (e) {
        var pos = e.target.selectionStart;
        state.searchQuery = e.target.value;
        render();
        var nextInput = document.getElementById('pv-search-input');
        if (nextInput) { nextInput.focus(); nextInput.setSelectionRange(pos, pos); }
      };
    }

    var sortSelect = document.getElementById('pv-sort-select');
    if (sortSelect) sortSelect.onchange = function (e) { state.sortBy = e.target.value; render(); };

    var heroBox = document.getElementById('pv-hero-box');
    if (heroBox) {
      heroBox.onmouseenter = function () { state.isSpotlightPaused = true; };
      heroBox.onmouseleave = function () { state.isSpotlightPaused = false; };
    }

    var spPrev = document.getElementById('pv-sp-prev');
    if (spPrev) spPrev.onclick = function () {
      if (state.games.length) {
        state.spotlightIndex = (state.spotlightIndex - 1 + state.games.length) % state.games.length;
        render();
      }
    };
    var spNext = document.getElementById('pv-sp-next');
    if (spNext) spNext.onclick = function () {
      if (state.games.length) {
        state.spotlightIndex = (state.spotlightIndex + 1) % state.games.length;
        render();
      }
    };
    var spNextBtn = document.getElementById('pv-spotlight-next');
    if (spNextBtn) spNextBtn.onclick = function () {
      if (state.games.length) {
        state.spotlightIndex = (state.spotlightIndex + 1) % state.games.length;
        render();
      }
    };
    document.querySelectorAll('[data-sp-idx]').forEach(function (dot) {
      dot.onclick = function () {
        state.spotlightIndex = Number(dot.getAttribute('data-sp-idx')) || 0;
        render();
      };
    });

    var spotlightPlay = document.getElementById('pv-spotlight-play');
    if (spotlightPlay) spotlightPlay.onclick = function () {
      if (state.games.length) selectGame(state.games[state.spotlightIndex % state.games.length]);
    };
    var spotlightThumb = document.getElementById('pv-spotlight-thumb');
    if (spotlightThumb) spotlightThumb.onclick = function () {
      if (state.games.length) selectGame(state.games[state.spotlightIndex % state.games.length]);
    };

    document.querySelectorAll('[data-remove-id]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-remove-id');
        state.games = state.games.filter(function (g) { return g.id !== id; });
        if (state.selectedGame && state.selectedGame.id === id) { stopPlayTimer(); state.selectedGame = null; }
        try {
          var stored = JSON.parse(localStorage.getItem('playvault_custom_games') || '[]');
          localStorage.setItem('playvault_custom_games', JSON.stringify(stored.filter(function (g) { return g.id !== id; })));
        } catch (err) {}
        render();
      };
    });

    document.querySelectorAll('[data-fav-id]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-fav-id');
        var idx = state.favorites.indexOf(id);
        if (idx === -1) state.favorites.push(id);
        else state.favorites.splice(idx, 1);
        localStorage.setItem('playvault_favorites', JSON.stringify(state.favorites));
        render();
      };
    });

    document.querySelectorAll('[data-open-game],[data-select-game]').forEach(function (card) {
      card.onclick = function () {
        var id = card.getAttribute('data-open-game') || card.getAttribute('data-select-game');
        var found = state.games.find(function (g) { return g.id === id; });
        if (found) selectGame(found);
      };
    });

    var backBtn = document.getElementById('pv-back-btn');
    if (backBtn) backBtn.onclick = function () { stopPlayTimer(); state.selectedGame = null; render(); };

    var gameFrame = document.getElementById('pv-game-iframe');
    var launchCurtain = document.getElementById('pv-launch-curtain');
    if (gameFrame && launchCurtain) {
      var hideCurtain = function () {
        launchCurtain.style.opacity = '0';
        setTimeout(function () {
          if (launchCurtain && launchCurtain.parentNode) launchCurtain.style.display = 'none';
        }, 280);
      };
      gameFrame.onload = hideCurtain;
      setTimeout(hideCurtain, 2600);
    }

    var reloadBtn = document.getElementById('pv-reload-btn');
    if (reloadBtn) reloadBtn.onclick = function () {
      var frame = document.getElementById('pv-game-iframe');
      if (frame) {
        if (launchCurtain) { launchCurtain.style.display = 'flex'; launchCurtain.style.opacity = '1'; }
        frame.src = frame.src;
      }
    };

    var fsBtn = document.getElementById('pv-fullscreen-btn');
    if (fsBtn) fsBtn.onclick = function () {
      var box = document.getElementById('pv-player-box');
      if (box && box.requestFullscreen) box.requestFullscreen();
    };

    var popBtn = document.getElementById('pv-popout-btn');
    if (popBtn && state.selectedGame) popBtn.onclick = function () {
      window.open(extractIframeSrc(state.selectedGame.iframe), '_blank', 'noopener,noreferrer,width=960,height=640');
    };

    var theaterFav = document.getElementById('pv-theater-fav');
    if (theaterFav && state.selectedGame) theaterFav.onclick = function () {
      var id = state.selectedGame.id;
      var idx = state.favorites.indexOf(id);
      if (idx === -1) state.favorites.push(id);
      else state.favorites.splice(idx, 1);
      localStorage.setItem('playvault_favorites', JSON.stringify(state.favorites));
      render();
    };

    var shareBtn = document.getElementById('pv-share-btn');
    if (shareBtn && state.selectedGame && navigator.clipboard) shareBtn.onclick = function () {
      navigator.clipboard.writeText(window.location.origin + window.location.pathname + '?game=' + state.selectedGame.id).then(function () {
        state.copiedShare = true; render();
        setTimeout(function () { state.copiedShare = false; render(); }, 1800);
      });
    };

    var thOpenLb = document.getElementById('pv-theater-open-lb');
    if (thOpenLb) thOpenLb.onclick = function () {
      var curId = state.selectedGame ? state.selectedGame.id : '';
      stopPlayTimer();
      state.selectedGame = null;
      state.lbBoardType = 'per-game';
      if (curId) state.lbPerGameId = curId;
      state.activeView = 'leaderboard';
      render();
    };

    document.querySelectorAll('[data-lb-type]').forEach(function (btn) {
      btn.onclick = function () { state.lbBoardType = btn.getAttribute('data-lb-type'); render(); };
    });

    var viewGlobalBtn = document.getElementById('pv-lb-view-global');
    if (viewGlobalBtn) viewGlobalBtn.onclick = function () { state.lbShowAllRuns = false; render(); };
    var viewRunsBtn = document.getElementById('pv-lb-view-runs');
    if (viewRunsBtn) viewRunsBtn.onclick = function () { state.lbShowAllRuns = true; render(); };

    var lbPerGameSel = document.getElementById('pv-lb-pergame-select');
    if (lbPerGameSel) lbPerGameSel.onchange = function (e) { state.lbPerGameId = e.target.value; render(); };

    document.querySelectorAll('[data-select-pergame]').forEach(function (btn) {
      btn.onclick = function () {
        state.lbBoardType = 'per-game';
        state.lbPerGameId = btn.getAttribute('data-select-pergame');
        render();
      };
    });

    var lbTagForm = document.getElementById('pv-lb-tag-form');
    if (lbTagForm) {
      lbTagForm.onsubmit = function (e) {
        e.preventDefault();
        updatePlayerHandle(document.getElementById('pv-lb-player').value);
        render();
      };
    }

    document.querySelectorAll('[data-del-score]').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-del-score');
        persistLeaderboard(state.leaderboardEntries.filter(function (entry) { return entry.id !== id; }));
        render();
      };
    });

    var askReset = document.getElementById('pv-lb-reset-ask');
    if (askReset) askReset.onclick = function () { state.lbConfirmReset = true; render(); };
    var noReset = document.getElementById('pv-lb-reset-no');
    if (noReset) noReset.onclick = function () { state.lbConfirmReset = false; render(); };
    var yesReset = document.getElementById('pv-lb-reset-yes');
    if (yesReset) yesReset.onclick = function () {
      state.playStats = {};
      state.recentIds = [];
      state.leaderboardEntries = [];
      state.lbConfirmReset = false;
      localStorage.removeItem('playvault_stats');
      localStorage.removeItem('playvault_recent');
      localStorage.removeItem('playvault_global_leaderboard');
      localStorage.removeItem('playvault_per_game_leaderboards');
      localStorage.removeItem('playvault_leaderboard');
      Object.keys(LOCAL_HIGH_KEYS).forEach(function (k) {
        try { localStorage.removeItem(LOCAL_HIGH_KEYS[k]); } catch (err) {}
      });
      render();
    };

    var drToggle = document.getElementById('pv-dr-toggle');
    if (drToggle) drToggle.onclick = function () { state.isDrawerOpen = !state.isDrawerOpen; render(); };
    var drClose = document.getElementById('pv-dr-close');
    if (drClose) drClose.onclick = function () { state.isDrawerOpen = false; render(); };
    var drFull = document.getElementById('pv-dr-full');
    if (drFull) drFull.onclick = function () {
      stopPlayTimer();
      state.isDrawerOpen = false;
      state.selectedGame = null;
      state.lbBoardType = state.drawerTab === 'per-game' ? 'per-game' : 'global';
      if (state.drawerPerGameId) state.lbPerGameId = state.drawerPerGameId;
      state.activeView = 'leaderboard';
      render();
    };
    document.querySelectorAll('[data-dr-tab]').forEach(function (btn) {
      btn.onclick = function () { state.drawerTab = btn.getAttribute('data-dr-tab'); render(); };
    });
    var drPerGameSel = document.getElementById('pv-dr-pergame-select');
    if (drPerGameSel) drPerGameSel.onchange = function (e) { state.drawerPerGameId = e.target.value; render(); };
    var drTagForm = document.getElementById('pv-dr-tag-form');
    if (drTagForm) {
      drTagForm.onsubmit = function (e) {
        e.preventDefault();
        updatePlayerHandle(document.getElementById('pv-dr-player').value);
      };
      var drPlayer = document.getElementById('pv-dr-player');
      if (drPlayer) drPlayer.onblur = function (e) { updatePlayerHandle(e.target.value); };
    }
  }

  async function init() {
    injectStyles();
    try { state.favorites = JSON.parse(localStorage.getItem('playvault_favorites') || '[]'); } catch (e) {}
    try { state.recentIds = JSON.parse(localStorage.getItem('playvault_recent') || '[]'); } catch (e) {}
    try { state.playStats = JSON.parse(localStorage.getItem('playvault_stats') || '{}'); } catch (e) {}
    state.playerHandle = localStorage.getItem('playvault_player_name') || '';
    loadLeaderboardFromStorage();

    var storedCloak = localStorage.getItem('playvault_cloak');
    if (storedCloak) {
      var cloakOpt = CLOAK_OPTIONS.find(function (o) { return o.id === storedCloak; });
      if (cloakOpt) applyCloak(cloakOpt);
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === '`') {
        state.isPanicOpen = !state.isPanicOpen;
        render();
      } else if (
        e.key === '/' &&
        !state.isPanicOpen &&
        !state.selectedGame &&
        state.activeView === 'catalog' &&
        document.activeElement &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA'
      ) {
        var inp = document.getElementById('pv-search-input');
        if (inp) { e.preventDefault(); inp.focus(); }
      }
    });

    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      spotlightTimerId = setInterval(function () {
        if (
          state.games.length > 1 &&
          !state.isSpotlightPaused &&
          !state.selectedGame &&
          state.activeView === 'catalog' &&
          !state.isPanicOpen &&
          state.selectedCategory === 'All' &&
          !state.searchQuery &&
          (!document.activeElement || document.activeElement.id !== 'pv-search-input')
        ) {
          state.spotlightIndex = (state.spotlightIndex + 1) % state.games.length;
          render();
        }
      }, 6500);
    }

    render();

    try {
      var res = await fetch('./games.json');
      if (!res.ok) {
        res = await fetch('./public/games.json');
        if (res.ok) state.gamesBasePrefix = './public/';
      }
      var list = res.ok ? await res.json() : [];
      var custom = [];
      try {
        var rawCustom = JSON.parse(localStorage.getItem('playvault_custom_games') || '[]');
        custom = rawCustom.filter(function (g) {
          return !/8[\s-]*ball[\s-]*pool/i.test((g.id || '') + ' ' + (g.title || ''));
        });
        if (custom.length !== rawCustom.length) {
          localStorage.setItem('playvault_custom_games', JSON.stringify(custom));
        }
      } catch (e) {}
      var ids = new Set(list.map(function (g) { return g.id; }));
      state.games = custom.filter(function (g) { return !ids.has(g.id); }).concat(list);
      if (state.games.length > 0) {
        state.spotlightIndex = Math.floor(Math.random() * state.games.length);
      }

      var params = new URLSearchParams(window.location.search);
      var gameParam = params.get('game');
      if (gameParam) {
        var matched = state.games.find(function (g) { return g.id === gameParam; });
        if (matched) selectGame(matched);
      }
    } catch (err) {
      console.error('Failed to load games.json:', err);
    } finally {
      state.loading = false;
      render();
    }
  }

  init();
})();
