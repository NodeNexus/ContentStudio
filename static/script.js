const STEPS = ["research", "blog", "social", "email", "video"];
const AGENT_NAMES = {
  research: "Research Analyst",
  blog: "Blog Writer",
  social: "Social Media Specialist",
  email: "Email Marketing Expert",
  video: "Video Scriptwriter",
};
const AGENT_LOGS = {
  research: ["Collecting market and SERP signals", "Extracting audience intent clusters", "Compiling strategic brief"],
  blog: ["Building SEO-led long form structure", "Generating narrative with authority", "Refining CTA and readability"],
  social: ["Creating platform-native copy", "Tuning engagement hooks", "Finalizing hashtag and visual cues"],
  email: ["Drafting high-open subject lines", "Designing campaign sequence", "Polishing conversion copy"],
  video: ["Writing cinematic opener", "Structuring scene-by-scene script", "Completing outro and hook"],
};

let lastResultJSON = null;
let currentHistory = [];
let timerInterval = null;
let lastFocusElement = null;

(function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const particles = [];
  let mouse = { x: -1000, y: -1000 };

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse = { x: e.clientX, y: e.clientY };
  });

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r = Math.random() * 1.8 + 0.8;
      this.a = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 150) {
        this.x -= dx * 0.01;
        this.y -= dy * 0.01;
      }
      if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124, 58, 237, ${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(render);
  };
  render();
})();

function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

(function initCounters() {
  const counters = document.querySelectorAll(".stat-number[data-target]");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const step = Math.max(1, Math.floor(target / 42));
      let value = 0;
      const timer = setInterval(() => {
        value += step;
        if (value >= target) {
          value = target;
          clearInterval(timer);
        }
        el.textContent = value.toLocaleString();
      }, 24);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach((counter) => obs.observe(counter));
})();

(function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;
  const closeNav = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeNav();
  });
})();

(function initMicroInteractions() {
  const cards = document.querySelectorAll(".glass");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
    });
  });
  const hero = document.querySelector(".hero-showcase");
  if (hero) {
    window.addEventListener("mousemove", (event) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (event.clientX - cx) / cx;
      const dy = (event.clientY - cy) / cy;
      hero.style.transform = `perspective(900px) rotateY(${dx * 2}deg) rotateX(${dy * -2}deg)`;
    });
  }
})();

(function initTabs() {
  const tabs = document.getElementById("tabs");
  if (!tabs) return;
  tabs.addEventListener("click", (event) => {
    const button = event.target.closest(".tab-btn");
    if (!button) return;
    document.querySelectorAll(".tab-btn").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach((item) => item.setAttribute("aria-selected", "false"));
    document.querySelectorAll(".tab-content").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    document.getElementById(button.dataset.tab)?.classList.add("active");
  });
})();

(function initTopicCounter() {
  const input = document.getElementById("topic-input");
  const count = document.getElementById("char-count");
  if (!input || !count) return;
  input.addEventListener("input", () => {
    count.textContent = `${input.value.length} characters`;
  });
})();

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function renderMarkdown(text) {
  if (!text) return "<p style='color:#a0a3c4'>Not generated for this run.</p>";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>");
  html = html.replace(/(<li>.*?<\/li>(<br>)*)+/g, (block) => `<ul>${block.replace(/<br>/g, "")}</ul>`);
  return `<p>${html}</p>`;
}

function addLogLine(agent, message) {
  const feed = document.getElementById("activity-feed");
  if (!feed) return;
  const line = document.createElement("div");
  line.className = "log-line";
  line.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span><span class="log-agent">${agent}</span>${message}`;
  feed.appendChild(line);
  feed.scrollTop = feed.scrollHeight;
}

function addTypingLine(agent) {
  const feed = document.getElementById("activity-feed");
  if (!feed) return null;
  const line = document.createElement("div");
  line.className = "log-line typing";
  line.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span><span class="log-agent">${agent}</span>Processing`;
  feed.appendChild(line);
  feed.scrollTop = feed.scrollHeight;
  return line;
}

function resetPipeline() {
  document.querySelectorAll(".ai-node").forEach((node) => node.classList.remove("active", "done"));
  const flow = document.getElementById("pipeline-flow");
  if (flow) flow.style.width = "0%";
  const feed = document.getElementById("activity-feed");
  if (feed) feed.innerHTML = "<div class='log-line'><span class='log-time'>[System]</span> Neural orchestration layer initialized and awaiting prompt.</div>";
}

