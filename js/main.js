(function() {
'use strict';

const output = document.getElementById('terminal-output');
const cmdInput = document.getElementById('cmd-input');
const bootScreen = document.getElementById('boot-screen');
const mainUI = document.getElementById('main-ui');
const particleCanvas = document.getElementById('particle-canvas');
const ctx = particleCanvas.getContext('2d');
const suggestions = document.getElementById('suggestions');
const glitchOverlay = document.getElementById('glitch-overlay');

let particles = [];
let mouse = { x: 0, y: 0 };
let animFrame;
let clickCount = 0;
let history = [];
let historyIdx = -1;
let suggestIdx = -1;
const commandList = ['whoami', 'skills', 'projects', 'contact', 'neofetch', 'help', 'banner', 'date', 'matrix', 'engine', 'gun', 'sudo', 'clear'];

const cmdDescriptions = {
  whoami: 'about me',
  skills: 'my arsenal',
  projects: 'things i built',
  contact: 'reach out',
  neofetch: 'system info',
  help: 'this menu',
  banner: 'show header',
  date: 'current time',
  matrix: '🥚 enter the matrix',
  engine: '🥚 rev it up',
  gun: '🥚 1911 — fire!',
  sudo: '🥚 try it',
  clear: 'clear terminal'
};

// ===== RESIZE =====
function resizeCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===== MOUSE =====
document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

// ===== UTILITY =====
function $(sel, parent) { return (parent || document).querySelector(sel); }

function scrollBottom() {
  setTimeout(() => { output.scrollTop = output.scrollHeight; }, 50);
}

const DOB = new Date(2007, 7, 26);
let uptimeInterval = null;

function calcUptime() {
  const now = new Date();
  let ms = now - DOB;
  const totalSec = Math.floor(ms / 1000);
  const years = Math.floor(totalSec / (365.25 * 86400));
  const remAfterYears = totalSec % (365.25 * 86400);
  const months = Math.floor(remAfterYears / (30.44 * 86400));
  const remAfterMonths = remAfterYears % (30.44 * 86400);
  const days = Math.floor(remAfterMonths / 86400);
  const hours = Math.floor((remAfterMonths % 86400) / 3600);
  const minutes = Math.floor((remAfterMonths % 3600) / 60);
  const seconds = Math.floor(remAfterMonths % 60);
  return `${years}y ${months}m ${days}d ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function startLiveUptime() {
  const el = document.getElementById('live-uptime');
  if (!el) return;
  if (uptimeInterval) clearInterval(uptimeInterval);
  el.textContent = calcUptime();
  uptimeInterval = setInterval(() => {
    const e = document.getElementById('live-uptime');
    if (e) e.textContent = calcUptime();
    else if (uptimeInterval) { clearInterval(uptimeInterval); uptimeInterval = null; }
  }, 1000);
}

// ===== BOOT SEQUENCE =====
const bootMessages = [
  { text: '[OK] Loading system personality — Prateek Sharma', type: 'ok' },
  { text: '[OK] Initializing cybersecurity & forensics modules...', type: 'ok' },
  { text: '[OK] Mounting Linux kernel subsystems...', type: 'ok' },
  { text: '[OK] Loading automotive knowledge base (Lexus LFA V10)...', type: 'ok' },
  { text: '[WARN] Firearms expertise detected — safety protocols engaged', type: 'warn' },
  { text: '[OK] Establishing neural interface...', type: 'ok' },
  { text: '[OK] System ready. Welcome, Prateek.', type: 'ok' },
];

function runBootSequence() {
  const bootAscii = document.getElementById('boot-ascii');
  const bootVersion = document.getElementById('boot-version');
  const bootBarBg = document.getElementById('boot-bar-bg');
  const bootBar = document.getElementById('boot-bar');
  const bootMessagesEl = document.getElementById('boot-messages');

  anime({ targets: bootScreen, opacity: [0, 1], duration: 400, easing: 'easeOutQuad', begin: () => { bootScreen.style.opacity = 1; } });
  anime({ targets: bootAscii, opacity: [0, 1], duration: 800, delay: 400, easing: 'easeOutCubic' });
  anime({ targets: bootVersion, opacity: [0, 1], duration: 600, delay: 1200, easing: 'easeOutCubic' });
  anime({ targets: bootBarBg, opacity: [0, 1], duration: 400, delay: 1800, easing: 'easeOutCubic' });

  anime({
    targets: bootBar, width: ['0%', '100%'], duration: 2200, delay: 2200, easing: 'easeInOutQuad',
    update: function(anim) {
      const pct = Math.round(anim.progress);
      const msgIdx = Math.min(Math.floor(pct / (100 / bootMessages.length)), bootMessages.length - 1);
      if (msgIdx >= 0) {
        bootMessagesEl.innerHTML = bootMessages.slice(0, msgIdx + 1).map(m => {
          const cls = m.type === 'warn' ? 'warn' : 'status';
          return `<p class="boot-msg" style="opacity:1"><span class="${cls}">${m.text.replace('[OK]','✓').replace('[WARN]','⚠')}</span></p>`;
        }).join('');
      }
    }
  });

  anime({ targets: bootMessagesEl, opacity: [0, 1], duration: 400, delay: 2000 });

  anime({
    targets: bootScreen, opacity: [1, 0], duration: 500, delay: 4600, easing: 'easeInQuad',
    begin: () => {
      glitchOverlay.style.display = 'block';
      anime({ targets: glitchOverlay, opacity: [0, 0.8, 0.6, 0.9, 0], duration: 400, easing: 'steps(5)', complete: () => { glitchOverlay.style.display = 'none'; } });
    },
    complete: () => {
      bootScreen.style.display = 'none';
      mainUI.style.display = 'block';
      animateMainEntry();
      startParticles();
      showWelcome();
    }
  });
}

// ===== MAIN ENTRY =====
function animateMainEntry() {
  const terminal = document.getElementById('terminal');
  terminal.style.opacity = 1;
  anime({ targets: terminal, translateY: [-40, 0], opacity: [0, 1], duration: 1000, easing: 'easeOutElastic(1, 0.6)' });
  anime({ targets: '#terminal-title', scale: [0.8, 1], opacity: [0, 1], duration: 600, delay: 600, easing: 'easeOutCubic' });
}

// ===== WELCOME =====
function showWelcome() {
  const block = document.createElement('div');
  block.className = 'output-block welcome-banner';
  block.innerHTML = `
<pre>
██████╗   █████╗  ████████╗ ██████╗  ██╗  ██╗  ██╗ ██╗  ██╗
██╔══██╗ ██╔══██╗ ╚══██╔══╝ ██╔══██╗ ██║  ╚██╗██╔╝ ╚██╗██╔╝
██████╔╝ ██████╔╝    ██║    ██████╔╝ ██║   ╚███╔╝   ╚███╔╝
██╔═══╝  ██╔══██╗    ██║    ██╔══██╗ ██║   ██╔██╗   ██╔██╗
██║      ██║  ██║    ██║    ██║  ██║ ██║  ██╔╝ ██╗ ██╔╝ ██╗
╚═╝      ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝ ╚═╝  ╚═╝  ╚═╝ ╚═╝  ╚═╝
</pre>
<div class="welcome-line">PATRIXX SHELL <span class="hl-red">v2.0</span> — Cybersecurity & Digital Forensics</div>
<div class="welcome-line">Operator: <span class="hl-red">Prateek Sharma</span> · VIT Bhopal</div>
<div class="welcome-line">Type <span class="hl-cyan">help</span> for available commands. Type <span class="hl-cyan">whoami</span> to begin.</div>
`.trim();

  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 800, delay: 200, easing: 'easeOutCubic' });
  scrollBottom();
  cmdInput.focus();
}

// ===== ECHO COMMAND =====
function echoCmd(cmd) {
  const echo = document.createElement('div');
  echo.className = 'output-block';
  echo.innerHTML = `<div class="cmd-echo">patrixx@portfolio:~$ ${cmd}</div>`;
  output.appendChild(echo);
  anime({ targets: echo.querySelector('.cmd-echo'), opacity: [0, 1], duration: 200, easing: 'easeOutCubic' });
  scrollBottom();
}

// ===== TITLE CLICK EASTER EGG =====
document.getElementById('terminal-title').addEventListener('click', () => {
  clickCount++;
  if (clickCount >= 5) {
    clickCount = 0;
    const terminal = document.getElementById('terminal');
    anime({
      targets: terminal,
      translateX: [{ value: 5, duration: 50 }, { value: -8, duration: 40 }, { value: 6, duration: 30 }, { value: -4, duration: 40 }, { value: 0, duration: 100 }],
      skewX: [{ value: 2, duration: 30 }, { value: -3, duration: 40 }, { value: 2, duration: 30 }, { value: 0, duration: 100 }],
      duration: 300, easing: 'linear'
    });
  }
});

// ===== COMMANDS =====
const cmds = {};

cmds.help = function() {
  const block = document.createElement('div');
  block.className = 'output-block help-box';
  let html = `<div class="ascii-divider">─── AVAILABLE COMMANDS ───</div>`;
  commandList.forEach(c => {
    const desc = cmdDescriptions[c] || '';
    const egg = c === 'matrix' || c === 'engine' || c === 'sudo';
    const cls = egg ? 'easter-egg' : 'desc';
    html += `<div class="help-line"><span class="cmd">${c.padEnd(12)}</span><span class="${cls}">${desc}</span></div>`;
  });
  html += `<div class="ascii-divider">──────────────────────────</div>`;
  block.innerHTML = html;
  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 400, easing: 'easeOutCubic' });
  scrollBottom();
};

cmds.whoami = function() {
  const id = 'about-' + Date.now();
  const block = document.createElement('div');
  block.className = 'output-block';
  block.id = id;
  block.innerHTML = `
<div class="ascii-divider">─── ◈ PROFILE ◈ ───</div>
<div class="about-block">
  <p><span class="em">Prateek Sharma</span> — cybersecurity & <span class="em">digital forensics</span> student at <span class="tech">VIT Bhopal</span>.</p>
  <p>I breathe <span class="em">Linux</span>. My terminal is my sanctuary, my shell is my weapon. From <span class="tech">OSINT</span> recon to <span class="tech">network security</span> hardening, from <span class="tech">cloud security</span> to <span class="tech">penetration testing</span> — I live in the grey areas of the digital world.</p>
  <p>Beyond the terminal, I bring the same precision to <span class="auto">automotive engineering</span> — deep knowledge of engines, chassis dynamics, and what makes a machine truly great. The <span class="auto">Lexus LFA</span> and its V10 symphony represent everything I respect: form, function, and raw craftsmanship. I'm also a <span class="auto">firearms enthusiast</span> with a focus on mechanics and ballistics, and maintain a broad curiosity that spans technology, engineering, and beyond.</p>
  <p><span class="em">Perfectionist.</span> <span class="em">Builder.</span> <span class="em">Root access to life.</span></p>
</div>
<div class="about-card-inline">
  <div class="avatar">PS</div>
  <h3>Prateek Sharma</h3>
  <div class="tagline">Cybersec • Forensics • Automotive</div>
  <div class="location">📍 VIT Bhopal</div>
</div>
<div class="ascii-divider">─────────────────────</div>`.trim();
  output.appendChild(block);

  const anims = [];
  block.querySelectorAll('.about-block p').forEach((p, i) => {
    anims.push(anime({ targets: p, opacity: [0, 1], translateY: [8, 0], duration: 500, delay: i * 120, easing: 'easeOutCubic' }));
  });
  const card = block.querySelector('.about-card-inline');
  if (card) {
    anims.push(anime({ targets: card, opacity: [0, 1], scale: [0.9, 1], duration: 500, delay: 500, easing: 'easeOutBack(1.7)' }));
  }

  scrollBottom();
};

cmds.skills = function() {
  const id = 'skills-' + Date.now();
  const block = document.createElement('div');
  block.className = 'output-block';
  block.id = id;
  block.innerHTML = `
<div class="ascii-divider">─── ◈ SKILL TREE ◈ ───</div>
<div class="skills-block">
  <div class="skills-category">
    <h3>🛡️ Cybersecurity</h3>
    ${mkSkill('OSINT', 88, 'red')}
    ${mkSkill('Network Security', 85, 'red')}
    ${mkSkill('Cloud Security', 78, 'cyan')}
    ${mkSkill('Digital Forensics', 90, 'red')}
    ${mkSkill('Penetration Testing', 82, 'green')}
    ${mkSkill('Web Security', 65, 'cyan')}
  </div>
  <div class="skills-category">
    <h3>🐧 System & Tech</h3>
    ${mkSkill('Linux Kung Fu', 95, 'green')}
    ${mkSkill('Python', 85, 'green')}
    ${mkSkill('Bash/Zsh', 92, 'green')}
    ${mkSkill('System Hardening', 86, 'red')}
    ${mkSkill('Networking', 80, 'cyan')}
  </div>
  <div class="skills-category">
    <h3>🏎️ Automotive & Beyond</h3>
    ${mkSkill('Car Engineering', 99, 'gold')}
    ${mkSkill('Engine Tech', 98, 'gold')}
    ${mkSkill('Firearms Knowledge', 90, 'gold')}
    ${mkSkill('Conversation', 95, 'cyan')}
    ${mkSkill('General Knowledge', 94, 'gold')}
  </div>
</div>
<div class="ascii-divider">─────────────────────</div>`.trim();
  output.appendChild(block);

  anime({
    targets: '#' + id + ' .skills-category',
    opacity: [0, 1], translateY: [12, 0],
    duration: 500, delay: anime.stagger(100), easing: 'easeOutCubic',
    begin: function() {
      setTimeout(() => {
        anime({
          targets: '#' + id + ' .skill-bar-fill',
          width: function(el) { return el.dataset.pct + '%'; },
          duration: 1000, delay: anime.stagger(30), easing: 'easeOutCubic'
        });
        anime({
          targets: '#' + id + ' .pct-num',
          innerHTML: function(el) {
            const bar = el.closest('.skill-item').querySelector('.skill-bar-fill');
            return bar ? parseInt(bar.dataset.pct) : 0;
          },
          duration: 1200, delay: anime.stagger(30), easing: 'easeOutQuad', round: 1
        });
      }, 300);
    }
  });

  scrollBottom();
};

function mkSkill(name, pct, color) {
  return `<div class="skill-item"><span class="skill-name">${name}</span><div class="skill-bar"><div class="skill-bar-fill ${color}" data-pct="${pct}"></div></div><span class="skill-pct"><span class="pct-num">0</span>%</span></div>`;
}

cmds.projects = function() {
  const id = 'proj-' + Date.now();
  const block = document.createElement('div');
  block.className = 'output-block';
  block.id = id;
  block.innerHTML = `
<div class="ascii-divider">─── ◈ PROJECTS ◈ ───</div>
<div class="projects-block">
  <div class="project-card featured">
    <span class="featured-badge">★ featured</span>
    <h3>hyprconf2lua</h3>
    <div class="project-desc">Convert Hyprland .conf to Lua for v0.55+ — ~97% auto-conversion, 0% guesswork. Used by the Omarchy community.</div>
    <div class="project-meta"><span class="lang">🐍 Python</span> &nbsp; <span class="stars">★ 15</span></div>
    <a class="project-link" href="https://github.com/Prateek-squadron/hyprconf2lua" target="_blank">▸ view on github</a>
  </div>
</div>
<div class="ascii-divider">─────────────────────</div>`.trim();
  output.appendChild(block);

  anime({
    targets: '#' + id + ' .project-card',
    opacity: [0, 1], translateY: [15, 0],
    duration: 600, delay: anime.stagger(100), easing: 'easeOutCubic'
  });

  scrollBottom();
};

cmds.contact = function() {
  const id = 'contact-' + Date.now();
  const block = document.createElement('div');
  block.className = 'output-block';
  block.id = id;
  block.innerHTML = `
<div class="ascii-divider">─── ◈ CONNECT ◈ ───</div>
<div class="contact-block">
  <div class="contact-row" data-copy="https://github.com/Prateek-squadron/">
    <span class="icon">🐙</span>
    <div><div class="handle">GitHub</div><div class="handle-url">github.com/Prateek-squadron</div></div>
  </div>
  <div class="contact-row" data-copy="https://www.linkedin.com/in/prateek-sharma-cyber/">
    <span class="icon">🔗</span>
    <div><div class="handle">LinkedIn</div><div class="handle-url">linkedin.com/in/prateek-sharma-cyber</div></div>
  </div>
  <div class="contact-row" data-copy="https://x.com/Prateek26087">
    <span class="icon">🐦</span>
    <div><div class="handle">X / Twitter</div><div class="handle-url">x.com/Prateek26087</div></div>
  </div>
  <div class="contact-row" data-copy="ferrarisf90stradale">
    <span class="icon">💬</span>
    <div><div class="handle">Discord</div><div class="handle-url">ferrarisf90stradale</div></div>
    <span class="copy-hint">click to copy</span>
  </div>
</div>
<div class="contact-email-block">
  <a href="mailto:ps.prateek1709@gmail.com"><span>✉</span> ps.prateek1709@gmail.com</a>
</div>
<div class="ascii-divider">─────────────────────</div>`.trim();
  output.appendChild(block);

  anime({
    targets: '#' + id + ' .contact-row',
    opacity: [0, 1], translateX: [-15, 0],
    duration: 500, delay: anime.stagger(80), easing: 'easeOutCubic'
  });
  anime({
    targets: '#' + id + ' .contact-email-block',
    opacity: [0, 1], translateY: [10, 0],
    duration: 400, delay: 500, easing: 'easeOutCubic'
  });

  block.querySelectorAll('.contact-row').forEach(row => {
    row.addEventListener('click', function() {
      const text = this.dataset.copy;
      navigator.clipboard.writeText(text).then(() => {
        const hint = this.querySelector('.copy-hint');
        if (hint) { hint.textContent = '✓ copied!'; hint.style.color = 'var(--green)'; }
        setTimeout(() => { if (hint) { hint.textContent = 'click to copy'; hint.style.color = ''; } }, 2000);
      });
    });
  });

  scrollBottom();
};

cmds.neofetch = function() {
  const block = document.createElement('div');
  block.className = 'output-block';
  block.innerHTML = `
<div class="info-box">
<span class="ascii-art">                   ./+o+-       </span><span class="info-key">patrixx</span>@<span class="info-key">portfolio</span>
<span class="ascii-art">           yyyyy- -yyyyyy+     </span><span class="info-key">OS</span>:       <span class="info-val">PATRIXX SHELL v2.0</span>
<span class="ascii-art">        yyy+ //:\\/:\\/:+yyy+   </span><span class="info-key">Host</span>:     <span class="info-val">Human (Cybersec Edition)</span>
<span class="ascii-art">      yyy-   .:+++//:-  .oyyy  </span><span class="info-key">Kernel</span>:   <span class="info-val">Linux 6.x (Hardened)</span>
<span class="ascii-art">     /y/   -://///+\://:   \yy  </span><span class="info-key">Uptime</span>:   <span class="info-val"><span id="live-uptime">calculating...</span></span>
<span class="ascii-art">    .y/    /+/-:/+/:///:    \\y. </span><span class="info-key">Shell</span>:    <span class="info-val">bash/zsh (dual wield)</span>
<span class="ascii-art">    /+    ./://-:://:-./:    \\+  </span><span class="info-key">Terminal</span>: <span class="info-val">Alacritty / Kitty</span>
<span class="ascii-art">   o+-   .::/+o+:-:+o+/-:.   -o  </span><span class="info-key">CPU</span>:      <span class="info-val">Neural Cortex (99th %ile)</span>
<span class="ascii-art">   y:    :.:.  .o/:...:/     :y  </span><span class="info-key">GPU</span>:      <span class="info-val">Imagination (Lexus LFA V10)</span>
<span class="ascii-art">  o-    ://:      .::///:-   -o  </span><span class="info-key">Memory</span>:  <span class="info-val">120TB (12TB active)</span>
<span class="ascii-art">  y:    .::/:      .:::::/.   :y  </span><span class="info-key">Skills</span>:   <span class="info-val">14 loaded</span>
<span class="ascii-art">  o-    .:///:           .::- -o  </span><span class="info-key">Discord</span>:  <span class="info-val">ferrarisf90stradale</span>
<span class="ascii-art">  y:     -::/:        .::::/.  y:  </span><span class="info-key">Email</span>:    <span class="info-val">ps.prateek1709@gmail.com</span>
<span class="ascii-art">  o-      -:/::.   .::::/:    o-  </span><span class="info-key">College</span>:  <span class="info-val">VIT Bhopal</span>
<span class="ascii-art">  y:        -:///::::://-     y:  </span><span class="info-gold">Auto</span>:     <span class="info-gold">GOD-tier</span>
<span class="ascii-art">  o+:.        -://///:-     .:+o   </span>
<span class="ascii-art">  .oyo:         .:::.      .:oyo.  </span>
<span class="ascii-art">   .oyo/-              -/+oyo.     </span>
<span class="ascii-art">     .+sso/:------:/+oss+-.        </span>
<span class="ascii-art">        .:+osssoossso+/:.          </span>
<span class="ascii-art">           \`.-:::-.\`               </span>
</div>`.trim();
  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 600, easing: 'easeOutCubic' });
  startLiveUptime();
  scrollBottom();
};

