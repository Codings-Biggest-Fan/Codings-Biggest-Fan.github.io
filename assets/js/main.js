const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const WORKSPACES = 5;
const GAP_IN = 10;
const GAP_OUT = 14;
const MOBILE = () => window.innerWidth < 760;

const APPS = {
  terminal: { name: 'Terminal', title: 'kitty', icon: 'terminal', multi: true, desc: 'zsh in kitty', render: renderTerminal },
  about: { name: 'About me', title: 'nvim ~/about.md', icon: 'user', desc: 'who I am', render: renderAbout },
  projects: { name: 'Projects', title: 'Files — ~/projects', icon: 'folder', desc: 'things I\'ve built', render: renderProjects },
  skills: { name: 'Skills', title: 'btop', icon: 'activity', desc: 'languages and tools', render: renderSkills },
  contact: { name: 'Contact', title: 'contact', icon: 'mail', desc: 'find me online', render: renderContact },
};

/* ---------- apps ---------- */

function renderTerminal(body, win, arg) {
  body.classList.add('term');
  win.term = new Terminal(body, wm, { autorun: arg });
  if (arg === 'neofetch') {
    win.term.print(`<span class="c-dim">${esc(PROFILE.tagline)}</span>`);
    win.term.print('<span class="c-dim">type <span class="c-cyan">help</span> for commands, or <span class="c-cyan">projects</span> to see what I\'ve built</span>');
  }
  win.focusTarget = () => win.term.input.focus({ preventScroll: true });
}

function renderAbout(body) {
  body.classList.add('nvim');
  const md = [
    `# ${PROFILE.name}`,
    `> ${PROFILE.tagline}`,
    '',
    ...PROFILE.about.flatMap((p) => [p, '']),
    '## Currently working on',
    ...PROFILE.now.map((n) => `- ${n}`),
    '',
    '## Find me',
    `- GitHub: [@${PROFILE.handle}](${PROFILE.github})`,
    `- Robotics: [${PROFILE.team.name}](${PROFILE.team.url})`,
  ];
  const fmt = (line) => {
    let h = esc(line).replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    if (line.startsWith('# ')) return `<span class="md-h1">${h}</span>`;
    if (line.startsWith('## ')) return `<span class="md-h2">${h}</span>`;
    if (line.startsWith('> ')) return `<span class="md-quote">${h}</span>`;
    if (line.startsWith('- ')) return `<span class="md-bullet">-</span>${h.slice(1)}`;
    return h;
  };
  body.innerHTML = `
    <div class="nvim-buf">
      <div class="avatar-big" aria-hidden="true">AS</div>
      ${md.map((l, i) => `<div class="nvim-line"><span class="ln">${i + 1}</span><span class="txt">${fmt(l) || '&nbsp;'}</span></div>`).join('')}
      <div class="nvim-line tilde"><span class="ln">~</span></div>
    </div>
    <div class="nvim-status"><span class="mode">NORMAL</span><span class="file">about.md</span><span class="sp"></span><span>markdown</span><span>utf-8</span><span class="pos">${md.length}:1</span></div>`;
}

