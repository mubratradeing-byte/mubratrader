/* ═══════════════════════════════════════════════════════════════════════════
   MUBRA FX — script.js
   ES6+ | Firebase Auth | Calculators | Resources | Promos | Hero Chart
═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── DATA ─────────────────────────────────────────────────────────────────── */

const INDICATORS = [
  { name: 'Smart Money Concepts Pro', category: 'SMC', type: 'TradingView Pine', file: 'indicators/smc-pro.pine', icon: '📊' },
  { name: 'ICT Order Blocks v2',      category: 'ICT', type: 'TradingView Pine', file: 'indicators/ict-ob-v2.pine', icon: '📦' },
  { name: 'Liquidity Sweep Detector', category: 'Liquidity', type: 'MT4 / MT5', file: 'indicators/liquidity-sweep.ex4', icon: '💧' },
  { name: 'Multi-TF RSI Dashboard',   category: 'Momentum', type: 'TradingView Pine', file: 'indicators/multi-rsi.pine', icon: '📈' },
  { name: 'VWAP + VWAP Bands',        category: 'Volume',    type: 'TradingView Pine', file: 'indicators/vwap-bands.pine', icon: '🎯' },
  { name: 'Fair Value Gap Scanner',   category: 'SMC',       type: 'TradingView Pine', file: 'indicators/fvg-scanner.pine', icon: '🔍' },
  { name: 'Breaker Block Finder',     category: 'ICT',       type: 'TradingView Pine', file: 'indicators/breaker-block.pine', icon: '🔲' },
  { name: 'Session High/Low Marker',  category: 'Sessions',  type: 'TradingView Pine', file: 'indicators/sessions-hl.pine', icon: '🕐' },
];

const PDF_BOOKS = [
  { name: 'Trading in the Zone',        author: 'Mark Douglas',      pages: 240, file: 'pdf/trading-in-the-zone.pdf',       icon: '📗' },
  { name: 'The Disciplined Trader',     author: 'Mark Douglas',      pages: 264, file: 'pdf/disciplined-trader.pdf',        icon: '📘' },
  { name: 'Market Wizards',             author: 'Jack D. Schwager',  pages: 469, file: 'pdf/market-wizards.pdf',            icon: '📕' },
  { name: 'ICT Mentorship Notes',       author: 'Inner Circle Trader', pages: 180, file: 'pdf/ict-mentorship-notes.pdf',   icon: '📙' },
  { name: 'Technical Analysis of Fin. Markets', author: 'John J. Murphy', pages: 542, file: 'pdf/ta-fin-markets.pdf',      icon: '📒' },
  { name: 'The Art & Science of TA',    author: 'Adam Grimes',       pages: 350, file: 'pdf/art-science-ta.pdf',           icon: '📓' },
];

const PROP_FIRMS = [
  {
    name: 'The 5%ers',
    tagline: 'Instant funding up to $4M',
    logo: '5%',
    tags: ['Instant Funding', 'Scaling', 'Forex'],
    code: 'MUBRAFX10',
    discount: '10% Off Fees',
    url: 'https://the5ers.com',
  },
  {
    name: 'Alpha Capital',
    tagline: 'Performance-based scaling',
    logo: 'ACG',
    tags: ['Low Drawdown', 'Scaling Plan', 'Crypto'],
    code: 'MUBRA15',
    discount: '15% Off',
    url: 'https://alphacapitalgroup.uk',
  },
  {
    name: 'FTMO',
    tagline: '#1 Prop Firm globally',
    logo: 'FTMO',
    tags: ['2-Phase', 'Free Retry', 'Global'],
    code: 'MUBRAFXFTMO',
    discount: 'Bonus Reward',
    url: 'https://ftmo.com',
  },
];

const EXCHANGES = [
  {
    name: 'Binance',
    tagline: 'World\'s largest crypto exchange',
    logo: 'BNB',
    tags: ['Spot', 'Futures', '0% Maker'],
    code: 'MUBRABINANCE',
    discount: '10% Fee Rebate',
    url: 'https://binance.com',
  },
  {
    name: 'MEXC Global',
    tagline: '0% Maker Fee Futures',
    logo: 'MEXC',
    tags: ['0% Maker', 'Low Fees', 'Altcoins'],
    code: 'MUBRAMEXC',
    discount: '10% Off Fees',
    url: 'https://mexc.com',
  },
];

/* ── AUTH ─────────────────────────────────────────────────────────────────── */