cmds.banner = function() {
  const block = document.createElement('div');
  block.className = 'output-block';
  block.innerHTML = `
<div class="welcome-banner">
<pre>
██████╗   █████╗  ████████╗ ██████╗  ██╗ ██╗  ██╗ ██╗  ██╗
██╔══██╗ ██╔══██╗ ╚══██╔══╝ ██╔══██╗ ██║ ╚██╗██╔╝ ╚██╗██╔╝
██████╔╝ ██████╔╝    ██║    ██████╔╝ ██║  ╚███╔╝   ╚███╔╝
██╔═══╝  ██╔══██╗    ██║    ██╔══██╗ ██║  ██╔██╗   ██╔██╗
██║      ██║  ██║    ██║    ██║  ██║ ██║ ██╔╝ ██╗ ██╔╝ ██╗
╚═╝      ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝
</pre>
<div class="welcome-line">PATRIXX SHELL <span class="hl-red">v2.0</span> — Type <span class="hl-cyan">help</span> to begin.</div>
</div>`.trim();
  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 500, easing: 'easeOutCubic' });
  scrollBottom();
};

cmds.date = function() {
  const d = new Date();
  const block = document.createElement('div');
  block.className = 'output-block';
  block.innerHTML = `<div style="color:var(--green);font-size:13px;padding:4px 0;">${d.toString()}</div>`;
  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 300, easing: 'easeOutCubic' });
  scrollBottom();
};