function renderProjects(body, win, arg) {
  body.innerHTML = `<div class="files">
    <aside class="files-side">
      <div class="side-h">Places</div>
      <a href="${PROFILE.github}" target="_blank" rel="noopener">${icon('home')} GitHub</a>
      <div class="side-h">Projects</div>
      ${PROJECTS.map((p) => `<button type="button" data-id="${p.id}">${icon(p.icon)} <span>${esc(p.name)}</span></button>`).join('')}
    </aside>
    <section class="files-main"></section></div>`;
  const main = $('.files-main', body);
  const select = (id) => {
    const p = PROJECTS.find((x) => x.id === id) || PROJECTS[0];
    $$('.files-side button', body).forEach((b) => b.classList.toggle('sel', b.dataset.id === p.id));
    main.innerHTML = `
      <div class="crumbs">~ / projects / <b>${p.id}</b></div>
      <div class="proj-head">
        <div class="proj-icon">${icon(p.icon)}</div>
        <div><h2>${esc(p.name)}</h2><p class="proj-tag">${esc(p.tagline)}</p></div>
      </div>
      <div class="chips">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}<span class="chip status">${esc(p.status)}</span></div>
      ${p.description.map((d) => `<p>${esc(d)}</p>`).join('')}
      <div class="proj-links">${p.links.map((l) => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${icon(l.icon)} ${esc(l.label)}</a>`).join('')}</div>`;
    main.scrollTop = 0;
    win.subtitle = `~/projects/${p.id}`;
    wm.updateTitle();
  };
  body.addEventListener('click', (e) => { const b = e.target.closest('.files-side button'); if (b) select(b.dataset.id); });
  win.api = { select };
  select(arg);
}

function renderSkills(body, win) {
  body.classList.add('btop');
  const bars = (list) => list.map(([n, v]) => `
    <div class="skill"><span class="sk-name">${esc(n)}</span><span class="sk-bar"><i style="--v:${v}%"></i></span><span class="sk-val">${v}</span></div>`).join('');
  body.innerHTML = `
    <div class="bt-box bt-graph"><span class="bt-label">¹cpu</span><div class="graph"></div><div class="graph-meta"><span>commits/week, probably</span><b class="g-val">0%</b></div></div>
    <div class="bt-box"><span class="bt-label">²languages</span>${bars(SKILLS.languages)}</div>
    <div class="bt-box"><span class="bt-label">³tools</span>${bars(SKILLS.tools)}</div>
    <div class="bt-box bt-proc"><span class="bt-label">⁴proc</span>
      <div class="proc-row head"><span>pid</span><span>program</span><span>status</span><span>cpu%</span></div>
      ${PROJECTS.map((p, i) => `<div class="proc-row" data-id="${p.id}"><span>${1150 + i * 37}</span><span>${esc(p.id)}</span><span class="c-dim">${esc(p.status.split(' · ')[0])}</span><span class="cpu-val">0.0</span></div>`).join('')}
    </div>`;
  const graph = $('.graph', body);
  const vals = Array.from({ length: 48 }, () => 20 + Math.random() * 50);
  graph.innerHTML = vals.map(() => '<i></i>').join('');
  const tick = () => {
    if (!document.body.contains(body)) return clearInterval(win.timer);
    vals.shift(); vals.push(Math.max(5, Math.min(95, vals[vals.length - 1] + (Math.random() - 0.5) * 30)));
    $$('i', graph).forEach((b, i) => { b.style.height = vals[i] + '%'; });
    $('.g-val', body).textContent = Math.round(vals[vals.length - 1]) + '%';
    $$('.cpu-val', body).forEach((c) => { c.textContent = (Math.random() * (c.parentElement.dataset.id === 'kestrel' ? 3 : 12)).toFixed(1); });
  };
  tick();
  win.timer = setInterval(tick, 1000);
  body.addEventListener('click', (e) => { const r = e.target.closest('.proc-row[data-id]'); if (r) wm.open('projects', r.dataset.id); });
}

function renderContact(body) {
  body.classList.add('contact');
  const items = [
    { icon: 'github', label: 'GitHub', sub: `@${PROFILE.handle}`, url: PROFILE.github },
    { icon: 'user', label: 'Alt account', sub: '@sharma-adit', url: PROFILE.alt },
    { icon: 'robot', label: 'Robotics team', sub: PROFILE.team.name, url: PROFILE.team.url },
    { icon: 'fan', label: 'Kestrel', sub: 'issues and ideas welcome', url: 'https://github.com/Codings-Biggest-Fan/kestrel/issues' },
  ];
  body.innerHTML = `
    <div class="contact-head"><div class="avatar">A</div><div><h2>${esc(PROFILE.name)}</h2><p>Want to collaborate on a game or an app? Reach out.</p></div></div>
    <div class="contact-list">${items.map((i) => `<a href="${i.url}" target="_blank" rel="noopener">${icon(i.icon)}<span><b>${esc(i.label)}</b><small>${esc(i.sub)}</small></span>${icon('link', 'ext')}</a>`).join('')}</div>
    <div class="contact-now"><h3>${icon('star')} now playing in my editor</h3><ul>${PROFILE.now.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`;
}

/* ---------- window manager ---------- */

const wm = {
  wins: new Map(),
  ws: Object.fromEntries(Array.from({ length: WORKSPACES }, (_, i) => [i + 1, []])),
  current: 1,
  focused: null,
  seq: 0,
  bootTime: Date.now(),

  init() {
    this.area = $('#workspace-area');
    for (let i = 1; i <= WORKSPACES; i++) {
      const d = document.createElement('div');
      d.className = 'ws' + (i === 1 ? ' active' : '');
      d.dataset.ws = i;
      this.area.appendChild(d);
    }
    new ResizeObserver(() => this.layout()).observe(this.area);
    this.renderWorkspaces();
    this.renderDock();
  },

  open(appId, arg) {
    const app = APPS[appId];
    if (!app) return;
    if (!app.multi) {
      const existing = [...this.wins.values()].find((w) => w.app === appId);
      if (existing) {
        this.switchWs(existing.ws);
        this.focus(existing.id);
        if (arg && existing.api && existing.api.select) existing.api.select(arg);
        return existing;
      }
    }
    return this.create(appId, arg, this.current);
  },

  create(appId, arg, ws) {
    const app = APPS[appId];
    const id = `w${++this.seq}`;
    const el = document.createElement('section');
    el.className = 'win opening';
    el.dataset.id = id;
    el.setAttribute('aria-label', app.name);
    el.innerHTML = `
      <div class="win-bar">
        <span class="win-title">${icon(app.icon)}<span class="t"></span></span>
        <span class="win-ctl">
          <button type="button" class="ctl max" title="Fullscreen (Alt+F)" aria-label="Fullscreen">${icon('max')}</button>
          <button type="button" class="ctl close" title="Close (Alt+Q)" aria-label="Close">${icon('x')}</button>
        </span>
      </div>
      <div class="win-body"></div>`;
    const win = { id, app: appId, el, ws, subtitle: '' };
    this.wins.set(id, win);
    this.ws[ws].push(id);
    $(`.ws[data-ws="${ws}"]`, this.area).appendChild(el);
    app.render($('.win-body', el), win, arg);
    $('.t', el).textContent = app.title;
    el.addEventListener('mousedown', () => this.focus(id));
    $('.close', el).addEventListener('click', (e) => { e.stopPropagation(); this.close(id); });
    $('.max', el).addEventListener('click', (e) => { e.stopPropagation(); this.toggleFull(id); });
    $('.win-bar', el).addEventListener('dblclick', () => this.toggleFull(id));
    this.enableDragSwap(win);
    this.layout();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('opening')));
    if (ws === this.current) this.focus(id);
    this.renderWorkspaces();
    this.renderDock();
    return win;
  },

  close(id) {
    const win = this.wins.get(id);
    if (!win) return;
    clearInterval(win.timer);
    win.el.classList.add('closing');
    this.ws[win.ws] = this.ws[win.ws].filter((x) => x !== id);
    this.wins.delete(id);
    if (this.fullId === id) this.fullId = null;
    setTimeout(() => win.el.remove(), 180);
    if (this.focused === id) {
      const rest = this.ws[this.current];
      this.focused = null;
      if (rest.length) this.focus(rest[rest.length - 1]);
    }
    this.layout();
    this.updateTitle();
    this.renderWorkspaces();
    this.renderDock();
  },

  closeTerminal(term) {
    const w = [...this.wins.values()].find((x) => x.term === term);
    if (w) this.close(w.id);
  },

  focus(id) {
    const win = this.wins.get(id);
    if (!win) return;
    this.focused = id;
    $$('.win', this.area).forEach((el) => el.classList.toggle('focused', el.dataset.id === id));
    if (MOBILE()) this.layout();
    if (win.focusTarget && !MOBILE()) win.focusTarget();
    this.updateTitle();
  },

  cycle(dir) {
    const list = this.ws[this.current];
    if (!list.length) return;
    const i = list.indexOf(this.focused);
    this.focus(list[(i + dir + list.length) % list.length]);
  },

  toggleFull(id = this.focused) {
    if (!id) return;
    this.fullId = this.fullId === id ? null : id;
    this.layout();
  },

  switchWs(n) {
    if (n === this.current || !this.ws[n]) return;
    const dir = n > this.current ? 1 : -1;
    $$('.ws', this.area).forEach((d) => {
      const k = +d.dataset.ws;
      d.classList.toggle('active', k === n);
      d.style.setProperty('--dir', k < n ? -1 : 1);
    });
    this.current = n;
    this.fullId = null;
    const list = this.ws[n];
    this.focused = null;
    if (list.length) this.focus(list[list.length - 1]);
    this.layout();
    this.updateTitle();
    this.renderWorkspaces();
    void dir;
  },

  layout() {
    if (!this.area) return;
    const W = this.area.clientWidth;
    const H = this.area.clientHeight;
    for (let n = 1; n <= WORKSPACES; n++) {
      const list = this.ws[n];
      if (!list.length) continue;
      const rects = [];
      const mobile = MOBILE();
      if (mobile) {
        list.forEach((id) => rects.push([id, 0, 0, W, H]));
      } else if (this.fullId && list.includes(this.fullId)) {
        list.forEach((id) => rects.push([id, 0, 0, W, H]));
      } else {
        const o = GAP_OUT - GAP_IN / 2;
        dwindle(o, o, W - 2 * o, H - 2 * o, list, rects);
      }
      rects.forEach(([id, x, y, w, h]) => {
        const win = this.wins.get(id);
        const inset = mobile || (this.fullId && list.includes(this.fullId)) ? GAP_OUT / 2 : GAP_IN / 2;
        const hidden = (mobile && id !== this.focusedIn(n)) || (this.fullId && list.includes(this.fullId) && id !== this.fullId);
        Object.assign(win.el.style, { left: `${x + inset}px`, top: `${y + inset}px`, width: `${w - 2 * inset}px`, height: `${h - 2 * inset}px` });
        win.el.classList.toggle('hidden', !!hidden);
        win.el.classList.toggle('full', this.fullId === id);
      });
    }
  },

  focusedIn(n) {
    const list = this.ws[n];
    return list.includes(this.focused) ? this.focused : list[list.length - 1];
  },

  enableDragSwap(win) {
    const bar = $('.win-bar', win.el);
    bar.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.ctl') || MOBILE()) return;
      const startX = e.clientX; const startY = e.clientY;
      let dragging = false;
      const move = (ev) => {
        if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) { dragging = true; win.el.classList.add('dragging'); }
        if (!dragging) return;
        win.el.style.transform = `translate(${ev.clientX - startX}px, ${ev.clientY - startY}px)`;
        $$('.win', this.area).forEach((w) => w.classList.remove('drop-target'));
        const target = this.winAt(ev.clientX, ev.clientY, win.id);
        if (target) target.el.classList.add('drop-target');
      };
      const up = (ev) => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        win.el.classList.remove('dragging');
        win.el.style.transform = '';
        $$('.win', this.area).forEach((w) => w.classList.remove('drop-target'));
        if (!dragging) return;
        const target = this.winAt(ev.clientX, ev.clientY, win.id);
        if (target) {
          const list = this.ws[win.ws];
          const a = list.indexOf(win.id); const b = list.indexOf(target.id);
          [list[a], list[b]] = [list[b], list[a]];
          this.layout();
        }
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
  },

  winAt(x, y, exclude) {
    return this.ws[this.current].map((id) => this.wins.get(id)).find((w) => {
      if (w.id === exclude) return false;
      const r = w.el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
  },

  updateTitle() {
    const w = this.wins.get(this.focused);
    const t = w ? (w.subtitle ? `${APPS[w.app].title.split(' — ')[0]} — ${w.subtitle}` : APPS[w.app].title) : `workspace ${this.current}`;
    $('#active-title').textContent = t;
    if (w) $('.t', w.el).textContent = t;
  },

  renderWorkspaces() {
    const nav = $('#workspaces');
    nav.innerHTML = '';
    for (let i = 1; i <= WORKSPACES; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = i;
      b.className = (i === this.current ? 'active ' : '') + (this.ws[i].length ? 'occupied' : '');
      b.title = `Workspace ${i} (Alt+${i})`;
      b.addEventListener('click', () => this.switchWs(i));
      nav.appendChild(b);
    }
  },

  renderDock() {
    const dock = $('#dock');
    const open = new Set([...this.wins.values()].map((w) => w.app));
    dock.innerHTML = Object.entries(APPS).map(([id, a]) =>
      `<button type="button" data-app="${id}" class="${open.has(id) ? 'open' : ''}" title="${a.name}" aria-label="${a.name}">${icon(a.icon)}</button>`).join('') +
      `<span class="dock-sep"></span><a href="${PROFILE.github}" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub">${icon('github')}</a>`;
    $$('button', dock).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.app;
      if (id === 'terminal' && open.has('terminal')) {
        const t = [...this.wins.values()].find((w) => w.app === 'terminal' && w.ws === this.current);
        if (t) return this.focus(t.id);
        const any = [...this.wins.values()].find((w) => w.app === 'terminal');
        this.switchWs(any.ws); return this.focus(any.id);
      }
      this.open(id);
    }));
  },

  reboot() {
    sessionStorage.removeItem('booted');
    location.reload();
  },

  shutdown() {
    $('#desktop').hidden = true;
    $('#halted').hidden = false;
  },
};

