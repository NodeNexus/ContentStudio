/* ========================================
   CONTENT STUDIO — ENHANCED FRONTEND
   ======================================== */

// ==========================================
// PARTICLE SYSTEM
// ==========================================
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      const colors = ['139,92,246', '6,182,212', '236,72,153'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      const dx = mouse.x - this.x, dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) { this.x -= dx * 0.01; this.y -= dy * 0.01; }
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`; ctx.fill();
    }
  }
  for (let i = 0; i < 80; i++) particles.push(new Particle());
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139,92,246,${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// ==========================================
// SMOOTH SCROLL
// ==========================================
function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
(function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
})();

// ==========================================
// ANIMATED COUNTERS
// ==========================================
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 40);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => observer.observe(c));
})();

// ==========================================
// HAMBURGER MENU
// ==========================================
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav-links');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }
})();

// ==========================================
// THEME TOGGLE
// ==========================================
(function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const icon = btn?.querySelector('.theme-icon');
  if (!btn) return;
  const current = localStorage.getItem('cs_theme') || 'dark';
  if (current === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (icon) icon.textContent = '☀️';
  }
  btn.addEventListener('click', () => {
    const isDark = !document.documentElement.hasAttribute('data-theme');
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('cs_theme', 'light');
      if (icon) icon.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('cs_theme', 'dark');
      if (icon) icon.textContent = '🌙';
    }
  });
})();

// ==========================================
// CHARACTER COUNTER
// ==========================================
(function initCharCounter() {
  const input = document.getElementById('topic-input');
  const counter = document.getElementById('char-count');
  if (input && counter) {
    input.addEventListener('input', () => { counter.textContent = input.value.length + ' characters'; });
  }
})();

// ==========================================
// TAB SWITCHING
// ==========================================
document.getElementById('tabs')?.addEventListener('click', (e) => {
  if (!e.target.classList.contains('tab-btn')) return;
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
  e.target.classList.add('active');
  document.getElementById(e.target.dataset.tab)?.classList.add('active');
});

// ==========================================
// DEMO QUICK-PICK
// ==========================================
const DEMO_TOPICS = {
  '🤖 AI Agents in Business': 'How AI Agents are Transforming Business Automation in 2026',
  '🎮 Gaming & Students': 'The Impact of Gaming on Student Life and Academic Performance',
  '🌱 Sustainable Tech': 'How Green Technology is Reshaping the Future of Computing',
  '🚀 Future of Remote Work': 'The Evolution of Remote Work: Trends Shaping 2026 and Beyond',
};

function pickDemo(btn) {
  const topic = DEMO_TOPICS[btn.textContent.trim()] || btn.textContent.trim();
  const input = document.getElementById('topic-input');
  input.value = topic;
  input.focus();
  input.dispatchEvent(new Event('input'));
  showToast('✨ Demo topic loaded — hit Generate!', 'info');
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 3500);
}

// ==========================================
// MARKDOWN RENDERER (simple)
// ==========================================
function renderMarkdown(text) {
  if (!text) return '<p style="color:var(--text-muted)">Not generated.</p>';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>');
  html = html.replace(/(<li>.*?<\/li>(\s*<br>)*)+/g, (m) => '<ul>' + m.replace(/<br>/g,'') + '</ul>');
  return '<p>' + html + '</p>';
}

// ==========================================
// PIPELINE HELPERS
// ==========================================
const STEPS = ['research', 'blog', 'social', 'email', 'video'];
const AGENT_NAMES = { research: 'Research Analyst', blog: 'Blog Writer', social: 'Social Media Pro', email: 'Email Marketer', video: 'Video Scriptwriter' };

function resetPipeline() {
  document.querySelectorAll('.pipeline-step').forEach((s) => s.classList.remove('active', 'done'));
  document.querySelectorAll('.pipeline-connector').forEach((c) => c.classList.remove('done'));
  document.querySelectorAll('.agent-card').forEach((c) => c.classList.remove('working', 'done-status'));
  const feed = document.getElementById('activity-feed');
  if (feed) { feed.innerHTML = ''; feed.classList.remove('active'); }
}

function activateStep(index) {
  const step = document.querySelector(`.pipeline-step[data-step="${STEPS[index]}"]`);
  if (step) step.classList.add('active');
  const card = document.querySelector(`.agent-card[data-agent="${STEPS[index]}"]`);
  if (card) card.classList.add('working');
}

function completeStep(index) {
  const step = document.querySelector(`.pipeline-step[data-step="${STEPS[index]}"]`);
  if (step) { step.classList.remove('active'); step.classList.add('done'); }
  const conn = document.querySelector(`.pipeline-connector[data-after="${STEPS[index]}"]`);
  if (conn) conn.classList.add('done');
  const card = document.querySelector(`.agent-card[data-agent="${STEPS[index]}"]`);
  if (card) { card.classList.remove('working'); card.classList.add('done-status'); }
}

// ==========================================
// ACTIVITY FEED
// ==========================================
const AGENT_LOGS = {
  research: ['Searching for key insights on the topic...','Analyzing trending data and statistics...','Compiling research report with findings...'],
  blog: ['Crafting SEO-optimized headline...','Writing engaging introduction with hook...','Building out sections with supporting data...'],
  social: ['Optimizing for LinkedIn professional audience...','Creating witty Twitter/X thread...','Designing Instagram caption with hashtags...'],
  email: ['Writing subject line for maximum open rate...','Structuring 3-part newsletter series...','Adding compelling calls-to-action...'],
  video: ['Scripting attention-grabbing hook (0-15s)...','Building narrative arc with visual cues...','Writing outro with engagement prompts...'],
};

function addLogLine(agent, message) {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;
  feed.classList.add('active');
  const line = document.createElement('div');
  line.className = 'log-line';
  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  line.innerHTML = `<span class="log-time">[${now}]</span> <span class="log-agent">${agent}:</span> ${message}`;
  feed.appendChild(line);
  feed.scrollTop = feed.scrollHeight;
}

async function animatePipeline() {
  for (let i = 0; i < STEPS.length; i++) {
    activateStep(i);
    const logs = AGENT_LOGS[STEPS[i]];
    for (let j = 0; j < logs.length; j++) {
      addLogLine(AGENT_NAMES[STEPS[i]], logs[j]);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    }
    await new Promise((r) => setTimeout(r, 500));
    completeStep(i);
  }
}

function finishPipeline() {
  STEPS.forEach((_, i) => completeStep(i));
  const h = document.querySelector('#pipeline h3');
  if (h) h.textContent = 'Agent Pipeline — Complete ✅';
}

// ==========================================
// ELAPSED TIMER
// ==========================================
let timerInterval = null;
function startTimer() {
  const sec = document.getElementById('elapsed-seconds');
  const el = document.getElementById('elapsed-timer');
  if (el) el.classList.add('active');
  let t = 0; sec.textContent = '0';
  timerInterval = setInterval(() => { t++; sec.textContent = t; }, 1000);
}
function stopTimer() {
  clearInterval(timerInterval);
  const el = document.getElementById('elapsed-timer');
  if (el) el.classList.remove('active');
}

// ==========================================
// COPY / DOWNLOAD
// ==========================================
function getActiveText() {
  const active = document.querySelector('.tab-content.active');
  if (!active) return '';
  const pre = active.querySelector('pre');
  if (pre) return pre.textContent;
  const rc = active.querySelector('.rendered-content');
  return rc ? rc.innerText : '';
}

function copyActive() {
  const text = getActiveText();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy');
    const orig = btn.textContent;
    btn.textContent = '✅ Copied!';
    showToast('📋 Content copied to clipboard!', 'success');
    setTimeout(() => (btn.textContent = orig), 2000);
  });
}

let lastResultJSON = null;

function downloadJSON() {
  if (!lastResultJSON) return;
  const blob = new Blob([JSON.stringify(lastResultJSON, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `content_${lastResultJSON.topic.replace(/\s+/g, '_')}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast('📥 JSON downloaded!', 'success');
}