// ===== MATRIX RAIN =====
let matrixInterval;
cmds.matrix = function() {
  const canvas = document.getElementById('matrix-canvas');
  const mCtx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function drawMatrix() {
    mCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    mCtx.fillRect(0, 0, canvas.width, canvas.height);
    mCtx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      mCtx.fillStyle = Math.random() > 0.98 ? '#00f0ff' : '#e63946';
      mCtx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  clearInterval(matrixInterval);
  matrixInterval = setInterval(drawMatrix, 50);

  const block = document.createElement('div');
  block.className = 'output-block';
  block.innerHTML = `<div style="color:var(--gold);font-size:13px;padding:4px 0;">➜ Follow the white rabbit... 🐇</div>`;
  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 300, easing: 'easeOutCubic' });
  scrollBottom();

  setTimeout(() => {
    clearInterval(matrixInterval);
    canvas.classList.remove('active');
    mCtx.clearRect(0, 0, canvas.width, canvas.height);
  }, 15000);
};

cmds.engine = function() {
  const id = 'engine-' + Date.now();
  const block = document.createElement('div');
  block.className = 'output-block';
  block.id = id;
  block.innerHTML = `
<div style="background:var(--surface2);border:1px solid var(--red);border-radius:6px;padding:14px 18px;margin:4px 0;overflow:hidden;">
  <div style="color:var(--red);font-weight:700;margin-bottom:6px;text-align:center;letter-spacing:1px;">━━━ LEXUS LFA V10 ━━━</div>
  <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
    <pre style="color:var(--gold);font-size:11px;line-height:1.3;flex-shrink:0;">
  ╔══╗ ╔══╗ ╔══╗ ╔══╗ ╔══╗
  ║  ║ ║  ║ ║  ║ ║  ║ ║  ║
  ║  ║ ║  ║ ║  ║ ║  ║ ║  ║
  ║  ║ ║  ║ ║  ║ ║  ║ ║  ║
  ║  ║ ║  ║ ║  ║ ║  ║ ║  ║
  ╚══╝ ╚══╝ ╚══╝ ╚══╝ ╚══╝
      1-2-3-4-5-6-7-8-9-0
       V10 · 560 HP · 9K RPM
    </pre>
    <div style="flex:1;min-width:120px;">
      <div style="color:var(--text-dim);font-size:10px;margin-bottom:4px;">RPM</div>
      <div style="height:12px;background:rgba(255,255,255,0.05);border-radius:6px;overflow:hidden;">
        <div id="rpm-fill-${id}" style="height:100%;width:0%;background:linear-gradient(90deg,var(--green),var(--gold),var(--red));border-radius:6px;transition:none;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-dimmer);margin-top:2px;">
        <span>0</span>
        <span id="rpm-label-${id}" style="color:var(--cyan);font-weight:600;">0 RPM</span>
        <span>9000</span>
      </div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-dimmer);">
        <span style="color:var(--gold);">0-60:</span> 3.6s &nbsp;
        <span style="color:var(--gold);">Top:</span> 202 MPH &nbsp;
        <span style="color:var(--gold);">Sound:</span> Yamaha-tuned symphony
      </div>
    </div>
  </div>
  <div id="exhaust-${id}" style="text-align:center;margin-top:8px;font-size:12px;color:var(--text-dimmer);height:20px;"></div>
</div>`.trim();
  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 400, easing: 'easeOutCubic' });

  const rpmFill = document.getElementById('rpm-fill-' + id);
  const rpmLabel = document.getElementById('rpm-label-' + id);
  const exhaust = document.getElementById('exhaust-' + id);
  const terminal = document.getElementById('terminal');

  const revNotes = ['brmm', 'BRMM', 'BRMMM!', 'VROOOOM!', 'VROOOOOOM!!', 'VVRROOOOOOOM!!!', '🔥 V10 SCREAM 🔥'];
  const exhaustArts = [
    '  ══╗  ',
    ' ═══╗  ',
    ' ═══╗🔥',
    '🔥══╗🔥',
    '🔥🔥╗🔥🔥',
    '🔥🔥🔥🔥🔥🔥',
    '🔥🔥🔥🔥🔥🔥🔥'
  ];

  rpmFill.style.width = '0%';

  let rpm = 0;
  const rpmInterval = setInterval(() => {
    rpm += 300;
    if (rpm > 9500) rpm = 9500;
    const pct = (rpm / 9000) * 100;
    rpmFill.style.width = Math.min(pct, 100) + '%';
    rpmLabel.textContent = rpm + ' RPM';

    const noteIdx = Math.min(Math.floor(rpm / 1500), revNotes.length - 1);
    const exhIdx = Math.min(Math.floor(rpm / 1500), exhaustArts.length - 1);
    exhaust.textContent = revNotes[noteIdx] || '';
    exhaust.style.color = rpm > 7000 ? 'var(--red)' : rpm > 4000 ? 'var(--gold)' : 'var(--text-dim)';
  }, 100);

  anime({
    targets: terminal,
    translateX: [
      { value: 2, duration: 40 }, { value: -3, duration: 35 }, { value: 4, duration: 30 },
      { value: -4, duration: 35 }, { value: 3, duration: 30 }, { value: -2, duration: 35 },
      { value: 5, duration: 25 }, { value: -5, duration: 25 }, { value: 6, duration: 20 },
      { value: -6, duration: 20 }, { value: 4, duration: 25 }, { value: -3, duration: 25 },
      { value: 5, duration: 20 }, { value: -5, duration: 20 }, { value: 3, duration: 25 },
      { value: -2, duration: 30 }, { value: 2, duration: 35 }, { value: -1, duration: 40 },
      { value: 0, duration: 50 }
    ],
    translateY: [
      { value: 1, duration: 30 }, { value: -2, duration: 30 }, { value: 2, duration: 25 },
      { value: -2, duration: 25 }, { value: 3, duration: 20 }, { value: -3, duration: 20 },
      { value: 2, duration: 25 }, { value: -2, duration: 25 }, { value: 1, duration: 30 },
      { value: -1, duration: 30 }, { value: 0, duration: 40 }
    ],
    duration: 2500,
    easing: 'linear'
  });

  setTimeout(() => {
    clearInterval(rpmInterval);
    let cooldown = 9500;
    const coolInterval = setInterval(() => {
      cooldown -= 400;
      if (cooldown <= 0) { clearInterval(coolInterval); rpmLabel.textContent = 'IDLE'; exhaust.textContent = '▁▁▁▁▁▁▁▁▁▁'; rpmFill.style.width = '0%'; }
      else {
        rpmFill.style.width = (cooldown / 9000) * 100 + '%';
        rpmLabel.textContent = Math.round(cooldown) + ' RPM';
        exhaust.textContent = '▁'.repeat(Math.round(cooldown / 1000) + 1);
      }
    }, 80);
  }, 2800);

  scrollBottom();
};