function dwindle(x, y, w, h, list, out) {
  if (!list.length) return;
  if (list.length === 1) { out.push([list[0], x, y, w, h]); return; }
  if (w >= h) {
    const w1 = Math.round(w / 2);
    out.push([list[0], x, y, w1, h]);
    dwindle(x + w1, y, w - w1, h, list.slice(1), out);
  } else {
    const h1 = Math.round(h / 2);
    out.push([list[0], x, y, w, h1]);
    dwindle(x, y + h1, w, h - h1, list.slice(1), out);
  }
}

/* ---------- launcher ---------- */

const launcher = {
  items: [],
  sel: 0,
  init() {
    this.el = $('#launcher');
    this.input = $('#launcher-input');
    this.list = $('#launcher-list');
    this.all = [
      ...Object.entries(APPS).map(([id, a]) => ({ label: a.name, sub: a.desc, icon: a.icon, run: () => wm.open(id) })),
      ...PROJECTS.map((p) => ({ label: p.name, sub: p.tagline, icon: p.icon, run: () => wm.open('projects', p.id) })),
      { label: 'GitHub profile', sub: PROFILE.github.replace('https://', ''), icon: 'github', run: () => window.open(PROFILE.github, '_blank', 'noopener') },
      { label: 'Lock screen', sub: 'hyprlock', icon: 'lock', run: () => power('lock') },
      { label: 'Reboot', sub: 'watch it boot again', icon: 'reboot', run: () => power('reboot') },
    ];
    this.input.addEventListener('input', () => { this.sel = 0; this.render(); });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); this.move(1); }
      else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) { e.preventDefault(); this.move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); this.launch(this.sel); }
      else if (e.key === 'Escape') { this.hide(); }
    });
    this.el.addEventListener('mousedown', (e) => { if (e.target === this.el) this.hide(); });
    this.list.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) this.launch(+li.dataset.i); });
  },
  render() {
    const q = this.input.value.trim().toLowerCase();
    this.items = this.all.filter((i) => !q || (i.label + ' ' + i.sub).toLowerCase().includes(q));
    this.list.innerHTML = this.items.map((i, n) => `<li data-i="${n}" class="${n === this.sel ? 'sel' : ''}" role="option">${icon(i.icon)}<span><b>${esc(i.label)}</b><small>${esc(i.sub)}</small></span></li>`).join('') || '<li class="empty">no matches</li>';
  },
  move(d) { if (!this.items.length) return; this.sel = (this.sel + d + this.items.length) % this.items.length; this.render(); $('.sel', this.list)?.scrollIntoView({ block: 'nearest' }); },
  launch(i) { const it = this.items[i]; if (!it) return; this.hide(); it.run(); },
  show() { this.el.hidden = false; this.input.value = ''; this.sel = 0; this.render(); this.input.focus(); },
  hide() { this.el.hidden = true; const w = wm.wins.get(wm.focused); if (w && w.focusTarget) w.focusTarget(); },
  toggle() { this.el.hidden ? this.show() : this.hide(); },
};