function activateStep(index) {
  const node = document.getElementById(`node-${STEPS[index]}`);
  node?.classList.add("active");
  const flow = document.getElementById("pipeline-flow");
  if (flow) flow.style.width = `${(index / (STEPS.length - 1)) * 84}%`;
}

function completeStep(index) {
  const node = document.getElementById(`node-${STEPS[index]}`);
  if (!node) return;
  node.classList.remove("active");
  node.classList.add("done");
}

async function animatePipeline() {
  for (let i = 0; i < STEPS.length; i++) {
    const key = STEPS[i];
    activateStep(i);
    for (const log of AGENT_LOGS[key]) {
      const typing = addTypingLine(AGENT_NAMES[key]);
      await new Promise((resolve) => setTimeout(resolve, 260));
      typing?.remove();
      addLogLine(AGENT_NAMES[key], log);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    completeStep(i);
  }
}

function finishPipeline() {
  STEPS.forEach((_, index) => completeStep(index));
  const flow = document.getElementById("pipeline-flow");
  if (flow) flow.style.width = "84%";
  addLogLine("System", "Pipeline completed and output synchronized.");
}

function startTimer() {
  const sec = document.getElementById("elapsed-seconds");
  if (!sec) return;
  clearInterval(timerInterval);
  let t = 0;
  sec.textContent = "0";
  timerInterval = setInterval(() => {
    t += 1;
    sec.textContent = String(t);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function showShimmers() {
  ["out-blog", "out-social", "out-email", "out-video", "out-research"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "<div class='shimmer-block'></div>".repeat(7);
  });
}

function setContentToViewer(content) {
  document.getElementById("out-blog").innerHTML = renderMarkdown(content.blog);
  document.getElementById("out-social").innerHTML = renderMarkdown(content.social);
  document.getElementById("out-email").innerHTML = renderMarkdown(content.email);
  document.getElementById("out-video").innerHTML = renderMarkdown(content.video);
  document.getElementById("out-research").innerHTML = renderMarkdown(content.research);
}

function updateContentStats(content) {
  const projects = document.getElementById("kpi-projects");
  const words = document.getElementById("kpi-words");
  let totalWords = 0;
  Object.values(content).forEach((value) => {
    if (value) totalWords += value.split(/\s+/).filter(Boolean).length;
  });
  if (projects) projects.textContent = String(currentHistory.length);
  if (words) words.textContent = totalWords.toLocaleString();
  const badges = document.getElementById("result-badges");
  if (badges) badges.innerHTML = `<span class="result-badge">${totalWords.toLocaleString()} words</span><span class="result-badge">5 agent pipeline</span>`;
}

function getActiveText() {
  const active = document.querySelector(".tab-content.active .rendered-content");
  return active ? active.innerText : "";
}

function copyActive() {
  const text = getActiveText();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Content copied to clipboard", "success");
  });
}

function openExportModal() {
  const modal = document.getElementById("export-modal");
  if (!modal) return;
  lastFocusElement = document.activeElement;
  modal.classList.remove("hidden");
  modal.querySelector(".modal-content")?.focus();
}

function closeExportModal() {
  const modal = document.getElementById("export-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  if (lastFocusElement instanceof HTMLElement) lastFocusElement.focus();
}

function downloadJSON() {
  if (!lastResultJSON) return showToast("Generate content first", "error");
  const blob = new Blob([JSON.stringify(lastResultJSON, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `content_${lastResultJSON.topic.replace(/\s+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadMarkdown() {
  if (!lastResultJSON) return showToast("Generate content first", "error");
  const c = lastResultJSON.content || {};
  let md = `# ${lastResultJSON.topic}\n\n`;
  md += `Generated: ${new Date(lastResultJSON.generated_at).toLocaleString()}\n`;
  md += `Audience: ${lastResultJSON.audience}\nTone: ${lastResultJSON.tone}\n\n---\n\n`;
  if (c.research) md += `## Research\n\n${c.research}\n\n`;
  if (c.blog) md += `## Blog\n\n${c.blog}\n\n`;
  if (c.social) md += `## Social\n\n${c.social}\n\n`;
  if (c.email) md += `## Email\n\n${c.email}\n\n`;
  if (c.video) md += `## Video\n\n${c.video}\n\n`;
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `content_${lastResultJSON.topic.replace(/\s+/g, "_")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTXT() {
  if (!lastResultJSON) return showToast("Generate content first", "error");
  const c = lastResultJSON.content || {};
  let txt = `${lastResultJSON.topic}\n${"-".repeat(60)}\n`;
  Object.entries(c).forEach(([key, val]) => {
    if (!val) return;
    txt += `\n${key.toUpperCase()}\n${val}\n`;
  });
  const blob = new Blob([txt], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `content_${lastResultJSON.topic.replace(/\s+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchAndRenderHistory() {
  const grid = document.getElementById("history-grid");
  if (!grid) return;
  grid.innerHTML = "<div class='glass history-card shimmer-block'></div>".repeat(3);
  try {
    const res = await fetch("/api/history");
    if (!res.ok) throw new Error("Unable to load history");
    currentHistory = await res.json();
    renderHistoryCards();
  } catch (error) {
    grid.innerHTML = "<p style='color:#b4b6d6'>Failed to load history.</p>";
  }
}

function renderHistoryCards() {
  const grid = document.getElementById("history-grid");
  if (!grid) return;
  const search = (document.getElementById("history-search")?.value || "").toLowerCase();
  const filtered = currentHistory.filter((item) => {
    return `${item.topic} ${item.audience} ${item.tone}`.toLowerCase().includes(search);
  });
  grid.innerHTML = "";
  if (!filtered.length) {
    grid.innerHTML = "<div class='history-empty glass'><p>No content found yet. Run your first generation.</p></div>";
    return;
  }
  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "history-card glass";
    const date = new Date(item.generated_at).toLocaleString();
    const badges = [];
    if (item.content?.blog) badges.push("Blog");
    if (item.content?.social) badges.push("Social");
    if (item.content?.email) badges.push("Email");
    if (item.content?.video) badges.push("Video");
    card.innerHTML = `
      <h4>${item.topic}</h4>
      <div class="history-meta"><span>${date}</span><span>${item.audience || "General"}</span></div>
      <div class="history-types">${badges.map((b) => `<span class="history-type-badge">${b}</span>`).join("")}</div>
    `;
    card.addEventListener("click", () => loadFromHistory(item));
    grid.appendChild(card);
  });
  const projects = document.getElementById("kpi-projects");
  if (projects) projects.textContent = String(currentHistory.length);
}

function loadFromHistory(item) {
  lastResultJSON = item;
  setContentToViewer(item.content || {});
  updateContentStats(item.content || {});
  smoothScrollTo("#viewer");
  showToast("Loaded project from history", "success");
}

async function clearHistory() {
  if (!confirm("Clear all generation history?")) return;
  try {
    await fetch("/api/history", { method: "DELETE" });
    fetchAndRenderHistory();
    showToast("History cleared", "success");
  } catch {
    showToast("Failed to clear history", "error");
  }
}

async function handleGenerate() {
  const topicInput = document.getElementById("topic-input");
  const topic = topicInput?.value.trim();
  if (!topic) {
    topicInput?.focus();
    showToast("Enter a topic to generate content", "error");
    return;
  }

  const payload = {
    topic,
    audience: document.getElementById("audience-select")?.value || "General Public",
    tone: document.getElementById("tone-select")?.value || "Professional",
    include_blog: document.getElementById("chk-blog")?.checked ?? true,
    include_social: document.getElementById("chk-social")?.checked ?? true,
    include_email: document.getElementById("chk-email")?.checked ?? true,
    include_video: document.getElementById("chk-video")?.checked ?? true,
  };

  const button = document.getElementById("btn-generate");
  const original = button?.innerHTML || "Generate Content Package";
  if (button) {
    button.disabled = true;
    button.innerHTML = "<span>Orchestrating Agents...</span>";
  }
  resetPipeline();
  showShimmers();
  startTimer();
  const animation = animatePipeline();

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Generation failed");
    await animation;
    finishPipeline();
    stopTimer();
    lastResultJSON = data;
    setContentToViewer(data.content || {});
    updateContentStats(data.content || {});
    fetchAndRenderHistory();
    smoothScrollTo("#viewer");
    showToast("Content package generated successfully", "success");
  } catch (error) {
    stopTimer();
    addLogLine("Error", error.message);
    showToast(error.message, "error");
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = original;
    }
  }
}

document.getElementById("topic-input")?.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "Enter") {
    event.preventDefault();
    handleGenerate();
  }
});

document.getElementById("history-search")?.addEventListener("input", renderHistoryCards);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeExportModal();
});

fetchAndRenderHistory();