function downloadMarkdown() {
  if (!lastResultJSON) return;
  const c = lastResultJSON.content || {};
  let md = `# Content Package: ${lastResultJSON.topic}\n\n`;
  md += `> Generated: ${new Date(lastResultJSON.generated_at).toLocaleString()}\n`;
  md += `> Audience: ${lastResultJSON.audience} | Tone: ${lastResultJSON.tone}\n\n---\n\n`;
  if (c.research) md += `## 🔍 Research\n\n${c.research}\n\n---\n\n`;
  if (c.blog) md += `## 📝 Blog Post\n\n${c.blog}\n\n---\n\n`;
  if (c.social) md += `## 📱 Social Media\n\n${c.social}\n\n---\n\n`;
  if (c.email) md += `## 📧 Email Newsletter\n\n${c.email}\n\n---\n\n`;
  if (c.video) md += `## 🎥 Video Script\n\n${c.video}\n`;
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `content_${lastResultJSON.topic.replace(/\s+/g, '_')}.md`;
  a.click(); URL.revokeObjectURL(url);
  showToast('📄 Markdown downloaded!', 'success');
}

function downloadTXT() {
  if (!lastResultJSON) return;
  const c = lastResultJSON.content || {};
  let txt = `CONTENT PACKAGE: ${lastResultJSON.topic}\n${'='.repeat(50)}\n\n`;
  txt += `Generated: ${new Date(lastResultJSON.generated_at).toLocaleString()}\n`;
  txt += `Audience: ${lastResultJSON.audience} | Tone: ${lastResultJSON.tone}\n\n`;
  if (c.research) txt += `RESEARCH\n${'-'.repeat(30)}\n${c.research}\n\n`;
  if (c.blog) txt += `BLOG POST\n${'-'.repeat(30)}\n${c.blog}\n\n`;
  if (c.social) txt += `SOCIAL MEDIA\n${'-'.repeat(30)}\n${c.social}\n\n`;
  if (c.email) txt += `EMAIL NEWSLETTER\n${'-'.repeat(30)}\n${c.email}\n\n`;
  if (c.video) txt += `VIDEO SCRIPT\n${'-'.repeat(30)}\n${c.video}\n`;
  const blob = new Blob([txt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `content_${lastResultJSON.topic.replace(/\s+/g, '_')}.txt`;
  a.click(); URL.revokeObjectURL(url);
  showToast('📃 Text file downloaded!', 'success');
}

// ==========================================
// SHIMMER PLACEHOLDERS
// ==========================================
function showShimmers() {
  ['out-blog','out-social','out-email','out-video','out-research'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="shimmer-block"></div>'.repeat(6);
  });
  const raw = document.getElementById('out-raw');
  if (raw) raw.innerHTML = '<div class="shimmer-block"></div>'.repeat(6);
}
function clearShimmers() {
  ['out-blog','out-social','out-email','out-video','out-research','out-raw'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
}

// ==========================================
// CONTENT STATS
// ==========================================
function updateContentStats(content) {
  let totalWords = 0, totalChars = 0;
  Object.values(content).forEach((v) => {
    if (v) { totalWords += v.split(/\s+/).filter(Boolean).length; totalChars += v.length; }
  });
  const readingMin = Math.max(1, Math.ceil(totalWords / 200));
  const elapsed = document.getElementById('elapsed-seconds')?.textContent || '?';
  document.getElementById('cs-words').textContent = totalWords.toLocaleString();
  document.getElementById('cs-chars').textContent = totalChars.toLocaleString();
  document.getElementById('cs-reading').textContent = readingMin + ' min';
  const badges = document.getElementById('result-badges');
  if (badges) {
    badges.innerHTML = `
      <span class="result-badge">⏱ Generated in ${elapsed}s</span>
      <span class="result-badge">📝 ${totalWords.toLocaleString()} words</span>
    `;
  }
}

// ==========================================
// HISTORY (Database)
// ==========================================
let currentHistory = [];

async function fetchAndRenderHistory() {
  const grid = document.getElementById('history-grid');
  grid.innerHTML = '<div class="shimmer-block"></div>'.repeat(3);
  try {
    const res = await fetch('/api/history');
    if (!res.ok) throw new Error('Failed to load');
    currentHistory = await res.json();
    renderHistoryCards();
  } catch (err) {
    grid.innerHTML = '<p style="color:var(--text-muted)">Failed to load history from database.</p>';
  }
}

function renderHistoryCards() {
  const grid = document.getElementById('history-grid');
  grid.innerHTML = '';
  if (currentHistory.length === 0) {
    grid.innerHTML = `<div class="history-empty" id="history-empty">
      <span class="history-empty-icon">📭</span>
      <p>No generations yet. Create your first content package above!</p></div>`;
    return;
  }
  currentHistory.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const date = new Date(item.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const types = [];
    if (item.content?.blog) types.push('📝 Blog');
    if (item.content?.social) types.push('📱 Social');
    if (item.content?.email) types.push('📧 Email');
    if (item.content?.video) types.push('🎥 Video');
    card.innerHTML = `<h4>${item.topic}</h4>
      <div class="history-meta"><span>📅 ${date}</span><span>🎯 ${item.audience || 'General'}</span></div>
      <div class="history-types">${types.map(t => `<span class="history-type-badge">${t}</span>`).join('')}</div>`;
    card.addEventListener('click', () => loadFromHistory(item));
    grid.appendChild(card);
  });
}

function loadFromHistory(item) {
  lastResultJSON = item;
  const c = item.content || {};
  document.getElementById('out-blog').innerHTML = renderMarkdown(c.blog);
  document.getElementById('out-social').innerHTML = renderMarkdown(c.social);
  document.getElementById('out-email').innerHTML = renderMarkdown(c.email);
  document.getElementById('out-video').innerHTML = renderMarkdown(c.video);
  document.getElementById('out-research').innerHTML = renderMarkdown(c.research);
  document.getElementById('out-raw').textContent = JSON.stringify(item, null, 2);
  updateContentStats(c);
  document.getElementById('results-section').classList.add('active');
  smoothScrollTo('#results-anchor');
  showToast('📂 Loaded from history: ' + item.topic, 'info');
}

async function clearHistory() {
  if (!confirm('Clear all generation history?')) return;
  try {
    await fetch('/api/history', { method: 'DELETE' });
    fetchAndRenderHistory();
    showToast('🗑️ History cleared from database', 'info');
  } catch (err) {
    showToast('❌ Failed to clear history', 'error');
  }
}

// Init history on load
fetchAndRenderHistory();

// ==========================================
// MAIN GENERATE HANDLER
// ==========================================
async function handleGenerate() {
  const topic = document.getElementById('topic-input').value.trim();
  if (!topic) {
    document.getElementById('topic-input').focus();
    showToast('⚠️ Please enter a topic first!', 'error');
    return;
  }

  const btn = document.getElementById('btn-generate');
  const pipeline = document.getElementById('pipeline');
  const resultsSection = document.getElementById('results-section');
  const panel = document.getElementById('generator-panel');

  const payload = {
    topic,
    audience: document.getElementById('audience-select').value,
    tone: document.getElementById('tone-select').value,
    language: document.getElementById('language-select')?.value || 'English',
    word_count: parseInt(document.getElementById('word-count-select')?.value || '1500'),
    include_blog: document.getElementById('chk-blog').checked,
    include_social: document.getElementById('chk-social').checked,
    include_email: document.getElementById('chk-email').checked,
    include_video: document.getElementById('chk-video').checked,
  };

  btn.classList.add('loading'); btn.disabled = true;
  panel.classList.add('generating');
  resultsSection.classList.remove('active');
  document.getElementById('result-badges').innerHTML = '';
  resetPipeline();
  pipeline.classList.add('active');
  showShimmers();
  const pipelineH3 = document.querySelector('#pipeline h3');
  if (pipelineH3) pipelineH3.textContent = 'Agent Pipeline — Working...';
  showToast('🚀 Agents are generating your content...', 'info');
  startTimer();

  const pipelinePromise = animatePipeline();

  try {
    const response = await fetch('/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Generation failed');

    await pipelinePromise;
    stopTimer(); finishPipeline(); clearShimmers();
    lastResultJSON = data;

    const c = data.content || {};
    document.getElementById('out-blog').innerHTML = renderMarkdown(c.blog);
    document.getElementById('out-social').innerHTML = renderMarkdown(c.social);
    document.getElementById('out-email').innerHTML = renderMarkdown(c.email);
    document.getElementById('out-video').innerHTML = renderMarkdown(c.video);
    document.getElementById('out-research').innerHTML = renderMarkdown(c.research);
    document.getElementById('out-raw').textContent = JSON.stringify(data, null, 2);

    updateContentStats(c);
    resultsSection.classList.add('active');
    fetchAndRenderHistory(); // Refresh from DB instead of localStorage
    showToast('✅ Content package generated successfully!', 'success');
    setTimeout(() => smoothScrollTo('#results-anchor'), 300);
  } catch (err) {
    stopTimer(); finishPipeline(); clearShimmers();
    const pt = document.querySelector('#pipeline h3');
    if (pt) pt.textContent = '❌ Error — ' + err.message;
    showToast('❌ ' + err.message, 'error');
  } finally {
    btn.classList.remove('loading'); btn.disabled = false;
    panel.classList.remove('generating');
  }
}

// ==========================================
// KEYBOARD SHORTCUT (Ctrl+Enter)
// ==========================================
document.getElementById('topic-input')?.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleGenerate(); }
});