/* ---------- power / lock / toasts / bar ---------- */

function power(action) {
  $('#powermenu').hidden = true;
  if (action === 'lock') { $('#lock').hidden = false; $('#lock-input').value = ''; setTimeout(() => $('#lock-input').focus(), 50); }
  else if (action === 'reboot') wm.reboot();
  else if (action === 'shutdown') wm.shutdown();
}

function toast(title, body, ms = 8000) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<b>${title}</b><p>${body}</p>`;
  t.addEventListener('click', () => t.remove());
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, ms);
}

function startBar() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const d = new Date();
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    $('#clock').textContent = `${time} • ${days[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    $('#lock-time').textContent = time;
    $('#lock-date').textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };
  const stats = () => {
    $('#cpu').textContent = `${Math.round(3 + Math.random() * 14)}%`;
    $('#mem').textContent = `${(1.1 + Math.random() * 0.3).toFixed(1)}G`;
    $('#fan').textContent = `${2300 + Math.round(Math.random() * 6) * 50}`;
  };
  tick(); stats();
  setInterval(tick, 1000 * 5);
  setInterval(stats, 2500);
}

function bindKeys() {
  let metaAlone = false;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Meta') { metaAlone = true; return; }
    metaAlone = false;
    if (!$('#lock').hidden || $('#desktop').hidden) return;
    if (e.key === 'Escape') { if (!$('#powermenu').hidden) $('#powermenu').hidden = true; if (!launcher.el.hidden) launcher.hide(); return; }
    if (!e.altKey) return;
    const k = e.key.toLowerCase();
    let handled = true;
    if (k === 'enter') wm.create('terminal', null, wm.current);
    else if (k === ' ' || k === 'd') launcher.toggle();
    else if (k === 'q') wm.close(wm.focused);
    else if (k === 'f') wm.toggleFull();
    else if (k === 'j' || k === 'arrowright' || k === 'arrowdown') wm.cycle(1);
    else if (k === 'k' || k === 'arrowleft' || k === 'arrowup') wm.cycle(-1);
    else if (/^digit[1-5]$/i.test(e.code)) wm.switchWs(+e.code.slice(5));
    else handled = false;
    if (handled) e.preventDefault();
  });
  document.addEventListener('keyup', (e) => { if (e.key === 'Meta' && metaAlone && !$('#desktop').hidden) launcher.toggle(); });
}