function waitForFirebase(callback, retries = 50) {
  if (window._onAuthStateChanged) {
    callback();
  } else if (retries > 0) {
    setTimeout(() => waitForFirebase(callback, retries - 1), 100);
  } else {
    console.error('Firebase failed to initialize. Check your config in index.html.');
    showAuthError('Firebase not initialized. Check console.');
  }
}

function initAuth() {
  window._onAuthStateChanged((user) => {
    if (user) {
      showDashboard(user);
    } else {
      showAuthScreen();
    }
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
      document.getElementById(`tab-${tab}`).classList.remove('hidden');
      clearAuthError();
    });
  });

  // Login
  document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const pw    = document.getElementById('login-password').value;
    if (!email || !pw) return showAuthError('Please fill in all fields.');
    setAuthLoading(true);
    try {
      await window._signIn(email, pw);
    } catch (err) {
      showAuthError(mapFirebaseError(err.code));
    } finally {
      setAuthLoading(false);
    }
  });

  // Register
  document.getElementById('btn-register').addEventListener('click', async () => {
    const email = document.getElementById('reg-email').value.trim();
    const pw    = document.getElementById('reg-password').value;
    if (!email || !pw) return showAuthError('Please fill in all fields.');
    if (pw.length < 6) return showAuthError('Password must be at least 6 characters.');
    setAuthLoading(true);
    try {
      await window._signUp(email, pw);
    } catch (err) {
      showAuthError(mapFirebaseError(err.code));
    } finally {
      setAuthLoading(false);
    }
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await window._signOut();
  });

  // Enter key support
  ['login-email','login-password','reg-email','reg-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const isLogin = id.startsWith('login');
        document.getElementById(isLogin ? 'btn-login' : 'btn-register').click();
      }
    });
  });
}

function showDashboard(user) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  const emailEl = document.getElementById('user-email-display');
  if (emailEl) emailEl.textContent = user.email;
  initDashboard();
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  el.textContent = '';
  el.classList.add('hidden');
}

function setAuthLoading(loading) {
  ['btn-login', 'btn-register'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      const span = btn.querySelector('.btn-text');
      if (span) span.textContent = loading ? 'LOADING...' : btn.id === 'btn-login' ? 'ENTER HUB' : 'CREATE ACCOUNT';
      btn.disabled = loading;
    }
  });
}

function mapFirebaseError(code) {
  const map = {
    'auth/invalid-email':         'Invalid email address.',
    'auth/user-not-found':        'No account with that email.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/email-already-in-use':  'Email already registered. Try logging in.',
    'auth/weak-password':         'Password too weak (min 6 chars).',
    'auth/too-many-requests':     'Too many attempts. Try again later.',
    'auth/network-request-failed':'Network error. Check your connection.',
    'auth/invalid-credential':    'Invalid email or password.',
  };
  return map[code] || `Error: ${code}`;
}

/* ── DASHBOARD INIT ───────────────────────────────────────────────────────── */

function initDashboard() {
  renderIndicators();
  renderPDFs();
  renderPromos();
  initCounters();
  initHeroChart();
  initHamburger();
}

/* ── CALCULATORS ──────────────────────────────────────────────────────────── */

window.calcCrypto = function () {
  const balance = parseFloat(document.getElementById('crypto-balance').value);
  const risk    = parseFloat(document.getElementById('crypto-risk').value);
  const entry   = parseFloat(document.getElementById('crypto-entry').value);
  const sl      = parseFloat(document.getElementById('crypto-sl').value);

  if ([balance, risk, entry, sl].some(isNaN)) return showCalcError('crypto', 'Please fill all fields.');
  if (entry === sl) return showCalcError('crypto', 'Entry and SL cannot be equal.');

  const riskPct    = (risk / balance) * 100;
  const slDistance = Math.abs(entry - sl) / entry; // as decimal
  const posSize    = risk / slDistance;             // USDT position size
  const leverage   = Math.ceil(posSize / balance);  // minimum leverage needed

  document.getElementById('crypto-pos-size').textContent = `$${posSize.toFixed(2)} USDT`;
  document.getElementById('crypto-leverage').textContent = `${Math.max(1, leverage)}x`;
  document.getElementById('crypto-risk-pct').textContent = `${riskPct.toFixed(2)}%`;
  document.getElementById('crypto-result').classList.remove('hidden');
};

