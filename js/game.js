// ============================================================
// CLIMATE QUEST PAKISTAN — Game Engine
// State management, game logic, UI rendering, animations
// ============================================================

(function () {
  'use strict';

  // ── Game State ──────────────────────────────────────────────
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
    eventQueue: [],
    achievements: [],
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

  // Calculate max possible resilience
  state.maxResilience = GAME_DATA.zones.reduce((sum, z) => {
    const best = Math.max(...z.scenario.choices.map(c => c.resilience));
    return sum + best;
  }, 0);

  // ── DOM Helpers ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function show(screenId) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const target = $(`#screen-${screenId}`);
    if (target) {
      target.classList.add('active');
      state.screen = screenId;
    }
  }

  function animateNumber(el, from, to, duration = 800) {
    const start = performance.now();
    const diff = to - from;
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(from + diff * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function typeWriter(el, text, speed = 25) {
    return new Promise(resolve => {
      el.textContent = '';
      let i = 0;
      function type() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      }
      type();
    });
  }

  // ── Resource Rendering ─────────────────────────────────────
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
  }

  function applyEffects(effects, severity = 1) {
    const keys = Object.keys(effects);
    keys.forEach(key => {
      if (state.resources[key] !== undefined) {
        const delta = Math.round(effects[key] * severity);
        state.resources[key] = Math.max(0, Math.min(150, state.resources[key] + delta));
        // Track stats
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

  // ── Particle Effects ───────────────────────────────────────
  function setParticles(type) {
    const container = $('#particles');
    if (!container) return;
    container.className = 'particles';
    if (type) container.classList.add(type);
  }

  // ── Screen: Welcome ────────────────────────────────────────
  function initWelcome() {
    setParticles('rain');
    const btn = $('#btn-start');
    if (btn) btn.onclick = () => showBriefing();
  }

  // ── Screen: Briefing ──────────────────────────────────────
  function showBriefing() {
    show('briefing');
    setParticles('');

    // Difficulty buttons
    $$('.diff-btn').forEach(btn => {
      btn.onclick = () => {
        $$('.diff-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.difficulty = btn.dataset.diff;
      };
    });

    // Select default (clear previous selection first for replay)
    $$('.diff-btn').forEach(b => b.classList.remove('selected'));
    state.difficulty = 'planner';
    const defaultBtn = $(`.diff-btn[data-diff="planner"]`);
    if (defaultBtn) defaultBtn.classList.add('selected');

    // Begin button
    $('#btn-begin').onclick = () => {
      const nameInput = $('#player-name');
      state.playerName = nameInput.value.trim() || 'Climate Planner';
      const diffSettings = GAME_DATA.difficulty[state.difficulty];
      state.resources = { ...diffSettings.startResources };
      state.maxTrust = state.resources.trust;
      state.maxBiodiversity = state.resources.biodiversity;
      showDashboard();
    };
  }

  // ── Screen: Dashboard / Map ───────────────────────────────
  function showDashboard() {
    show('dashboard');
    setParticles('');

    $('#dashboard-name').textContent = state.playerName;
    $('#dashboard-resilience').textContent = state.resilience;
    $('#zones-done').textContent = state.zonesCompleted;

    updateResourceDisplay();
    renderZoneCards();
  }

  function renderZoneCards() {
    const grid = $('#zone-grid');
    grid.innerHTML = '';

    GAME_DATA.zones.forEach(zone => {
      const completed = state.completedZoneIds.includes(zone.id);
      const card = document.createElement('div');
      card.className = `zone-card ${completed ? 'completed' : ''}`;
      card.style.setProperty('--zone-color', zone.color);
      card.style.background = completed
        ? 'rgba(255,255,255,0.05)'
        : zone.gradient;
      card.innerHTML = `
        <div class="zone-icon">${zone.icon}</div>
        <h3 class="zone-name">${zone.name}</h3>
        <p class="zone-challenge">${zone.challenge}</p>
        ${completed ? '<div class="zone-check">\u2713 Completed</div>' : '<div class="zone-play">Enter Zone \u2192</div>'}
      `;

      if (!completed) {
        card.onclick = () => startZone(zone);
        card.classList.add('hoverable');
      }

      grid.appendChild(card);
    });
  }

  // ── Screen: Scenario ──────────────────────────────────────
  function startZone(zone) {
    state.currentZone = zone;
    show('scenario');
    setParticles(zone.particleClass);
    document.body.style.setProperty('--active-color', zone.color);

    $('#scenario-zone-icon').textContent = zone.icon;
    $('#scenario-zone-name').textContent = zone.name;
    $('#scenario-zone-challenge').textContent = zone.challenge;
    $('#scenario-title').textContent = zone.scenario.title;

    const narrativeEl = $('#scenario-narrative');
    typeWriter(narrativeEl, zone.scenario.narrative, 18);

    updateResourceDisplay();

    $('#btn-face-challenge').onclick = () => showDecision();
  }

  // ── Screen: Decision ──────────────────────────────────────
  function showDecision() {
    show('decision');
    const zone = state.currentZone;
    setParticles(zone.particleClass);

    $('#decision-title').textContent = `${zone.icon} ${zone.name}: Choose Your Action`;
    updateResourceDisplay();

    const container = $('#choice-cards');
    container.innerHTML = '';

    zone.scenario.choices.forEach((choice, idx) => {
      const card = document.createElement('div');
      card.className = 'choice-card';
      card.style.animationDelay = `${idx * 0.15}s`;

      // Build effects preview
      const effectsHTML = Object.entries(choice.effects)
        .map(([key, val]) => {
          const meta = GAME_DATA.resources[key];
          const cls = val > 0 ? 'positive' : val < 0 ? 'negative' : 'neutral';
          const sign = val > 0 ? '+' : '';
          return `<span class="effect-tag ${cls}">${meta.icon} ${sign}${val}</span>`;
        })
        .join('');

      card.innerHTML = `
        <div class="choice-header">
          <h3>${choice.title}</h3>
        </div>
        <p class="choice-desc">${choice.description}</p>
        <div class="choice-effects">${effectsHTML}</div>
        <button class="btn-choose">Choose This Action</button>
      `;

      card.querySelector('.btn-choose').onclick = (e) => {
        e.stopPropagation();
        confirmChoice(choice, idx);
      };

      container.appendChild(card);
    });
  }

  function confirmChoice(choice, idx) {
    state.currentChoice = choice;
    state.choiceHistory.push({
      zone: state.currentZone.id,
      choice: choice.title,
      quality: choice.quality
    });
    if (choice.quality === 'best') state.bestChoices++;

    // Apply effects
    const severity = GAME_DATA.difficulty[state.difficulty].eventSeverity;
    // For player choices, negative effects are scaled by severity, positive effects are not
    const adjustedEffects = {};
    Object.entries(choice.effects).forEach(([key, val]) => {
      adjustedEffects[key] = val < 0 ? Math.round(val * severity) : val;
    });
    applyEffects(adjustedEffects, 1);

    // Add resilience
    state.resilience += choice.resilience;
    state.zonesCompleted++;
    state.completedZoneIds.push(state.currentZone.id);

    showOutcome();
  }

  // ── Screen: Outcome ───────────────────────────────────────
  function showOutcome() {
    show('outcome');
    const choice = state.currentChoice;
    const zone = state.currentZone;
    setParticles(zone.particleClass);

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

    // Fact
    $('#outcome-fact').textContent = choice.fact;

    // Reflection
    $('#outcome-reflection').textContent = zone.scenario.reflection;

    updateResourceDisplay();

    const resEl = $('#outcome-total-resilience');
    animateNumber(resEl, state.resilience - choice.resilience, state.resilience);

    $('#btn-continue').onclick = () => {
      if (state.zonesCompleted < 6) {
        triggerRandomEvent();
      } else {
        showFinalScore();
      }
    };
  }

  // ── Random Events ─────────────────────────────────────────
  function triggerRandomEvent() {
    // 70% chance of an event between zones
    if (Math.random() > 0.7 && state.zonesCompleted < 5) {
      showDashboard();
      return;
    }

    // Pick a random event
    const events = GAME_DATA.events;
    const event = events[Math.floor(Math.random() * events.length)];

    show('event');
    setParticles(event.type === 'positive' ? '' : 'dust');

    $('#event-icon').textContent = event.icon;
    $('#event-title').textContent = event.title;
    $('#event-description').textContent = event.description;
    $('#event-type').textContent = event.type === 'positive' ? 'Good News!' : 'Bad News!';
    $('#event-type').className = `event-type ${event.type}`;

    // Show effects
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
    const adjustedEffects = {};
    Object.entries(event.effects).forEach(([key, val]) => {
      adjustedEffects[key] = val < 0 ? Math.round(val * severity) : val;
    });
    applyEffects(adjustedEffects, 1);

    updateResourceDisplay();

    $('#btn-event-continue').onclick = () => showDashboard();
  }

  // ── Final Score ───────────────────────────────────────────
  function showFinalScore() {
    show('final');
    setParticles('');

    // Calculate final score percentage
    const resPercent = Math.round((state.resilience / state.maxResilience) * 100);

    // Resource bonus (average of all resources, normalized)
    const resKeys = ['budget', 'water', 'energy', 'trust', 'biodiversity'];
    const avgResource = resKeys.reduce((s, k) => s + state.resources[k], 0) / resKeys.length;
    const resourceBonus = Math.round((avgResource / 100) * 20); // up to 20 bonus points

    const finalScore = Math.max(0, Math.min(100, resPercent + resourceBonus));

    // Grade
    const gradeData = GAME_DATA.grades.find(g => finalScore >= g.min) || GAME_DATA.grades[GAME_DATA.grades.length - 1];

    $('#final-name').textContent = state.playerName;
    const scoreEl = $('#final-score');
    animateNumber(scoreEl, 0, finalScore, 2000);
    $('#final-grade').textContent = gradeData.grade;
    $('#final-title').textContent = gradeData.title;
    $('#final-message').textContent = gradeData.message;

    // Resilience breakdown
    $('#final-resilience').textContent = `${state.resilience} / ${state.maxResilience}`;
    $('#final-resource-bonus').textContent = `+${resourceBonus}`;

    // Resource summary
    const resSummary = $('#final-resources');
    resSummary.innerHTML = '';
    resKeys.forEach(key => {
      const meta = GAME_DATA.resources[key];
      const val = Math.round(state.resources[key]);
      const tag = document.createElement('div');
      tag.className = 'final-resource-item';
      tag.innerHTML = `<span>${meta.icon} ${meta.label}</span><span class="final-res-val">${val}</span>`;
      resSummary.appendChild(tag);
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
        badge.innerHTML = `
          <span class="ach-icon">${ach.icon}</span>
          <div>
            <strong>${ach.title}</strong>
            <p>${ach.description}</p>
          </div>
        `;
        achContainer.appendChild(badge);
      });
    }

    // Choice history
    const histContainer = $('#final-history');
    histContainer.innerHTML = '';
    state.choiceHistory.forEach(ch => {
      const zone = GAME_DATA.zones.find(z => z.id === ch.zone);
      const qualCls = {
        best: 'quality-best', good: 'quality-good',
        poor: 'quality-poor', terrible: 'quality-terrible'
      };
      const item = document.createElement('div');
      item.className = `history-item ${qualCls[ch.quality] || ''}`;
      item.innerHTML = `<span>${zone.icon} ${zone.name}</span><span>${ch.choice}</span>`;
      histContainer.appendChild(item);
    });

    // Replay
    $('#btn-replay').onclick = () => resetGame();
  }

  function checkAchievements() {
    state.achievements = [];
    GAME_DATA.achievements.forEach(ach => {
      if (ach.condition(state)) {
        state.achievements.push(ach);
      }
    });
  }

  // ── Reset ──────────────────────────────────────────────────
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
    state.bestChoices = 0;
    state.waterNeverBelow80 = true;
    state.neverBelow20 = true;
    state.maxTrust = 0;
    state.maxBiodiversity = 0;
    state.recoveredFromCritical = false;
    state.hadCritical = false;
    state.choiceHistory = [];
    show('welcome');
    setParticles('rain');
  }

  // ── Initialize ─────────────────────────────────────────────
  function init() {
    show('welcome');
    initWelcome();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