cmds.gun = function(count) {
  const id = 'gun-' + Date.now();
  const numShots = Math.min(Math.max(parseInt(count) || 6, 1), 20);
  const block = document.createElement('div');
  block.className = 'output-block';
  block.id = id;
  block.innerHTML = `
<div style="background:var(--surface2);border:1px solid var(--gold);border-radius:6px;padding:14px 18px;margin:4px 0;">
  <div style="color:var(--gold);font-weight:700;margin-bottom:8px;text-align:center;">━━━ COLT 1911 .45 ACP ━━━</div>
  <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
    <pre style="color:var(--text-dim);font-size:10px;line-height:1.2;flex-shrink:0;">
       ___________
      /__________/|
     |  _______  ||
     | |       | ||
     | |  LOAD | ||
     | |_______| ||
     |___________|/
      \\_________/ 
       | |   | |
       | |   | |
    ___|_|___|_|___
   /_______________/
   \\_______________/
    </pre>
    <div style="flex:1;min-width:160px;">
      <div style="color:var(--red);font-size:11px;margin-bottom:6px;">
        <span style="color:var(--gold);">Caliber:</span> .45 ACP &nbsp;
        <span style="color:var(--gold);">Capacity:</span> 7+1 &nbsp;
        <span style="color:var(--gold);">Action:</span> Single-action semi-auto
      </div>
      <div style="font-size:10px;color:var(--text-dimmer);margin-bottom:6px;">MAG: <span id="mag-${id}" style="color:var(--green);font-weight:600;">${numShots}</span> / ${numShots}</div>
      <div id="bullet-area-${id}" style="min-height:120px;position:relative;font-size:14px;line-height:1.6;font-family:monospace;overflow:hidden;"></div>
    </div>
  </div>
  <div style="margin-top:6px;font-size:10px;color:var(--text-dimmer);text-align:center;">
    Type <span style="color:var(--cyan);">shoot [count]</span> to fire more, or <span style="color:var(--cyan);">gun</span> to reload
  </div>
</div>`.trim();
  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 400, easing: 'easeOutCubic' });

  const bulletArea = document.getElementById('bullet-area-' + id);
  const magEl = document.getElementById('mag-' + id);
  const terminal = document.getElementById('terminal');
  let shotsFired = 0;

  function fireShot() {
    if (shotsFired >= numShots) {
      const emptyLine = document.createElement('div');
      emptyLine.style.cssText = 'color:var(--red);font-size:13px;padding:4px 0;';
      emptyLine.textContent = '🔴 CLICK! — Magazine empty. Type gun to reload.';
      bulletArea.appendChild(emptyLine);
      bulletArea.scrollTop = bulletArea.scrollHeight;
      return;
    }
    shotsFired++;
    magEl.textContent = numShots - shotsFired;

    const shotLine = document.createElement('div');
    shotLine.style.cssText = 'font-size:12px;padding:2px 0;white-space:nowrap;';
    shotLine.innerHTML = `<span style="color:var(--gold);">●</span> <span style="color:var(--text-dim);">shot ${shotsFired}/${numShots}</span> `;
    const bullet = document.createElement('span');
    bullet.textContent = ' ';
    shotLine.appendChild(bullet);
    bulletArea.appendChild(shotLine);
    bulletArea.scrollTop = bulletArea.scrollHeight;

    const shellLine = document.createElement('div');
    shellLine.style.cssText = 'font-size:10px;color:var(--gold);padding:0 0 4px 12px;';
    shellLine.textContent = '  ○ shell ejected';
    shellLine.style.opacity = '0';
    bulletArea.appendChild(shellLine);

    anime({
      targets: bullet,
      textContent: ['', '>'],
      duration: 50,
      easing: 'linear',
      update: function(anim) {
        const p = Math.round(anim.progress);
        const len = Math.floor(p / 5);
        const trail = '='.repeat(Math.min(len, 20));
        const head = p >= 95 ? '●' : '>';
        bullet.textContent = trail + head;
        if (p >= 95) bullet.style.color = 'var(--red)';
        else if (p > 50) bullet.style.color = 'var(--gold)';
        else bullet.style.color = 'var(--green)';
      },
      complete: function() {
        bullet.textContent = '════════════════════●';
        bullet.style.color = 'var(--red)';
        shotLine.innerHTML = shotLine.innerHTML.replace('<span>', '<span style="color:var(--red);">');
        shotLine.querySelector('span:first-child').style.color = 'var(--red)';

        anime({ targets: shellLine, opacity: [0, 1], translateX: [5, 0], duration: 200, easing: 'easeOutCubic' });
        setTimeout(() => { shellLine.textContent = '  ○ — spent'; shellLine.style.color = 'var(--text-dimmer)'; }, 600);
      }
    });

    anime({
      targets: terminal,
      translateX: [
        { value: shotsFired % 2 === 0 ? 4 : -4, duration: 30 },
        { value: shotsFired % 2 === 0 ? -3 : 3, duration: 25 },
        { value: shotsFired % 2 === 0 ? 2 : -2, duration: 20 },
        { value: 0, duration: 40 }
      ],
      translateY: [
        { value: 2, duration: 20 },
        { value: -1, duration: 20 },
        { value: 0, duration: 30 }
      ],
      duration: 120,
      easing: 'linear'
    });
  }

  const fireInterval = setInterval(fireShot, 350);
  setTimeout(() => clearInterval(fireInterval), numShots * 350 + 200);

  scrollBottom();
};