window.calcForex = function () {
  const balance  = parseFloat(document.getElementById('forex-balance').value);
  const risk     = parseFloat(document.getElementById('forex-risk').value);
  const slPips   = parseFloat(document.getElementById('forex-sl-pips').value);
  const pair     = document.getElementById('forex-pair').value;

  if ([balance, risk, slPips].some(isNaN) || slPips <= 0)
    return showCalcError('forex', 'Please fill all fields with valid values.');

  // Pip value per standard lot: USD pairs ≈ $10/pip, EUR pairs ≈ $10/pip (approx), JPY = $8/pip (approx)
  const pipValuePerStdLot = pair === 'jpy' ? 8.7 : 10;
  const stdLots  = risk / (slPips * pipValuePerStdLot);
  const miniLots = stdLots * 10;
  const microLots = stdLots * 100;

  document.getElementById('forex-std').textContent   = stdLots.toFixed(4);
  document.getElementById('forex-mini').textContent  = miniLots.toFixed(3);
  document.getElementById('forex-micro').textContent = microLots.toFixed(2);
  document.getElementById('forex-result').classList.remove('hidden');
};

window.calcRR = function () {
  const entry = parseFloat(document.getElementById('rr-entry').value);
  const sl    = parseFloat(document.getElementById('rr-sl').value);
  const tp    = parseFloat(document.getElementById('rr-tp').value);
  const dir   = document.getElementById('rr-dir').value;

  if ([entry, sl, tp].some(isNaN)) return showCalcError('rr', 'Please fill all fields.');

  let risk, reward, pips;
  if (dir === 'long') {
    risk   = entry - sl;
    reward = tp - entry;
  } else {
    risk   = sl - entry;
    reward = entry - tp;
  }

  if (risk <= 0)   return showCalcError('rr', 'Invalid SL direction for ' + dir.toUpperCase() + ' trade.');
  if (reward <= 0) return showCalcError('rr', 'Invalid TP direction for ' + dir.toUpperCase() + ' trade.');

  const ratio = reward / risk;
  pips = (risk * 10000).toFixed(1); // approximate pips for most pairs

  let grade, gradeColor;
  if (ratio >= 3)       { grade = '🔥 EXCELLENT';  gradeColor = '#39FF14'; }
  else if (ratio >= 2)  { grade = '✅ GOOD';        gradeColor = '#39FF14'; }
  else if (ratio >= 1.5){ grade = '⚡ DECENT';      gradeColor = '#ffaa00'; }
  else if (ratio >= 1)  { grade = '⚠️ MARGINAL';    gradeColor = '#ffaa00'; }
  else                  { grade = '❌ POOR';         gradeColor = '#ff4444'; }

  const rrEl = document.getElementById('rr-ratio');
  rrEl.textContent = `1 : ${ratio.toFixed(2)}`;
  rrEl.style.color = gradeColor;

  const gradeEl = document.getElementById('rr-grade');
  gradeEl.textContent = grade;
  gradeEl.style.color = gradeColor;

  document.getElementById('rr-pips').textContent = `SL: ${pips} pips`;
  document.getElementById('rr-result').classList.remove('hidden');
};

function showCalcError(type, msg) {
  const resultId = `${type}-result`;
  const resultEl = document.getElementById(resultId);
  if (resultEl) {
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `<p style="color:var(--danger);font-size:0.85rem;font-family:var(--font-mono);">⚠ ${msg}</p>`;
  }
}

/* ── RENDER INDICATORS ────────────────────────────────────────────────────── */

function renderIndicators() {
  const grid = document.getElementById('indicator-grid');
  if (!grid) return;
  grid.innerHTML = INDICATORS.map(ind => `
    <div class="resource-card">
      <div class="resource-icon">${ind.icon}</div>
      <div class="resource-name">${ind.name}</div>
      <div class="resource-meta">${ind.type} · ${ind.category}</div>
      <a href="${ind.file}" download class="btn-download">
        ↓ FREE DOWNLOAD
      </a>
    </div>
  `).join('');
}

/* ── RENDER PDFs ──────────────────────────────────────────────────────────── */

function renderPDFs() {
  const grid = document.getElementById('pdf-grid');
  if (!grid) return;
  grid.innerHTML = PDF_BOOKS.map(book => `
    <div class="resource-card">
      <div class="resource-icon">${book.icon}</div>
      <div class="resource-name">${book.name}</div>
      <div class="resource-meta">${book.author} · ${book.pages} pages</div>
      <a href="${book.file}" download class="btn-download">
        ↓ DOWNLOAD PDF
      </a>
    </div>
  `).join('');
}

