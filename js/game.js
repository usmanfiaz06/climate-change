// ============================================================
// CLIMATE QUEST PAKISTAN — Game Engine v2
// Canvas particles, sound FX, XP/levels, combos, timer,
// mini-games, screen shake, confetti, achievement toasts
// ============================================================

(function () {
  'use strict';

  // ── DOM Helpers ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ═══════════════════════════════════════════════════════════
  // SOUND MANAGER (Web Audio API — no files needed)
  // ═══════════════════════════════════════════════════════════
  const Sound = {
    ctx: null,
    enabled: true,
    init() {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { this.enabled = false; }
    },
    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone(freq, dur, type = 'sine', vol = 0.15) {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    },
    click()       { this.tone(800, 0.06, 'sine', 0.08); },
    success()     { this.tone(523, 0.2); setTimeout(() => this.tone(659, 0.2), 100); setTimeout(() => this.tone(784, 0.3), 200); },
    fail()        { this.tone(392, 0.2); setTimeout(() => this.tone(330, 0.2), 100); setTimeout(() => this.tone(262, 0.4), 200); },
    levelUp()     { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.4, 'sine', 0.2), i * 120)); },
    tick()        { this.tone(1000, 0.03, 'square', 0.05); },
    combo(n)      { this.tone(800 + n * 200, 0.15, 'sine', 0.12); },
    achievement() { [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => this.tone(f, 0.35, 'sine', 0.15), i * 100)); },
    negative()    { this.tone(200, 0.3, 'sawtooth', 0.1); },
    quiz_right()  { this.tone(880, 0.15); setTimeout(() => this.tone(1100, 0.2), 80); },
    quiz_wrong()  { this.tone(300, 0.25, 'square', 0.1); }
  };

  // ═══════════════════════════════════════════════════════════
  // PARTICLE SYSTEM (Canvas)
  // ═══════════════════════════════════════════════════════════
  const Particles = {
    canvas: null,
    ctx: null,
    particles: [],
    confetti: [],
    type: null,
    running: false,

    init(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.loop();
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    setType(type) {
      this.type = type;
      this.particles = [];
      if (!type) return;
      const w = this.canvas.width, h = this.canvas.height;
      const count = type === 'storm' ? 250 : type === 'rain' ? 180 : type === 'snow' ? 80 : type === 'heat' ? 50 : type === 'dust' ? 70 : type === 'smog' ? 40 : 60;
      for (let i = 0; i < count; i++) this.particles.push(this.create(w, h));
    },

    create(w, h) {
      const r = Math.random;
      switch (this.type) {
        case 'rain': return { x: r() * w, y: r() * h, vx: -1.5, vy: 14 + r() * 8, len: 8 + r() * 12, alpha: 0.2 + r() * 0.3, color: `rgba(100,180,255,${0.2 + r() * 0.3})` };
        case 'storm': return { x: r() * w, y: r() * h, vx: -3 + r() * -2, vy: 18 + r() * 12, len: 12 + r() * 18, alpha: 0.25 + r() * 0.35, color: `rgba(150,200,255,${0.3 + r() * 0.35})` };
        case 'snow': return { x: r() * w, y: r() * h, vx: 0, vy: 0.4 + r() * 1.2, size: 1 + r() * 3, alpha: 0.4 + r() * 0.4, wobble: r() * Math.PI * 2, wobbleSpeed: 0.01 + r() * 0.02 };
        case 'heat': return { x: r() * w, y: h + r() * 50, vx: (r() - 0.5) * 0.5, vy: -(0.3 + r() * 0.8), size: 2 + r() * 4, alpha: 0.1 + r() * 0.2, color: `rgba(255,${120 + Math.floor(r() * 80)},0,${0.1 + r() * 0.15})` };
        case 'dust': return { x: r() * w, y: r() * h, vx: 1.5 + r() * 2, vy: (r() - 0.5) * 0.5, size: 1.5 + r() * 3, alpha: 0.15 + r() * 0.2, color: `rgba(210,180,140,${0.15 + r() * 0.2})` };
        case 'smog': return { x: r() * w, y: r() * h, vx: 0.2 + r() * 0.5, vy: (r() - 0.5) * 0.2, size: 20 + r() * 40, alpha: 0.03 + r() * 0.05, color: `rgba(120,100,140,${0.03 + r() * 0.05})` };
        default: return { x: r() * w, y: r() * h, vx: 0, vy: 1, size: 2, alpha: 0.3 };
      }
    },

    update() {
      const w = this.canvas.width, h = this.canvas.height;
      this.particles.forEach(p => {
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        if (p.wobble !== undefined) { p.wobble += p.wobbleSpeed; p.vx = Math.sin(p.wobble) * 0.5; }
        if (p.y > h + 20 || p.y < -20) { p.y = p.vy > 0 ? -15 : h + 15; p.x = Math.random() * w; }
        if (p.x > w + 20) p.x = -15;
        if (p.x < -20) p.x = w + 15;
      });
      this.confetti = this.confetti.filter(c => c.alpha > 0.01);
      this.confetti.forEach(c => { c.x += c.vx; c.y += c.vy; c.vy += 0.12; c.rotation += c.rotSpeed; c.alpha -= 0.006; });
    },

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles.forEach(p => {
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        if (this.type === 'rain' || this.type === 'storm') {
          this.ctx.strokeStyle = p.color;
          this.ctx.lineWidth = 1.2;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p.x + p.vx * 1.5, p.y + (p.len || 10));
          this.ctx.stroke();
        } else if (this.type === 'smog') {
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.fillStyle = p.color || 'rgba(255,255,255,0.5)';
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      });
      // Confetti
      this.confetti.forEach(c => {
        this.ctx.save();
        this.ctx.translate(c.x, c.y);
        this.ctx.rotate(c.rotation);
        this.ctx.globalAlpha = c.alpha;
        this.ctx.fillStyle = c.color;
        this.ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        this.ctx.restore();
      });
    },

    loop() {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    },

    triggerConfetti(x, y, count = 60) {
      const colors = ['#00d4ff', '#00ff88', '#fbbf24', '#a855f7', '#ff4466', '#ff9800', '#ffffff'];
      x = x || this.canvas.width / 2;
      y = y || this.canvas.height / 3;
      for (let i = 0; i < count; i++) {
        this.confetti.push({
          x, y,
          vx: (Math.random() - 0.5) * 16,
          vy: -4 - Math.random() * 10,
          w: 4 + Math.random() * 7,
          h: 3 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.3,
          alpha: 1
        });
      }
    }
  };

  // ═══════════════════════════════════════════════════════════
  // GAME STATE
  // ═══════════════════════════════════════════════════════════
  const state = {
    screen: 'welcome',
    playerName: '',
    difficulty: 'planner',
    resources: {},
    resilience: 0,
    maxResilience: 0,
    zonesCompleted: 0,
    completedZoneIds: [],
    currentZone: null,
    currentChoice: null,
    achievements: [],
    // XP & Leveling
    xp: 0,
    totalXP: 0,
    level: 1,
    xpToNext: 150,
    // Combo
    combo: 0,
    maxCombo: 0,
    // Timer
    timerSeconds: 30,
    timerInterval: null,
    timerRemaining: 0,
    // Mini-game
    miniGameScore: 0,
    miniGameIndex: 0,
    miniGameQuestions: [],
    miniGameTimer: null,
    // Tracking
    bestChoices: 0,
    waterNeverBelow80: true,
    neverBelow20: true,
    maxTrust: 0,
    maxBiodiversity: 0,
    recoveredFromCritical: false,
    hadCritical: false,
    choiceHistory: []
  };

  state.maxResilience = GAME_DATA.zones.reduce((sum, z) => sum + Math.max(...z.scenario.choices.map(c => c.resilience)), 0);

  // ═══════════════════════════════════════════════════════════
  // SCREEN MANAGEMENT
  // ═══════════════════════════════════════════════════════════
  function show(screenId) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const target = $(`#screen-${screenId}`);
    if (target) {
      target.classList.add('active');
      state.screen = screenId;
      window.scrollTo(0, 0);
    }
  }

  function showHUD(visible) {
    const hud = $('#hud');
    if (visible) hud.classList.remove('hidden');
    else hud.classList.add('hidden');
  }

  // ═══════════════════════════════════════════════════════════
  // HUD UPDATES
  // ═══════════════════════════════════════════════════════════
  function updateHUD() {
    $('#hud-level').textContent = state.level;
    const pct = Math.min(100, (state.xp / state.xpToNext) * 100);
    $('#hud-xp-fill').style.width = pct + '%';
    $('#hud-xp-text').textContent = `${state.xp} / ${state.xpToNext} XP`;
    $('#hud-resilience').textContent = state.resilience;

    // Mini resources in HUD
    const container = $('#hud-resources');
    container.innerHTML = '';
    const keys = ['budget', 'water', 'energy', 'trust', 'biodiversity'];
    keys.forEach(key => {
      if (state.resources[key] === undefined) return;
      const meta = GAME_DATA.resources[key];
      const val = Math.round(state.resources[key]);
      const div = document.createElement('div');
      div.className = `hud-res-item ${val < 20 ? 'critical' : ''}`;
      div.innerHTML = `<span>${meta.icon}</span><span class="val">${val}</span>`;
      container.appendChild(div);
    });

    // Combo
    const comboEl = $('#hud-combo');
    if (state.combo >= 2) {
      comboEl.classList.remove('hidden');
      $('#combo-text').textContent = `x${state.combo} COMBO`;
    } else {
      comboEl.classList.add('hidden');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // XP & LEVELING
  // ═══════════════════════════════════════════════════════════
  function addXP(amount, source) {
    const multiplier = state.combo >= 2 ? 1 + (state.combo - 1) * 0.25 : 1;
    const total = Math.round(amount * multiplier);
    state.xp += total;
    state.totalXP += total;

    // Float XP text
    floatText(`+${total} XP`, window.innerWidth / 2, window.innerHeight / 2 - 50, 'floating-xp');

    // Check level up
    while (state.xp >= state.xpToNext) {
      state.xp -= state.xpToNext;
      state.level++;
      state.xpToNext = Math.round(state.xpToNext * 1.3);
      triggerLevelUp();
    }

    updateHUD();
    return total;
  }

  function triggerLevelUp() {
    Sound.levelUp();
    Particles.triggerConfetti(undefined, undefined, 80);
    const overlay = $('#levelup-overlay');
    $('#levelup-number').textContent = state.level;
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('hidden'), 2500);
  }

  // ═══════════════════════════════════════════════════════════
  // COMBO SYSTEM
  // ═══════════════════════════════════════════════════════════
  function updateCombo(quality) {
    if (quality === 'best' || quality === 'good') {
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      if (state.combo >= 2) {
        Sound.combo(state.combo);
        floatText(`${'\u{1F525}'} x${state.combo} COMBO!`, window.innerWidth / 2, window.innerHeight / 2 - 100, 'floating-combo');
      }
    } else {
      state.combo = 0;
    }
    updateHUD();
  }

  // ═══════════════════════════════════════════════════════════
  // FLOATING TEXT
  // ═══════════════════════════════════════════════════════════
  function floatText(text, x, y, className) {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = 'translateX(-50%)';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN SHAKE
  // ═══════════════════════════════════════════════════════════
  function shakeScreen() {
    const wrapper = $('#shake-wrapper');
    wrapper.classList.remove('shaking');
    void wrapper.offsetWidth; // reflow
    wrapper.classList.add('shaking');
    setTimeout(() => wrapper.classList.remove('shaking'), 500);
  }

  // ═══════════════════════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════
  function showToast(icon, title, desc) {
    Sound.achievement();
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITY: Number Animation & Typewriter
  // ═══════════════════════════════════════════════════════════
  function animateNumber(el, from, to, duration = 800) {
    const start = performance.now();
    const diff = to - from;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + diff * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function typeWriter(el, text, speed = 18) {
    return new Promise(resolve => {
      el.textContent = '';
      let i = 0;
      function type() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else { resolve(); }
      }
      type();
    });
  }

  // ═══════════════════════════════════════════════════════════
  // RESOURCE RENDERING
  // ═══════════════════════════════════════════════════════════
  function renderResources(container) {
    if (!container) return;
    container.innerHTML = '';
    const keys = ['budget', 'water', 'energy', 'trust', 'biodiversity'];
    keys.forEach(key => {
      const meta = GAME_DATA.resources[key];
      const val = Math.max(0, Math.min(150, state.resources[key]));
      const pct = Math.min(100, (val / 150) * 100);
      const isLow = val < 25;
      const bar = document.createElement('div');
      bar.className = `resource-bar ${isLow ? 'critical' : ''}`;
      bar.innerHTML = `
        <div class="resource-label">
          <span class="resource-icon">${meta.icon}</span>
          <span class="resource-name">${meta.label}</span>
          <span class="resource-value" data-resource="${key}">${Math.round(val)}</span>
        </div>
        <div class="resource-track">
          <div class="resource-fill" style="width:${pct}%;background:${meta.color}"></div>
        </div>
      `;
      container.appendChild(bar);
    });
  }

  function updateResourceDisplay() {
    renderResources($('#resources-dashboard'));
    renderResources($('#scenario-resources'));
    renderResources($('#decision-resources'));
    renderResources($('#outcome-resources'));
    updateHUD();
  }

  function applyEffects(effects, severity = 1) {
    Object.keys(effects).forEach(key => {
      if (state.resources[key] !== undefined) {
        const delta = Math.round(effects[key] * severity);
        state.resources[key] = Math.max(0, Math.min(150, state.resources[key] + delta));
        if (state.resources[key] < 10) state.hadCritical = true;
        if (state.hadCritical && state.resources[key] > 40) state.recoveredFromCritical = true;
        if (state.resources[key] < 80 && key === 'water') state.waterNeverBelow80 = false;
        if (state.resources[key] < 20) state.neverBelow20 = false;
        if (key === 'trust') state.maxTrust = Math.max(state.maxTrust, state.resources[key]);
        if (key === 'biodiversity') state.maxBiodiversity = Math.max(state.maxBiodiversity, state.resources[key]);
      }
    });
    updateResourceDisplay();
  }

  // ═══════════════════════════════════════════════════════════
  // TIMER
  // ═══════════════════════════════════════════════════════════
  const TIMER_CIRCUMFERENCE = 2 * Math.PI * 54; // ~339.292

  function startTimer(seconds, onExpire) {
    clearTimer();
    state.timerRemaining = seconds;
    const circle = $('#timer-circle');
    const text = $('#timer-text');
    circle.style.strokeDashoffset = '0';
    circle.classList.remove('warning', 'danger');
    text.textContent = seconds;

    state.timerInterval = setInterval(() => {
      state.timerRemaining--;
      const remaining = state.timerRemaining;
      text.textContent = remaining;
      const offset = TIMER_CIRCUMFERENCE * (1 - remaining / seconds);
      circle.style.strokeDashoffset = offset;

      if (remaining <= 5) { circle.classList.add('danger'); circle.classList.remove('warning'); Sound.tick(); }
      else if (remaining <= 10) { circle.classList.add('warning'); circle.classList.remove('danger'); }

      if (remaining <= 0) {
        clearTimer();
        onExpire();
      }
    }, 1000);
  }

  function clearTimer() {
    if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN: WELCOME
  // ═══════════════════════════════════════════════════════════
  function initWelcome() {
    Particles.setType('rain');
    $('#btn-start').onclick = () => {
      Sound.click();
      showBriefing();
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN: BRIEFING
  // ═══════════════════════════════════════════════════════════
  function showBriefing() {
    show('briefing');
    Particles.setType(null);
    showHUD(false);

    $$('.diff-btn').forEach(btn => {
      btn.onclick = () => {
        Sound.click();
        $$('.diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.difficulty = btn.dataset.diff;
      };
    });

    // Reset default
    $$('.diff-btn').forEach(b => b.classList.remove('selected'));
    state.difficulty = 'planner';
    const defaultBtn = $(`.diff-btn[data-diff="planner"]`);
    if (defaultBtn) defaultBtn.classList.add('selected');

    $('#btn-begin').onclick = () => {
      Sound.click();
      const nameInput = $('#player-name');
      state.playerName = nameInput.value.trim() || 'Climate Planner';
      const diff = GAME_DATA.difficulty[state.difficulty];
      state.resources = { ...diff.startResources };
      state.maxTrust = state.resources.trust;
      state.maxBiodiversity = state.resources.biodiversity;
      showHUD(true);
      updateHUD();
      showDashboard();
    };
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN: DASHBOARD
  // ═══════════════════════════════════════════════════════════
  function showDashboard() {
    show('dashboard');
    Particles.setType(null);
    showHUD(true);

    $('#dashboard-name').textContent = state.playerName;
    $('#dashboard-resilience').textContent = state.resilience;
    $('#dashboard-level').textContent = state.level;
    $('#zones-done').textContent = state.zonesCompleted;
    $('#zone-progress-fill').style.width = ((state.zonesCompleted / 6) * 100) + '%';

    updateResourceDisplay();
    renderZoneCards();
  }

  function renderZoneCards() {
    const grid = $('#zone-grid');
    grid.innerHTML = '';
    GAME_DATA.zones.forEach((zone, idx) => {
      const completed = state.completedZoneIds.includes(zone.id);
      const card = document.createElement('div');
      card.className = `zone-card ${completed ? 'completed' : 'hoverable'}`;
      card.style.background = completed ? 'rgba(255,255,255,0.03)' : zone.gradient;
      card.style.animationDelay = `${idx * 0.08}s`;
      card.style.animation = 'cardEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
      card.innerHTML = `
        <div class="zone-icon">${zone.icon}</div>
        <h3 class="zone-name">${zone.name}</h3>
        <p class="zone-challenge">${zone.challenge}</p>
        ${completed
          ? '<div class="zone-check">\u2713 Completed</div>'
          : '<div class="zone-play">Enter Zone</div>'}
      `;
      if (!completed) {
        card.onclick = () => { Sound.click(); startZone(zone); };
      }
      grid.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN: SCENARIO
  // ═══════════════════════════════════════════════════════════
  function startZone(zone) {
    state.currentZone = zone;
    show('scenario');
    Particles.setType(zone.particleClass);

    $('#scenario-zone-icon').textContent = zone.icon;
    $('#scenario-zone-name').textContent = zone.name;
    $('#scenario-zone-challenge').textContent = zone.challenge;
    $('#scenario-title').textContent = zone.scenario.title;

    typeWriter($('#scenario-narrative'), zone.scenario.narrative, 16);
    updateResourceDisplay();

    $('#btn-face-challenge').onclick = () => { Sound.click(); showDecision(); };
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN: DECISION (with Timer)
  // ═══════════════════════════════════════════════════════════
  function showDecision() {
    show('decision');
    const zone = state.currentZone;
    Particles.setType(zone.particleClass);

    $('#decision-title').textContent = `${zone.icon} ${zone.name}: Choose Your Action`;
    updateResourceDisplay();

    const container = $('#choice-cards');
    container.innerHTML = '';

    zone.scenario.choices.forEach((choice, idx) => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      card.style.animationDelay = `${idx * 0.12}s`;

      const effectsHTML = Object.entries(choice.effects)
        .map(([key, val]) => {
          const meta = GAME_DATA.resources[key];
          const cls = val > 0 ? 'positive' : val < 0 ? 'negative' : 'neutral';
          const sign = val > 0 ? '+' : '';
          return `<span class="effect-tag ${cls}">${meta.icon} ${sign}${val}</span>`;
        }).join('');

      card.innerHTML = `
        <div class="choice-header"><h3>${choice.title}</h3></div>
        <p class="choice-desc">${choice.description}</p>
        <div class="choice-effects">${effectsHTML}</div>
        <button class="btn-choose">Choose This Action</button>
      `;

      card.querySelector('.btn-choose').onclick = (e) => {
        e.stopPropagation();
        Sound.click();
        confirmChoice(choice, idx);
      };
      container.appendChild(card);
    });

    // Start countdown timer
    const timerDuration = state.difficulty === 'explorer' ? 45 : state.difficulty === 'expert' ? 20 : 30;
    startTimer(timerDuration, () => {
      // Time ran out — auto-select worst option
      const worst = zone.scenario.choices.reduce((a, b) => a.resilience < b.resilience ? a : b);
      Sound.fail();
      shakeScreen();
      confirmChoice(worst, zone.scenario.choices.indexOf(worst));
    });
  }

  function confirmChoice(choice, idx) {
    clearTimer();
    state.currentChoice = choice;
    state.choiceHistory.push({ zone: state.currentZone.id, choice: choice.title, quality: choice.quality });
    if (choice.quality === 'best') state.bestChoices++;

    // Apply effects
    const severity = GAME_DATA.difficulty[state.difficulty].eventSeverity;
    const adjusted = {};
    Object.entries(choice.effects).forEach(([key, val]) => {
      adjusted[key] = val < 0 ? Math.round(val * severity) : val;
    });
    applyEffects(adjusted, 1);

    state.resilience += choice.resilience;
    state.zonesCompleted++;
    state.completedZoneIds.push(state.currentZone.id);

    // Update combo
    updateCombo(choice.quality);

    showOutcome();
  }

  // ═══════════════════════════════════════════════════════════
  // SCREEN: OUTCOME
  // ═══════════════════════════════════════════════════════════
  function showOutcome() {
    show('outcome');
    const choice = state.currentChoice;
    const zone = state.currentZone;
    Particles.setType(zone.particleClass);

    const qualityLabels = {
      best: { label: 'Excellent Choice!', cls: 'quality-best' },
      good: { label: 'Good Decision', cls: 'quality-good' },
      poor: { label: 'Risky Decision', cls: 'quality-poor' },
      terrible: { label: 'Dangerous Choice', cls: 'quality-terrible' }
    };
    const q = qualityLabels[choice.quality] || qualityLabels.good;

    $('#outcome-quality').textContent = q.label;
    $('#outcome-quality').className = `outcome-quality ${q.cls}`;
    $('#outcome-choice-name').textContent = choice.title;
    $('#outcome-text').textContent = choice.outcome;
    $('#outcome-resilience').textContent = `+${choice.resilience}`;
    $('#outcome-fact').textContent = choice.fact;
    $('#outcome-reflection').textContent = zone.scenario.reflection;

    // XP Calculation
    const baseXP = { best: 100, good: 70, poor: 30, terrible: 10 };
    const base = baseXP[choice.quality] || 50;
    const timeBonus = Math.round(state.timerRemaining * 2);
    const totalXP = addXP(base + timeBonus, 'choice');

    const comboMultiplier = state.combo >= 2 ? ` (x${state.combo} combo!)` : '';
    $('#outcome-xp').textContent = `+${totalXP} XP`;
    $('#outcome-xp-breakdown').textContent = `Base: ${base} + Time bonus: ${timeBonus}${comboMultiplier}`;

    // Effects based on quality
    if (choice.quality === 'best' || choice.quality === 'good') {
      Sound.success();
      Particles.triggerConfetti();
    } else if (choice.quality === 'terrible') {
      Sound.fail();
      shakeScreen();
    } else {
      Sound.negative();
    }

    updateResourceDisplay();
    animateNumber($('#outcome-total-resilience'), state.resilience - choice.resilience, state.resilience);

    $('#btn-continue').onclick = () => {
      Sound.click();
      if (state.zonesCompleted < 6) {
        // Check if mini-game should trigger (after zones 2 and 4)
        if (state.zonesCompleted === 2 || state.zonesCompleted === 4) {
          showMiniGame();
        } else {
          triggerRandomEvent();
        }
      } else {
        showFinalScore();
      }
    };
  }

  // ═══════════════════════════════════════════════════════════
  // MINI-GAME: Climate Quiz Blitz
  // ═══════════════════════════════════════════════════════════
  function showMiniGame() {
    show('minigame');
    Particles.setType(null);

    // Pick 5 random questions
    const allQs = [...GAME_DATA.quizQuestions];
    state.miniGameQuestions = [];
    for (let i = 0; i < 5 && allQs.length > 0; i++) {
      const idx = Math.floor(Math.random() * allQs.length);
      state.miniGameQuestions.push(allQs.splice(idx, 1)[0]);
    }
    state.miniGameIndex = 0;
    state.miniGameScore = 0;
    $('#minigame-score').textContent = '0';

    showQuizQuestion();
  }

  function showQuizQuestion() {
    const idx = state.miniGameIndex;
    const total = state.miniGameQuestions.length;

    if (idx >= total) {
      finishMiniGame();
      return;
    }

    const q = state.miniGameQuestions[idx];
    $('#minigame-question').textContent = q.q;
    $('#minigame-count').textContent = `${idx + 1} / ${total}`;
    $('#minigame-progress-fill').style.width = ((idx / total) * 100) + '%';

    // Reset buttons
    const btnTrue = $('#btn-true');
    const btnFalse = $('#btn-false');
    btnTrue.disabled = false;
    btnFalse.disabled = false;
    btnTrue.className = 'btn-quiz btn-true';
    btnFalse.className = 'btn-quiz btn-false';

    // Hide feedback
    $('#minigame-feedback').classList.add('hidden');

    // Timer bar (8 seconds per question)
    const timerBar = $('#minigame-timer-fill');
    timerBar.style.width = '100%';
    timerBar.classList.remove('danger');
    let timeLeft = 80; // 80 * 100ms = 8s

    if (state.miniGameTimer) clearInterval(state.miniGameTimer);
    state.miniGameTimer = setInterval(() => {
      timeLeft--;
      timerBar.style.width = (timeLeft / 80 * 100) + '%';
      if (timeLeft <= 20) timerBar.classList.add('danger');
      if (timeLeft <= 0) {
        clearInterval(state.miniGameTimer);
        handleQuizAnswer(null, q); // Timeout
      }
    }, 100);

    function answerHandler(answer) {
      clearInterval(state.miniGameTimer);
      handleQuizAnswer(answer, q);
    }

    btnTrue.onclick = () => answerHandler(true);
    btnFalse.onclick = () => answerHandler(false);
  }

  function handleQuizAnswer(answer, question) {
    const correct = answer === question.a;
    const btnTrue = $('#btn-true');
    const btnFalse = $('#btn-false');
    btnTrue.disabled = true;
    btnFalse.disabled = true;

    // Highlight correct/wrong
    if (answer === true) btnTrue.classList.add(correct ? 'correct' : 'wrong');
    if (answer === false) btnFalse.classList.add(correct ? 'correct' : 'wrong');
    if (answer === null) { btnTrue.classList.add('wrong'); btnFalse.classList.add('wrong'); }

    // Show which was actually correct
    if (!correct) {
      if (question.a === true) btnTrue.classList.add('correct');
      else btnFalse.classList.add('correct');
    }

    // Feedback
    const feedback = $('#minigame-feedback');
    feedback.classList.remove('hidden', 'correct-feedback', 'wrong-feedback');
    if (correct) {
      feedback.classList.add('correct-feedback');
      $('#feedback-icon').textContent = '\u{2705}';
      $('#feedback-text').textContent = 'Correct!';
      state.miniGameScore += 20;
      Sound.quiz_right();
    } else {
      feedback.classList.add('wrong-feedback');
      $('#feedback-icon').textContent = answer === null ? '\u{23F0}' : '\u{274C}';
      $('#feedback-text').textContent = answer === null ? "Time's up!" : 'Wrong!';
      Sound.quiz_wrong();
      shakeScreen();
    }
    $('#feedback-fact').textContent = question.fact;
    $('#minigame-score').textContent = state.miniGameScore;

    // Next question after delay
    state.miniGameIndex++;
    setTimeout(() => showQuizQuestion(), 2000);
  }

  function finishMiniGame() {
    if (state.miniGameTimer) clearInterval(state.miniGameTimer);

    // Award XP and resources based on score
    const score = state.miniGameScore;
    const xpGain = score * 2;
    addXP(xpGain, 'minigame');

    // Bonus resources
    if (score >= 80) {
      applyEffects({ budget: 10, trust: 10 }, 1);
      showToast('\u{1F3AE}', 'Quiz Master!', `Scored ${score} — bonus resources earned!`);
    } else if (score >= 40) {
      applyEffects({ budget: 5, trust: 5 }, 1);
      showToast('\u{1F3AE}', 'Good Knowledge!', `Scored ${score} — small bonus earned`);
    } else {
      showToast('\u{1F3AE}', 'Quiz Complete', `Scored ${score} — keep learning!`);
    }

    Particles.triggerConfetti();
    setTimeout(() => triggerRandomEvent(), 1500);
  }

  // ═══════════════════════════════════════════════════════════
  // RANDOM EVENTS
  // ═══════════════════════════════════════════════════════════
  function triggerRandomEvent() {
    // 70% chance of event
    if (Math.random() > 0.7 && state.zonesCompleted < 5) {
      showDashboard();
      return;
    }

    const events = GAME_DATA.events;
    const event = events[Math.floor(Math.random() * events.length)];

    show('event');
    Particles.setType(event.type === 'positive' ? null : 'dust');

    $('#event-icon').textContent = event.icon;
    $('#event-title').textContent = event.title;
    $('#event-description').textContent = event.description;
    $('#event-type').textContent = event.type === 'positive' ? 'Good News!' : 'Bad News!';
    $('#event-type').className = `event-type ${event.type}`;

    // Effects display
    const container = $('#event-effects');
    container.innerHTML = '';
    Object.entries(event.effects).forEach(([key, val]) => {
      const meta = GAME_DATA.resources[key];
      const cls = val > 0 ? 'positive' : 'negative';
      const sign = val > 0 ? '+' : '';
      const tag = document.createElement('span');
      tag.className = `effect-tag ${cls}`;
      tag.textContent = `${meta.icon} ${meta.label} ${sign}${val}`;
      container.appendChild(tag);
    });

    // Apply with severity
    const severity = GAME_DATA.difficulty[state.difficulty].eventSeverity;
    const adjusted = {};
    Object.entries(event.effects).forEach(([key, val]) => {
      adjusted[key] = val < 0 ? Math.round(val * severity) : val;
    });
    applyEffects(adjusted, 1);

    // Sound + effects
    if (event.type === 'positive') {
      Sound.success();
      Particles.triggerConfetti(undefined, undefined, 30);
    } else {
      Sound.negative();
      shakeScreen();
    }

    updateResourceDisplay();
    $('#btn-event-continue').onclick = () => { Sound.click(); showDashboard(); };
  }

  // ═══════════════════════════════════════════════════════════
  // FINAL SCORE
  // ═══════════════════════════════════════════════════════════
  function showFinalScore() {
    show('final');
    showHUD(false);
    Particles.setType(null);

    const resPercent = Math.round((state.resilience / state.maxResilience) * 100);
    const resKeys = ['budget', 'water', 'energy', 'trust', 'biodiversity'];
    const avgResource = resKeys.reduce((s, k) => s + state.resources[k], 0) / resKeys.length;
    const resourceBonus = Math.round((avgResource / 100) * 20);
    const finalScore = Math.max(0, Math.min(100, resPercent + resourceBonus));
    const gradeData = GAME_DATA.grades.find(g => finalScore >= g.min) || GAME_DATA.grades[GAME_DATA.grades.length - 1];

    $('#final-name').textContent = state.playerName;
    animateNumber($('#final-score'), 0, finalScore, 2000);

    // Animate score ring
    setTimeout(() => {
      const ring = $('#score-ring-fill');
      const offset = 565.48 * (1 - finalScore / 100);
      ring.style.strokeDashoffset = offset;
    }, 100);

    $('#final-grade').textContent = gradeData.grade;
    $('#final-title').textContent = gradeData.title;
    $('#final-message').textContent = gradeData.message;

    // Stats
    $('#final-level').textContent = state.level;
    $('#final-xp').textContent = state.totalXP;
    $('#final-max-combo').textContent = state.maxCombo;

    // Breakdown
    $('#final-resilience').textContent = `${state.resilience} / ${state.maxResilience}`;
    $('#final-resource-bonus').textContent = `+${resourceBonus}`;

    // Resources
    const resSummary = $('#final-resources');
    resSummary.innerHTML = '';
    resKeys.forEach(key => {
      const meta = GAME_DATA.resources[key];
      const val = Math.round(state.resources[key]);
      const item = document.createElement('div');
      item.className = 'final-resource-item';
      item.innerHTML = `<span>${meta.icon} ${meta.label}</span><span class="final-res-val">${val}</span>`;
      resSummary.appendChild(item);
    });

    // Achievements
    checkAchievements();
    const achContainer = $('#final-achievements');
    achContainer.innerHTML = '';
    if (state.achievements.length === 0) {
      achContainer.innerHTML = '<p class="no-achievements">No achievements unlocked this time. Try again!</p>';
    } else {
      state.achievements.forEach(ach => {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        badge.innerHTML = `<span class="ach-icon">${ach.icon}</span><div><strong>${ach.title}</strong><p>${ach.description}</p></div>`;
        achContainer.appendChild(badge);
      });
    }

    // History
    const histContainer = $('#final-history');
    histContainer.innerHTML = '';
    state.choiceHistory.forEach(ch => {
      const zone = GAME_DATA.zones.find(z => z.id === ch.zone);
      const qualCls = { best: 'quality-best', good: 'quality-good', poor: 'quality-poor', terrible: 'quality-terrible' };
      const item = document.createElement('div');
      item.className = `history-item ${qualCls[ch.quality] || ''}`;
      item.innerHTML = `<span>${zone.icon} ${zone.name}</span><span>${ch.choice}</span>`;
      histContainer.appendChild(item);
    });

    // Confetti burst for celebration
    if (finalScore >= 70) {
      Sound.levelUp();
      Particles.triggerConfetti(undefined, undefined, 100);
      setTimeout(() => Particles.triggerConfetti(window.innerWidth * 0.3, window.innerHeight * 0.3, 50), 500);
      setTimeout(() => Particles.triggerConfetti(window.innerWidth * 0.7, window.innerHeight * 0.3, 50), 1000);
    } else {
      Sound.fail();
    }

    // Replay
    $('#btn-replay').onclick = () => { Sound.click(); resetGame(); };
  }

  function checkAchievements() {
    state.achievements = [];
    GAME_DATA.achievements.forEach(ach => {
      if (ach.condition(state)) state.achievements.push(ach);
    });

    // Show toasts for achievements (delayed)
    state.achievements.forEach((ach, i) => {
      setTimeout(() => showToast(ach.icon, ach.title, ach.description), 2000 + i * 600);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════════════════════════
  function resetGame() {
    state.playerName = '';
    state.difficulty = 'planner';
    state.resources = {};
    state.resilience = 0;
    state.zonesCompleted = 0;
    state.completedZoneIds = [];
    state.currentZone = null;
    state.currentChoice = null;
    state.achievements = [];
    state.xp = 0;
    state.totalXP = 0;
    state.level = 1;
    state.xpToNext = 150;
    state.combo = 0;
    state.maxCombo = 0;
    state.timerRemaining = 0;
    state.bestChoices = 0;
    state.waterNeverBelow80 = true;
    state.neverBelow20 = true;
    state.maxTrust = 0;
    state.maxBiodiversity = 0;
    state.recoveredFromCritical = false;
    state.hadCritical = false;
    state.choiceHistory = [];
    state.miniGameScore = 0;
    clearTimer();
    show('welcome');
    showHUD(false);
    Particles.setType('rain');
  }

  // ═══════════════════════════════════════════════════════════
  // INITIALIZE
  // ═══════════════════════════════════════════════════════════
  function init() {
    Sound.init();
    Particles.init($('#game-canvas'));

    // Unlock audio on first user interaction
    document.addEventListener('click', () => Sound.resume(), { once: true });

    show('welcome');
    showHUD(false);
    initWelcome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