cmds.sudo = function() {
  const block = document.createElement('div');
  block.className = 'output-block';
  block.innerHTML = `
<div style="color:var(--red);background:var(--surface2);border:1px solid var(--red);border-radius:6px;padding:12px 16px;margin:4px 0;">
  <div style="font-size:24px;text-align:center;margin-bottom:4px;">⛔</div>
  <div style="text-align:center;font-weight:600;font-size:14px;">ACCESS DENIED</div>
  <div style="text-align:center;font-size:12px;color:var(--text-dim);">
    Prateek is ALREADY root.<br>You don't get to be root.
  </div>
</div>`.trim();
  output.appendChild(block);
  anime({ targets: block, opacity: [0, 1], duration: 400, easing: 'easeOutCubic' });
  scrollBottom();
};

cmds.clear = function() {
  output.innerHTML = '';
  suggestions.classList.remove('show');
  scrollBottom();
};

// ===== COMMAND DISPATCH =====
function dispatchCmd(cmd) {
  const trimmed = cmd.trim().toLowerCase();
  if (!trimmed) return;
  echoCmd(trimmed);
  if (cmds[trimmed]) {
    setTimeout(() => cmds[trimmed](), 150);
  } else if (trimmed === 'shoot' || trimmed === 'fire') {
    setTimeout(() => cmds.gun(), 150);
  } else if (trimmed.startsWith('shoot ') || trimmed.startsWith('fire ')) {
    const n = trimmed.split(' ')[1];
    setTimeout(() => cmds.gun(n), 150);
  } else if (trimmed.startsWith('gun ')) {
    const n = trimmed.split(' ')[1];
    setTimeout(() => cmds.gun(n), 150);
  } else if (trimmed.startsWith('sudo ')) {
    setTimeout(() => cmds.sudo(), 150);
  } else {
    const errBlock = document.createElement('div');
    errBlock.className = 'output-block';
    errBlock.innerHTML = `<div style="color:var(--red);font-size:13px;padding:2px 0;">bash: ${trimmed}: command not found. Try 'help'.</div>`;
    output.appendChild(errBlock);
    anime({ targets: errBlock, opacity: [0, 1], duration: 200, easing: 'easeOutCubic' });
    scrollBottom();
  }
  suggestions.classList.remove('show');
}