/* ---------- boot ---------- */

const BOOT_LINES = [
  '[    0.000000] Linux version 6.11.9-arch1-1 (linux@archlinux) (gcc (GCC) 14.2.1) #1 SMP PREEMPT_DYNAMIC',
  '[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-linux root=UUID=c0de-b1gf-an quiet splash',
  '[    0.112043] x86/fpu: Supporting XSAVE feature 0x001: \'x87 floating point registers\'',
  '[    0.384112] ACPI: MSI_ACPI WMI interface found (handled by kestrel, eventually)',
  '[    0.912870] nvme nvme0: 16/0/0 default/read/poll queues',
  ':: running early hook [udev]',
  ':: running hook [encrypt]',
  ':: mounting \'/dev/nvme0n1p2\' on real root',
  '         Welcome to <c>Arch Linux</c>!',
  'OK Created slice Slice /system/getty.',
  'OK Reached target Local Encrypted Volumes.',
  'OK Mounted Huge Pages File System.',
  'OK Started Journal Service.',
  'OK Finished Load Kernel Modules.',
  'OK Started Rule-based Manager for Device Events and Files.',
  'OK Reached target Sound Card.',
  'OK Started Network Manager.',
  'OK Reached target Network.',
  'OK Started Bluetooth service.',
  'OK Started PipeWire Multimedia Service.',
  'OK Started Nord Theme Daemon.',
  'OK Mounted /home/adit/projects.',
  'OK Started Coffee Supply Monitor.',
  'OK Reached target Multi-User System.',
  'OK Reached target Graphical Interface.',
  '',
  'Arch Linux 6.11.9-arch1-1 (tty1)',
  '',
];

