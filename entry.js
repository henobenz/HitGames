(function () {
  if (window.__PLAYVAULT_MOUNTED__) return;
  window.__PLAYVAULT_MOUNTED__ = true;

  var CLOAK_OPTIONS = [
    { id: 'default', label: 'Default (PlayVault)', title: 'PlayVault — Unblocked Games Hub', faviconUrl: './favicon.ico' },
    { id: 'classroom', label: 'Google Classroom', title: 'Classes — Google Classroom', faviconUrl: 'https://ssl.gstatic.com/classroom/favicon.png' },
    { id: 'drive', label: 'Google Drive', title: 'My Drive — Google Drive', faviconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
    { id: 'docs', label: 'Google Docs', title: 'Untitled Document — Google Docs', faviconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico' },
    { id: 'canvas', label: 'Canvas LMS', title: 'Dashboard — Canvas', faviconUrl: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
    { id: 'wikipedia', label: 'Wikipedia', title: 'Calculus — Wikipedia', faviconUrl: 'https://en.wikipedia.org/static/favicon/wikipedia.ico' }
  ];

  var CATEGORIES = ['All', 'Featured', 'Favorites', 'Retro', 'Arcade', 'Puzzle', 'Action', 'Casual', 'Strategy'];

  var state = {
    games: [],
    gamesBasePrefix: './',
    loading: true,
    selectedGame: null,
    searchQuery: '',
    selectedCategory: 'All',
    sortBy: 'popular',
    favorites: [],
    isAddModalOpen: false,
    isJsonModalOpen: false,
    jsonModalTab: 'view',
    isPanicOpen: false,
    isCloakOpen: false,
    currentCloak: 'default',
    copiedShare: false,
    copiedJson: false
  };

  function injectStyles() {
    if (document.getElementById('pv-fallback-styles')) return;
    var style = document.createElement('style');
    style.id = 'pv-fallback-styles';
    style.textContent = [
      '*,*::before,*::after{box-sizing:border-box}',
      'body{margin:0;background:#090d16;color:#f1f5f9;font-family:"Plus Jakarta Sans",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;overflow-x:hidden}',
      'button,input,select,textarea{font:inherit;color:inherit}',
      'button{cursor:pointer;background:none;border:none}',
      '.pv-app{min-height:100vh;display:flex;flex-direction:column;background:#090d16;color:#f1f5f9}',
      '.pv-header{position:sticky;top:0;z-index:40;background:rgba(2,6,23,0.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(30,41,59,0.85)}',
      '.pv-header-inner{max-width:1280px;margin:0 auto;padding:0 20px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:24px}',
      '.pv-brand{display:flex;align-items:center;gap:10px;cursor:pointer;white-space:nowrap;flex-shrink:0}',
      '.pv-brand-icon{width:36px;height:36px;border-radius:8px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);display:flex;align-items:center;justify-content:center;color:#34d399;font-weight:800}',
      '.pv-brand-text{font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.02em}',
      '.pv-nav{display:flex;align-items:center;gap:20px;font-size:14px;font-weight:500;color:#94a3b8;overflow-x:auto}',
      '.pv-nav button{padding:4px 0;white-space:nowrap;transition:color .15s}',
      '.pv-nav button:hover{color:#fff}',
      '.pv-nav button.active{color:#34d399;font-weight:600}',
      '.pv-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}',
      '.pv-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid #334155;background:#0f172a;color:#cbd5e1;white-space:nowrap;transition:all .15s}',
      '.pv-btn:hover{border-color:#475569;color:#fff}',
      '.pv-btn-primary{background:#34d399;border-color:#34d399;color:#020617}',
      '.pv-btn-primary:hover{background:#6ee7b7;border-color:#6ee7b7;color:#020617}',
      '.pv-btn-danger{background:rgba(244,63,94,0.1);border-color:rgba(244,63,94,0.35);color:#fda4af}',
      '.pv-btn-danger:hover{background:rgba(244,63,94,0.2);border-color:#fb7185}',
      '.pv-main{flex:1;max-width:1280px;width:100%;margin:0 auto;padding:32px 20px}',
      '.pv-hero{position:relative;border-radius:16px;background:linear-gradient(135deg,#0f172a,#020617);border:1px solid #1e293b;padding:28px;margin-bottom:28px;box-shadow:0 20px 40px rgba(0,0,0,0.4)}',
      '.pv-hero-kicker{font-size:12px;font-weight:700;color:#34d399;margin-bottom:10px;display:flex;align-items:center;gap:8px}',
      '.pv-hero h1{margin:0 0 10px;font-size:32px;font-weight:800;color:#fff;letter-spacing:-0.02em}',
      '.pv-hero p{margin:0 0 18px;font-size:14px;color:#cbd5e1;line-height:1.6;max-width:640px}',
      '.pv-controls{display:flex;flex-direction:column;gap:14px;margin-bottom:20px}',
      '.pv-controls-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}',
      '.pv-search{position:relative;flex:1;min-width:240px;max-width:440px}',
      '.pv-search input{width:100%;padding:9px 34px 9px 14px;background:#0f172a;border:1px solid #1e293b;border-radius:8px;font-size:14px;color:#fff;outline:none}',
      '.pv-search input:focus{border-color:#34d399}',
      '.pv-sort{display:flex;align-items:center;gap:8px;font-size:12px;color:#94a3b8}',
      '.pv-sort select{padding:7px 12px;background:#0f172a;border:1px solid #1e293b;border-radius:8px;color:#e2e8f0;font-size:12px;outline:none}',
      '.pv-tabs{display:flex;align-items:center;gap:6px;overflow-x:auto;padding-bottom:4px}',
      '.pv-tab{padding:6px 12px;border-radius:8px;font-size:12px;font-weight:500;color:#94a3b8;white-space:nowrap;border:1px solid transparent}',
      '.pv-tab:hover{color:#e2e8f0;background:rgba(15,23,42,0.7)}',
      '.pv-tab.active{background:#1e293b;color:#34d399;border-color:rgba(16,185,129,0.3)}',
      '.pv-meta-bar{display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(30,41,59,0.8);margin-bottom:20px;font-size:12px;color:#94a3b8}',
      '.pv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}',
      '.pv-card{display:flex;flex-direction:column;background:rgba(15,23,42,0.92);border:1px solid #1e293b;border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .18s,border-color .18s,box-shadow .18s}',
      '.pv-card:hover{transform:translateY(-4px);border-color:#334155;box-shadow:0 18px 32px rgba(0,0,0,0.45)}',
      '.pv-card-thumb{position:relative;aspect-ratio:16/10;background:#020617;display:flex;align-items:center;justify-content:center;padding:16px}',
      '.pv-card-badge{font-size:28px;font-weight:800;letter-spacing:-0.03em}',
      '.pv-fav-btn{position:absolute;top:10px;right:10px;width:30px;height:30px;border-radius:6px;background:rgba(2,6,23,0.75);color:#94a3b8;display:flex;align-items:center;justify-content:center;font-size:14px}',
      '.pv-fav-btn.active{background:rgba(251,191,36,0.2);color:#fbbf24}',
      '.pv-card-body{padding:16px;display:flex;flex-direction:column;flex:1}',
      '.pv-card-meta{font-size:12px;color:#94a3b8;margin-bottom:6px;display:flex;gap:6px;align-items:center}',
      '.pv-card-title{margin:0 0 6px;font-size:16px;font-weight:700;color:#fff}',
      '.pv-card-desc{margin:0 0 12px;font-size:12px;color:#94a3b8;line-height:1.5;flex:1}',
      '.pv-card-foot{padding-top:10px;border-top:1px solid rgba(30,41,59,0.8);display:flex;justify-content:space-between;font-size:11px;color:#64748b}',
      '.pv-theater{display:flex;flex-direction:column;gap:20px}',
      '.pv-player-box{background:#020617;border:1px solid #1e293b;border-radius:12px;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.5)}',
      '.pv-player-bar{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;background:#0f172a;border-bottom:1px solid #1e293b}',
      '.pv-player-frame{width:100%;height:min(78vh,580px);background:#020617}',
      '.pv-player-frame iframe{width:100%;height:100%;border:none}',
      '.pv-details-grid{display:grid;grid-template-columns:2fr 1fr;gap:20px}',
      '@media(max-width:900px){.pv-details-grid{grid-template-columns:1fr}.pv-nav{display:none}}',
      '.pv-panel{background:rgba(15,23,42,0.75);border:1px solid #1e293b;border-radius:12px;padding:20px}',
      '.pv-modal-backdrop{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;padding:16px}',
      '.pv-modal{width:100%;max-width:680px;max-height:90vh;overflow:auto;background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px}',
      '.pv-field{width:100%;padding:9px 12px;background:#020617;border:1px solid #334155;border-radius:8px;color:#fff;font-size:13px;outline:none}',
      '.pv-field:focus{border-color:#34d399}',
      '.pv-dropdown{position:relative}',
      '.pv-dropdown-menu{position:absolute;right:0;top:100%;margin-top:8px;width:220px;background:#0f172a;border:1px solid #334155;border-radius:8px;padding:6px 0;z-index:60;box-shadow:0 16px 32px rgba(0,0,0,0.5)}',
      '.pv-dropdown-item{width:100%;text-align:left;padding:8px 12px;font-size:12px;color:#cbd5e1;display:flex;justify-content:space-between;align-items:center}',
      '.pv-dropdown-item:hover{background:#1e293b}',
      '.pv-footer{margin-top:auto;border-top:1px solid rgba(30,41,59,0.8);background:#020617;padding:24px 20px;font-size:12px;color:#64748b}',
      '.pv-footer-inner{max-width:1280px;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px}',
      '.pv-panic{position:fixed;inset:0;z-index:100;background:#f8f9fa;color:#1e293b;display:flex;flex-direction:column;overflow:auto}',
      'pre.pv-json{background:#020617;border:1px solid #1e293b;border-radius:8px;padding:14px;overflow:auto;max-height:420px;font-size:12px;color:#6ee7b7;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}'
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

  function applyCloak(option) {
    state.currentCloak = option.id;
    localStorage.setItem('playvault_cloak', option.id);
    document.title = option.title;
    var link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.head.appendChild(link);
    }
    link.href = option.faviconUrl;
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
        if (state.sortBy === 'popular') return (b.playedCount || 0) - (a.playedCount || 0);
        if (state.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (state.sortBy === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
        return 0;
      });
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
    var spotlight = state.games.find(function (g) { return g.id === 'snake'; }) || state.games[0];

    var html = '<div class="pv-app">';
    // Header
    html += '<header class="pv-header"><div class="pv-header-inner">';
    html += '<div class="pv-brand" id="pv-home"><div class="pv-brand-icon">PV</div><span class="pv-brand-text">PlayVault</span></div>';
    html += '<nav class="pv-nav">';
    ['All', 'Retro', 'Puzzle', 'Action', 'Favorites'].forEach(function (cat) {
      var label = cat === 'All' ? 'All Games' : cat;
      html += '<button data-nav-cat="' + cat + '" class="' + (state.selectedCategory === cat ? 'active' : '') + '">' + label + '</button>';
    });
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
    html += '<button id="pv-json-btn" class="pv-btn">games.json</button>';
    html += '<button id="pv-add-btn" class="pv-btn pv-btn-primary">+ Add Game</button>';
    html += '</div></div></header>';

    html += '<main class="pv-main">';

    if (state.selectedGame) {
      var g = state.selectedGame;
      var iframeSrc = extractIframeSrc(g.iframe);
      var isFav = state.favorites.indexOf(g.id) !== -1;
      html += '<div class="pv-theater">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#94a3b8">';
      html += '<button id="pv-back-btn" style="color:#e2e8f0;font-weight:600">← Back to All Games</button>';
      html += '<span>' + escapeHtml(g.category) + ' · ' + escapeHtml(g.title) + '</span></div>';

      html += '<div id="pv-player-box" class="pv-player-box">';
      html += '<div class="pv-player-bar">';
      html += '<div style="font-weight:700;color:#fff;font-size:14px">' + escapeHtml(g.title) + ' <span style="color:#94a3b8;font-weight:400">· ' + escapeHtml(g.category) + '</span></div>';
      html += '<div style="display:flex;gap:8px;align-items:center">';
      html += '<button id="pv-reload-btn" class="pv-btn">Restart</button>';
      html += '<button id="pv-theater-fav" class="pv-btn">' + (isFav ? '★ Favorited' : '☆ Favorite') + '</button>';
      html += '<button id="pv-popout-btn" class="pv-btn">Popout</button>';
      html += '<button id="pv-share-btn" class="pv-btn">' + (state.copiedShare ? 'Copied!' : 'Share') + '</button>';
      html += '<button id="pv-fullscreen-btn" class="pv-btn pv-btn-primary">Fullscreen</button>';
      html += '</div></div>';
      html += '<div class="pv-player-frame"><iframe id="pv-game-iframe" src="' + escapeHtml(iframeSrc) + '" title="' + escapeHtml(g.title) + '" allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe></div>';
      html += '</div>';

      html += '<div class="pv-details-grid">';
      html += '<div class="pv-panel"><h2 style="margin:0 0 8px;color:#fff;font-size:20px">' + escapeHtml(g.title) + '</h2>';
      html += '<p style="color:#cbd5e1;font-size:14px;line-height:1.6">' + escapeHtml(g.description) + '</p>';
      html += '<div style="background:#020617;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-top:14px"><div style="font-size:11px;font-weight:700;color:#34d399;text-transform:uppercase;margin-bottom:4px">Controls</div><div style="font-size:12px;color:#cbd5e1;font-family:monospace">' + escapeHtml(g.controls) + '</div></div>';
      html += '<div style="margin-top:12px;font-size:11px;color:#64748b;word-break:break-all"><strong>Iframe:</strong> <code>' + escapeHtml(g.iframe) + '</code></div>';
      html += '</div>';

      html += '<div class="pv-panel"><div style="font-size:12px;font-weight:700;color:#cbd5e1;text-transform:uppercase;margin-bottom:10px">More to Play</div>';
      state.games.filter(function (x) { return x.id !== g.id; }).slice(0, 4).forEach(function (rel) {
        html += '<div data-select-game="' + escapeHtml(rel.id) + '" style="padding:10px;border:1px solid #1e293b;border-radius:8px;margin-bottom:8px;cursor:pointer;background:#020617"><div style="font-size:13px;font-weight:700;color:#fff">' + escapeHtml(rel.title) + '</div><div style="font-size:11px;color:#94a3b8">' + escapeHtml(rel.category) + ' · ★ ' + Number(rel.rating || 5).toFixed(1) + '</div></div>';
      });
      html += '</div></div></div>';
    } else {
      if (state.selectedCategory === 'All' && !state.searchQuery && spotlight) {
        html += '<div class="pv-hero"><div class="pv-hero-kicker">POPULAR UNBLOCKED SPOTLIGHT · ' + escapeHtml(spotlight.category) + '</div>';
        html += '<h1>' + escapeHtml(spotlight.title) + '</h1>';
        html += '<p>' + escapeHtml(spotlight.description) + '</p>';
        html += '<div style="display:flex;align-items:center;gap:16px"><button id="pv-spotlight-play" class="pv-btn pv-btn-primary" style="padding:10px 18px;font-size:14px">Play Instantly →</button>';
        html += '<span style="font-size:12px;color:#94a3b8">★ ' + Number(spotlight.rating || 5).toFixed(1) + ' · ' + Number(spotlight.playedCount || 0).toLocaleString() + ' plays</span></div></div>';
      }

      html += '<div class="pv-controls"><div class="pv-controls-row">';
      html += '<div class="pv-search"><input id="pv-search-input" type="text" value="' + escapeHtml(state.searchQuery) + '" placeholder="Search games, tags, or categories..."></div>';
      html += '<div class="pv-sort"><span>Sort:</span><select id="pv-sort-select"><option value="popular"' + (state.sortBy === 'popular' ? ' selected' : '') + '>Most Popular</option><option value="rating"' + (state.sortBy === 'rating' ? ' selected' : '') + '>Highest Rated</option><option value="alphabetical"' + (state.sortBy === 'alphabetical' ? ' selected' : '') + '>Title (A-Z)</option></select></div>';
      html += '</div><div class="pv-tabs">';
      CATEGORIES.forEach(function (cat) {
        var extra = (cat === 'Favorites' && state.favorites.length > 0) ? ' (' + state.favorites.length + ')' : '';
        html += '<button data-tab-cat="' + cat + '" class="pv-tab ' + (state.selectedCategory === cat ? 'active' : '') + '">' + cat + extra + '</button>';
      });
      html += '</div></div>';

      html += '<div class="pv-meta-bar"><span>Showing <strong style="color:#fff">' + filtered.length + '</strong> games</span><span>Press <kbd style="background:#0f172a;border:1px solid #334155;border-radius:4px;padding:1px 6px">Esc</kbd> anytime for Panic Cloak</span></div>';

      if (state.loading) {
        html += '<div style="padding:40px;text-align:center;color:#94a3b8">Loading games from games.json...</div>';
      } else if (filtered.length === 0) {
        html += '<div class="pv-panel" style="text-align:center;padding:48px"><h3 style="margin:0 0 8px;color:#fff">No Games Found</h3><p style="color:#94a3b8;font-size:13px">Try another filter or add a custom iframe game.</p></div>';
      } else {
        html += '<div class="pv-grid">';
        filtered.forEach(function (game) {
          var fav = state.favorites.indexOf(game.id) !== -1;
          var plays = game.playedCount >= 1000 ? (game.playedCount / 1000).toFixed(1) + 'k' : String(game.playedCount || 0);
          var accent = game.accentColor || '#34d399';
          html += '<div class="pv-card" data-open-game="' + escapeHtml(game.id) + '">';
          html += '<div class="pv-card-thumb" style="background:radial-gradient(circle at center,' + accent + '26 0%,#020617 75%)">';
          html += '<span class="pv-card-badge" style="color:' + accent + '">' + escapeHtml((game.title || '').slice(0, 2).toUpperCase()) + '</span>';
          html += '<button class="pv-fav-btn ' + (fav ? 'active' : '') + '" data-fav-id="' + escapeHtml(game.id) + '" title="Favorite">' + (fav ? '★' : '☆') + '</button>';
          html += '</div>';
          html += '<div class="pv-card-body">';
          html += '<div class="pv-card-meta"><span>' + escapeHtml(game.category) + '</span><span>·</span><span style="color:#fbbf24">★ ' + Number(game.rating || 5).toFixed(1) + '</span><span>·</span><span>' + plays + ' plays</span></div>';
          html += '<h3 class="pv-card-title">' + escapeHtml(game.title) + '</h3>';
          html += '<p class="pv-card-desc">' + escapeHtml(game.description) + '</p>';
          html += '<div class="pv-card-foot"><span>' + escapeHtml((game.controls || '').split('·')[0]) + '</span><span style="color:#34d399;font-weight:700">Play →</span></div>';
          html += '</div></div>';
        });
        html += '</div>';
      }
    }

    html += '</main>';
    html += '<footer class="pv-footer"><div class="pv-footer-inner"><span><strong style="color:#cbd5e1">PlayVault</strong> · Unblocked Games Portal · All games stored as iframes in JSON</span><div style="display:flex;gap:16px"><button id="pv-foot-json">Inspect games.json</button><button id="pv-foot-add">Add Game Iframe</button></div></div></footer>';

    if (state.isAddModalOpen) {
      html += '<div class="pv-modal-backdrop" id="pv-modal-bg"><div class="pv-modal" onclick="event.stopPropagation()">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h2 style="margin:0;color:#fff;font-size:18px">Add Custom Game</h2><button id="pv-close-add" class="pv-btn">✕</button></div>';
      html += '<form id="pv-add-form" style="display:flex;flex-direction:column;gap:12px">';
      html += '<input id="pv-add-title" class="pv-field" placeholder="Game Title *" required>';
      html += '<select id="pv-add-cat" class="pv-field"><option>Arcade</option><option>Retro</option><option>Puzzle</option><option>Action</option><option>Casual</option><option>Strategy</option></select>';
      html += '<input id="pv-add-controls" class="pv-field" placeholder="Controls hint">';
      html += '<textarea id="pv-add-iframe" class="pv-field" rows="3" placeholder="<iframe src=&quot;https://example.com/game.html&quot;></iframe>" required></textarea>';
      html += '<textarea id="pv-add-desc" class="pv-field" rows="2" placeholder="Description"></textarea>';
      html += '<div style="display:flex;justify-content:flex-end;gap:8px"><button type="button" id="pv-cancel-add" class="pv-btn">Cancel</button><button type="submit" class="pv-btn pv-btn-primary">Save Game to JSON</button></div>';
      html += '</form></div></div>';
    }

    if (state.isJsonModalOpen) {
      var jsonStr = JSON.stringify(state.games, null, 2);
      html += '<div class="pv-modal-backdrop" id="pv-modal-bg"><div class="pv-modal" onclick="event.stopPropagation()">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><h2 style="margin:0;color:#fff;font-size:18px">games.json (' + state.games.length + ' games)</h2><button id="pv-close-json" class="pv-btn">✕</button></div>';
      html += '<div style="display:flex;gap:8px;margin-bottom:12px"><button id="pv-copy-json" class="pv-btn">' + (state.copiedJson ? 'Copied!' : 'Copy JSON') + '</button><button id="pv-download-json" class="pv-btn pv-btn-primary">Download games.json</button></div>';
      html += '<pre class="pv-json">' + escapeHtml(jsonStr) + '</pre>';
      html += '</div></div>';
    }

    html += '</div>';
    root.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    var home = document.getElementById('pv-home');
    if (home) home.onclick = function () { state.selectedCategory = 'All'; state.selectedGame = null; render(); };

    document.querySelectorAll('[data-nav-cat],[data-tab-cat]').forEach(function (el) {
      el.onclick = function () {
        state.selectedCategory = el.getAttribute('data-nav-cat') || el.getAttribute('data-tab-cat');
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

    var addBtn = document.getElementById('pv-add-btn');
    if (addBtn) addBtn.onclick = function () { state.isAddModalOpen = true; render(); };
    var footAdd = document.getElementById('pv-foot-add');
    if (footAdd) footAdd.onclick = function () { state.isAddModalOpen = true; render(); };

    var jsonBtn = document.getElementById('pv-json-btn');
    if (jsonBtn) jsonBtn.onclick = function () { state.isJsonModalOpen = true; render(); };
    var footJson = document.getElementById('pv-foot-json');
    if (footJson) footJson.onclick = function () { state.isJsonModalOpen = true; render(); };

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

    var spotlightPlay = document.getElementById('pv-spotlight-play');
    if (spotlightPlay) spotlightPlay.onclick = function () {
      state.selectedGame = state.games.find(function (g) { return g.id === 'snake'; }) || state.games[0];
      render();
    };

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
        if (found) { state.selectedGame = found; render(); }
      };
    });

    var backBtn = document.getElementById('pv-back-btn');
    if (backBtn) backBtn.onclick = function () { state.selectedGame = null; render(); };

    var reloadBtn = document.getElementById('pv-reload-btn');
    if (reloadBtn) reloadBtn.onclick = function () {
      var frame = document.getElementById('pv-game-iframe');
      if (frame) frame.src = frame.src;
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

    var modalBg = document.getElementById('pv-modal-bg');
    if (modalBg) modalBg.onclick = function () { state.isAddModalOpen = false; state.isJsonModalOpen = false; render(); };
    var closeAdd = document.getElementById('pv-close-add');
    if (closeAdd) closeAdd.onclick = function () { state.isAddModalOpen = false; render(); };
    var cancelAdd = document.getElementById('pv-cancel-add');
    if (cancelAdd) cancelAdd.onclick = function () { state.isAddModalOpen = false; render(); };
    var closeJson = document.getElementById('pv-close-json');
    if (closeJson) closeJson.onclick = function () { state.isJsonModalOpen = false; render(); };

    var copyJson = document.getElementById('pv-copy-json');
    if (copyJson && navigator.clipboard) copyJson.onclick = function () {
      navigator.clipboard.writeText(JSON.stringify(state.games, null, 2)).then(function () {
        state.copiedJson = true; render();
        setTimeout(function () { state.copiedJson = false; render(); }, 1800);
      });
    };

    var dlJson = document.getElementById('pv-download-json');
    if (dlJson) dlJson.onclick = function () {
      var blob = new Blob([JSON.stringify(state.games, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'games.json'; a.click();
      URL.revokeObjectURL(url);
    };

    var addForm = document.getElementById('pv-add-form');
    if (addForm) addForm.onsubmit = function (e) {
      e.preventDefault();
      var title = document.getElementById('pv-add-title').value.trim();
      var cat = document.getElementById('pv-add-cat').value;
      var controls = document.getElementById('pv-add-controls').value.trim();
      var iframeVal = document.getElementById('pv-add-iframe').value.trim();
      var desc = document.getElementById('pv-add-desc').value.trim();
      if (!title || !iframeVal) return;
      var formattedIframe = iframeVal.indexOf('<iframe') === 0 ? iframeVal : '<iframe src="' + iframeVal + '" title="' + title + '" allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe>';
      var newGame = {
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('game-' + Date.now()),
        title: title,
        category: cat,
        description: desc || 'Custom user added web game embed.',
        controls: controls || 'Click or use standard keyboard controls',
        iframe: formattedIframe,
        rating: 5.0,
        playedCount: 1,
        tags: [cat, 'Custom'],
        accentColor: '#10b981',
        isCustom: true
      };
      state.games.unshift(newGame);
      var stored = [];
      try { stored = JSON.parse(localStorage.getItem('playvault_custom_games') || '[]'); } catch (err) {}
      stored.unshift(newGame);
      localStorage.setItem('playvault_custom_games', JSON.stringify(stored));
      state.isAddModalOpen = false;
      state.selectedGame = newGame;
      render();
    };
  }

  async function init() {
    injectStyles();
    try {
      state.favorites = JSON.parse(localStorage.getItem('playvault_favorites') || '[]');
    } catch (e) {}

    var storedCloak = localStorage.getItem('playvault_cloak');
    if (storedCloak) {
      var cloakOpt = CLOAK_OPTIONS.find(function (o) { return o.id === storedCloak; });
      if (cloakOpt) applyCloak(cloakOpt);
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === '`') {
        state.isPanicOpen = !state.isPanicOpen;
        render();
      }
    });

    render();

    try {
      var res = await fetch('./games.json');
      if (!res.ok) {
        res = await fetch('./public/games.json');
        if (res.ok) state.gamesBasePrefix = './public/';
      }
      var list = res.ok ? await res.json() : [];
      var custom = [];
      try { custom = JSON.parse(localStorage.getItem('playvault_custom_games') || '[]'); } catch (e) {}
      var ids = new Set(list.map(function (g) { return g.id; }));
      state.games = custom.filter(function (g) { return !ids.has(g.id); }).concat(list);

      var params = new URLSearchParams(window.location.search);
      var gameParam = params.get('game');
      if (gameParam) {
        var matched = state.games.find(function (g) { return g.id === gameParam; });
        if (matched) state.selectedGame = matched;
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