// ===== INPUT HANDLING =====
cmdInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = cmdInput.value.trim();
    if (val) {
      history.push(val);
      historyIdx = history.length;
      cmdInput.value = '';
      dispatchCmd(val);
    }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    const partial = cmdInput.value.trim().toLowerCase();
    const matches = partial ? commandList.filter(c => c.startsWith(partial)) : commandList;
    if (matches.length === 1) {
      cmdInput.value = matches[0];
      suggestions.classList.remove('show');
    } else if (matches.length > 1) {
      if (!suggestions.classList.contains('show')) {
        suggestIdx = 0;
        showSuggestions(matches);
      } else {
        suggestIdx = (suggestIdx + 1) % matches.length;
        highlightSuggestion(matches);
      }
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (history.length > 0) {
      historyIdx = Math.max(0, historyIdx - 1);
      cmdInput.value = history[historyIdx];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIdx < history.length - 1) {
      historyIdx++;
      cmdInput.value = history[historyIdx];
    } else {
      historyIdx = history.length;
      cmdInput.value = '';
    }
  } else if (e.key === 'Escape') {
    suggestions.classList.remove('show');
    cmdInput.focus();
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    output.innerHTML = '';
  } else {
    if (suggestions.classList.contains('show')) suggestions.classList.remove('show');
  }
});