function bootSequence() {
  const boot = $('#boot');
  const log = $('#boot-log');
  const grub = $('#grub');
  let skipped = false;
  let done = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const finish = () => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    sessionStorage.setItem('booted', '1');
    boot.classList.add('fade');
    setTimeout(() => boot.remove(), 600);
    startDesktop();
  };
  const skip = (e) => {
    if (e) e.preventDefault();
    if (!skipped) { skipped = true; finish(); }
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sessionStorage.getItem('booted') || reduce) { boot.remove(); startDesktop(); return; }

  window.addEventListener('keydown', skip, { once: true });
  boot.addEventListener('click', skip);

  later(() => { $('#grub-count').textContent = '1'; }, 800);
  later(() => {
    grub.remove();
    let t = 0;
    BOOT_LINES.forEach((line) => {
      t += line.startsWith('[') || line.startsWith(':') ? 90 : 55 + Math.random() * 50;
      later(() => {
        const row = document.createElement('div');
        if (line.startsWith('OK ')) row.innerHTML = `<span class="ok">[  OK  ]</span> ${esc(line.slice(3))}`;
        else row.innerHTML = esc(line).replace('&lt;c&gt;', '<span class="c-cyan bold">').replace('&lt;/c&gt;', '</span>') || '&nbsp;';
        log.appendChild(row);
        log.scrollTop = log.scrollHeight;
      }, t);
    });
    const login = document.createElement('div');
    later(() => { login.innerHTML = `${PROFILE.host} login: `; log.appendChild(login); }, t + 150);
    'adit'.split('').forEach((c, i) => later(() => { login.innerHTML += c; }, t + 400 + i * 110));
    later(() => { const p = document.createElement('div'); p.textContent = 'Password: '; log.appendChild(p); }, t + 950);
    later(() => { const p = document.createElement('div'); p.innerHTML = `Last login: ${new Date(Date.now() - 864e5).toString().slice(0, 24)} on tty1<br>$ exec Hyprland`; log.appendChild(p); }, t + 1500);
    later(finish, t + 2100);
  }, 1500);
}