/* ── RENDER PROMOS ────────────────────────────────────────────────────────── */

function renderPromos() {
  renderPromoGrid('prop-grid', PROP_FIRMS);
  renderPromoGrid('exchange-grid', EXCHANGES);
}

function renderPromoGrid(gridId, data) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = data.map((item, idx) => `
    <div class="promo-card">
      <div class="promo-header">
        <div class="promo-logo">${item.logo}</div>
        <div>
          <div class="promo-name">${item.name}</div>
          <div class="promo-tagline">${item.tagline}</div>
        </div>
      </div>
      <div class="promo-tags">
        ${item.tags.map(t => `<span class="promo-tag">${t}</span>`).join('')}
      </div>
      <div class="promo-code-row">
        <span class="code-label">CODE:</span>
        <span class="code-value" id="code-${gridId}-${idx}">${item.code}</span>
        <button class="btn-copy" id="copy-${gridId}-${idx}" onclick="copyCode('${item.code}','${gridId}',${idx})">COPY</button>
      </div>
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn-visit">
        VISIT — ${item.discount} →
      </a>
    </div>
  `).join('');
}

window.copyCode = function (code, gridId, idx) {
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById(`copy-${gridId}-${idx}`);
    if (btn) {
      btn.textContent = 'COPIED!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'COPY';
        btn.classList.remove('copied');
      }, 2000);
    }
    showToast(`Code "${code}" copied!`);
  }).catch(() => {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = code;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(`Code "${code}" copied!`);
  });
};

/* ── TOAST ────────────────────────────────────────────────────────────────── */

function showToast(msg) {
  let toast = document.getElementById('mfx-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mfx-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ── COUNTER ANIMATION ────────────────────────────────────────────────────── */

function initCounters() {
  const counters = document.querySelectorAll('.stat-val[data-count]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 30);
  });
}

/* ── HERO CHART ───────────────────────────────────────────────────────────── */

function initHeroChart() {
  const canvas = document.getElementById('hero-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Generate synthetic price data
  const points = [];
  let price = 100;
  for (let i = 0; i < 80; i++) {
    price += (Math.random() - 0.45) * 4;
    price = Math.max(60, Math.min(160, price));
    points.push(price);
  }

  function drawChart() {
    ctx.clearRect(0, 0, W, H);

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const pad = { top: 20, bottom: 20, left: 10, right: 10 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    const toX = (i) => pad.left + (i / (points.length - 1)) * cw;
    const toY = (v) => pad.top + ch - ((v - min) / range) * ch;

    // Grid lines
    ctx.strokeStyle = 'rgba(57,255,20,0.06)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= 4; r++) {
      const y = pad.top + (r / 4) * ch;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, 'rgba(57,255,20,0.25)');
    grad.addColorStop(1, 'rgba(57,255,20,0)');

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(points[0]));
    for (let i = 1; i < points.length; i++) {
      const x0 = toX(i - 1), y0 = toY(points[i - 1]);
      const x1 = toX(i),     y1 = toY(points[i]);
      const cpx = (x0 + x1) / 2;
      ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
    }
    ctx.lineTo(toX(points.length - 1), H - pad.bottom);
    ctx.lineTo(toX(0), H - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(points[0]));
    for (let i = 1; i < points.length; i++) {
      const x0 = toX(i - 1), y0 = toY(points[i - 1]);
      const x1 = toX(i),     y1 = toY(points[i]);
      const cpx = (x0 + x1) / 2;
      ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
    }
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#39FF14';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Last point dot
    const lastX = toX(points.length - 1);
    const lastY = toY(points[points.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#39FF14';
    ctx.shadowColor = '#39FF14';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawChart();

  // Animate: push new point every 800ms
  setInterval(() => {
    const last = points[points.length - 1];
    const next = Math.max(60, Math.min(160, last + (Math.random() - 0.45) * 4));
    points.push(next);
    if (points.length > 80) points.shift();
    drawChart();
  }, 800);
}

/* ── HAMBURGER MENU ───────────────────────────────────────────────────────── */

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    nav.classList.toggle('hidden');
    nav.classList.toggle('active');
  });
}

window.closeMobileNav = function () {
  const nav = document.getElementById('mobile-nav');
  if (nav) { nav.classList.add('hidden'); nav.classList.remove('active'); }
};

/* ── SMOOTH SCROLL ────────────────────────────────────────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── ENTRY POINT ──────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  waitForFirebase(initAuth);
});