cmdInput.addEventListener('input', () => {
  suggestions.classList.remove('show');
});

function showSuggestions(matches) {
  suggestions.innerHTML = '';
  suggestions.classList.add('show');
  matches.forEach((m, i) => {
    const row = document.createElement('div');
    row.className = 'suggestion-row' + (i === suggestIdx ? ' highlighted' : '');
    row.innerHTML = `<span class="s-cmd">${m}</span>  <span class="s-desc">${cmdDescriptions[m] || ''}</span>`;
    row.addEventListener('click', () => {
      cmdInput.value = m;
      suggestions.classList.remove('show');
      cmdInput.focus();
    });
    row.addEventListener('mouseenter', () => {
      suggestIdx = i;
      highlightSuggestion(matches);
    });
    suggestions.appendChild(row);
  });
}

function highlightSuggestion(matches) {
  const rows = suggestions.querySelectorAll('.suggestion-row');
  rows.forEach((r, i) => r.classList.toggle('highlighted', i === suggestIdx));
  if (rows[suggestIdx]) rows[suggestIdx].scrollIntoView({ block: 'nearest' });
}

// ===== 3D CARD TILT =====
document.addEventListener('mouseover', e => {
  const card = e.target.closest('.project-card');
  if (!card) return;
  const handleMove = (ev) => {
    const rect = card.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const rotateX = (y - rect.height / 2) / 10;
    const rotateY = (rect.width / 2 - x) / 10;
    card.style.transform = `perspective(800px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  };
  const handleLeave = () => {
    card.removeEventListener('mousemove', handleMove);
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    card.style.transition = 'transform 0.4s ease';
  };
  card.addEventListener('mousemove', handleMove);
  card.addEventListener('mouseleave', handleLeave, { once: true });
});

// ===== PARTICLES =====
function initParticles() {
  const count = 70;
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * particleCanvas.width,
      y: Math.random() * particleCanvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.4 + 0.1
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = particleCanvas.width;
    if (p.x > particleCanvas.width) p.x = 0;
    if (p.y < 0) p.y = particleCanvas.height;
    if (p.y > particleCanvas.height) p.y = 0;
    const dx = mouse.x - p.x, dy = mouse.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) { p.x -= dx * 0.003; p.y -= dy * 0.003; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(230, 57, 70, ${p.alpha})`;
    ctx.fill();
  });
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(230, 57, 70, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  animFrame = requestAnimationFrame(drawParticles);
}

function startParticles() {
  initParticles();
  drawParticles();
}

// ===== MOUSE TRAIL =====
const trail = document.createElement('div');
trail.style.cssText = 'position:fixed;width:6px;height:6px;border-radius:50%;pointer-events:none;z-index:9999;background:rgba(230,57,70,0.25);box-shadow:0 0 12px rgba(230,57,70,0.15);transition:all 0.15s ease;';
trail.style.display = 'none';
document.body.appendChild(trail);
document.addEventListener('mousemove', e => {
  trail.style.display = 'block';
  trail.style.left = (e.clientX - 3) + 'px';
  trail.style.top = (e.clientY - 3) + 'px';
});
document.addEventListener('mouseleave', () => { trail.style.display = 'none'; });

// ===== INIT =====
window.addEventListener('load', () => {
  setTimeout(runBootSequence, 300);
});
})();