function startDesktop() {
  $('#desktop').hidden = false;
  hydrateIcons();
  wm.init();
  launcher.init();
  startBar();
  wm.create('terminal', 'neofetch', 1);
  wm.create('projects', 'kestrel', 1);
  wm.create('about', null, 2);
  wm.create('contact', null, 2);
  wm.create('skills', null, 3);
  wm.focus([...wm.ws[1]][0]);
  if (MOBILE()) {
    setTimeout(() => toast('Welcome to adit@archlinux', 'Use the dock to switch apps. Tap a toast to dismiss it.', 6000), 500);
  } else {
    setTimeout(() => toast('Welcome to adit@archlinux', `<kbd>Alt</kbd>+<kbd>Space</kbd> launcher · <kbd>Alt</kbd>+<kbd>Enter</kbd> terminal · <kbd>Alt</kbd>+<kbd>1-5</kbd> workspaces · drag title bars to swap tiles`, 10000), 500);
    setTimeout(() => toast('More on other workspaces', 'About me is on 2, skills on 3. Or use the dock.', 8000), 1400);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  hydrateIcons();
  $('#logo-btn').addEventListener('click', () => launcher.toggle());
  $('#power-btn').addEventListener('click', () => { $('#powermenu').hidden = !$('#powermenu').hidden; });
  $('#powermenu').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-power]');
    if (b) power(b.dataset.power);
    else if (e.target.id === 'powermenu') $('#powermenu').hidden = true;
  });
  $('#lock-form').addEventListener('submit', (e) => { e.preventDefault(); $('#lock').hidden = true; });
  $('#power-on').addEventListener('click', () => wm.reboot());
  bindKeys();
  bootSequence();
});
