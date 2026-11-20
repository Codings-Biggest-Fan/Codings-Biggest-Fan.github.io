const ARCH_ASCII = [
  "                   -`",
  "                  .o+`",
  "                 `ooo/",
  "                `+oooo:",
  "               `+oooooo:",
  "               -+oooooo+:",
  "             `/:-:++oooo+:",
  "            `/++++/+++++++:",
  "           `/++++++++++++++:",
  "          `/+++ooooooooooooo/`",
  "         ./ooosssso++osssssso+`",
  "        .oossssso-````/ossssss+`",
  "       -osssssso.      :ssssssso.",
  "      :osssssss/        osssso+++.",
  "     /ossssssss/        +ssssooo/-",
  "   `/ossssso+/:-        -:/+osssso+-",
  "  `+sso+:-`                 `.-/+oso:",
  " `++:.                           `-/+/",
  " .`                                 `/",
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function buildFs() {
  const projects = {};
  PROJECTS.forEach((p) => {
    projects[p.id] = {
      'README.md': [`# ${p.name}`, '', p.tagline, '', ...p.description.flatMap((d) => [d, '']),
        `stack:  ${p.stack.join(', ')}`, `status: ${p.status}`, ...p.links.map((l) => `${l.label}: ${l.url}`)].join('\n'),
    };
  });
  return {
    'about.md': ['# about', '', ...PROFILE.about.flatMap((a) => [a, '']), '## now', ...PROFILE.now.map((n) => `- ${n}`)].join('\n'),
    'contact.txt': [`github  ${PROFILE.github}`, `alt     ${PROFILE.alt}`, `team    ${PROFILE.team.name}  ${PROFILE.team.url}`].join('\n'),
    'skills.txt': [...SKILLS.languages, ...SKILLS.tools].map(([n, v]) => `${n.padEnd(28)} ${'█'.repeat(Math.round(v / 10))}${'░'.repeat(10 - Math.round(v / 10))}`).join('\n'),
    projects,
    '.config': { hypr: { 'hyprland.conf': '$mod = ALT\nbind = $mod, RETURN, exec, kitty\nbind = $mod, SPACE, exec, rofi -show drun\nbind = $mod, Q, killactive\nbind = $mod, F, fullscreen\nbind = $mod, 1-5, workspace, 1-5\ngeneral { gaps_in = 5; gaps_out = 12; col.active_border = rgb(88C0D0) }\ndecoration { rounding = 12; blur { enabled = true } }' } },
  };
}

class Terminal {
  constructor(el, wm, opts = {}) {
    this.el = el;
    this.wm = wm;
    this.fs = buildFs();
    this.cwd = [];
    this.history = [];
    this.hIndex = 0;
    el.innerHTML = '<div class="term-out"></div><form class="term-line"><span class="term-prompt"></span><input class="term-input" type="text" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="terminal input"></form>';
    this.out = el.querySelector('.term-out');
    this.input = el.querySelector('.term-input');
    this.promptEl = el.querySelector('.term-prompt');
    this.renderPrompt();
    el.addEventListener('mousedown', (e) => { if (!window.getSelection().toString() && e.target.tagName !== 'A') setTimeout(() => this.input.focus({ preventScroll: true }), 0); });
    el.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); this.submit(); });
    this.input.addEventListener('keydown', (e) => this.onKey(e));
    if (opts.autorun) this.run(opts.autorun, true);
    else this.print('<span class="c-dim">type <span class="c-cyan">help</span> to see what this shell can do</span>');
  }

  path() { return '~' + (this.cwd.length ? '/' + this.cwd.join('/') : ''); }
  prompt() { return `<span class="c-green">adit</span><span class="c-dim">@</span><span class="c-cyan">${PROFILE.host}</span> <span class="c-blue">${this.path()}</span> <span class="c-purple">❯</span>`; }
  renderPrompt() { this.promptEl.innerHTML = this.prompt(); }
  print(html) { const d = document.createElement('div'); d.className = 'term-row'; d.innerHTML = html; this.out.appendChild(d); this.el.scrollTop = this.el.scrollHeight; }
  printText(text, cls = '') { this.print(`<span class="${cls}">${esc(text)}</span>`); }

  resolve(arg = '') {
    let parts = arg.startsWith('~') ? arg.slice(1).split('/') : [...this.cwd, ...arg.split('/')];
    const stack = [];
    for (const p of parts) {
      if (!p || p === '.') continue;
      if (p === '..') stack.pop(); else stack.push(p);
    }
    let node = this.fs;
    for (const p of stack) {
      if (node && typeof node === 'object' && p in node) node = node[p]; else return { node: null, stack };
    }
    return { node, stack };
  }

  onKey(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this.history.length) return;
      this.hIndex = Math.max(0, Math.min(this.history.length, this.hIndex + (e.key === 'ArrowUp' ? -1 : 1)));
      this.input.value = this.history[this.hIndex] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.complete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.out.innerHTML = '';
    } else if (e.key === 'c' && e.ctrlKey && !window.getSelection().toString()) {
      e.preventDefault();
      this.print(`${this.prompt()} ${esc(this.input.value)}^C`);
      this.input.value = '';
    }
  }

  complete() {
    const val = this.input.value;
    const words = val.split(' ');
    const last = words[words.length - 1];
    let candidates;
    if (words.length === 1) candidates = Object.keys(this.commands());
    else {
      const slash = last.lastIndexOf('/');
      const dir = slash >= 0 ? last.slice(0, slash + 1) : '';
      const { node } = this.resolve(dir || '.');
      candidates = node && typeof node === 'object' ? Object.keys(node).map((k) => dir + k + (typeof node[k] === 'object' ? '/' : '')) : [];
    }
    const matches = candidates.filter((c) => c.startsWith(last));
    if (matches.length === 1) {
      words[words.length - 1] = matches[0] + (words.length === 1 ? ' ' : '');
      this.input.value = words.join(' ');
    } else if (matches.length > 1) {
      this.print(`${this.prompt()} ${esc(val)}`);
      this.print(matches.map((m) => `<span class="c-cyan">${esc(m)}</span>`).join('  '));
    }
  }

  submit() {
    const cmd = this.input.value;
    this.input.value = '';
    this.run(cmd);
  }

  run(cmd, quiet = false) {
    this.print(`${this.prompt()} ${esc(cmd)}`);
    const trimmed = cmd.trim();
    if (trimmed) { this.history.push(trimmed); }
    this.hIndex = this.history.length;
    if (!trimmed) return;
    const [name, ...args] = trimmed.split(/\s+/);
    const fn = this.commands()[name];
    if (fn) fn(args, trimmed);
    else this.printText(`zsh: command not found: ${name}`, 'c-red');
    this.renderPrompt();
  }

  commands() {
    const t = this;
    const openApp = (id, arg) => t.wm.open(id, arg);
    return {
      help() {
        const rows = [
          ['neofetch', 'system info (also: fastfetch)'], ['ls [dir]', 'list files'], ['cd <dir>', 'change directory'],
          ['cat <file>', 'print a file'], ['projects', 'list my projects'], ['open <app|project>', 'open a window'],
          ['skills', 'open btop'], ['contact', 'how to reach me'], ['github', 'open my GitHub'],
          ['pacman -S <pkg>', 'install packages (sort of)'], ['clear', 'clear the screen'], ['reboot', 'watch it boot again'],
        ];
        t.print('<span class="c-yellow">available commands</span>');
        rows.forEach(([c, d]) => t.print(`  <span class="c-cyan">${esc(c.padEnd(22))}</span><span class="c-dim">${d}</span>`));
        t.print('<span class="c-dim">keys: Tab completes, ↑/↓ history, Ctrl+L clears. Window keys: Alt+Enter, Alt+Space, Alt+Q, Alt+F, Alt+1-5</span>');
      },
      neofetch() { t.neofetch(); },
      fastfetch() { t.neofetch(); },
      whoami() { t.printText('adit'); },
      hostname() { t.printText(PROFILE.host); },
      pwd() { t.printText('/home/adit' + (t.cwd.length ? '/' + t.cwd.join('/') : '')); },
      date() { t.printText(new Date().toString()); },
      uname(args) { t.printText(args.includes('-a') ? `Linux ${PROFILE.host} 6.11.9-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux` : 'Linux'); },
      echo(args) { t.printText(args.join(' ')); },
      clear() { t.out.innerHTML = ''; },
      history() { t.history.forEach((h, i) => t.printText(`${String(i + 1).padStart(4)}  ${h}`)); },
      ls(args) {
        const target = args.filter((a) => !a.startsWith('-'))[0] || '.';
        const all = args.some((a) => a.startsWith('-') && a.includes('a'));
        const { node } = t.resolve(target);
        if (node === null) return t.printText(`ls: cannot access '${target}': No such file or directory`, 'c-red');
        if (typeof node === 'string') return t.printText(target);
        const names = Object.keys(node).filter((k) => all || !k.startsWith('.'));
        t.print(names.map((k) => typeof node[k] === 'object' ? `<span class="c-blue bold">${esc(k)}/</span>` : `<span>${esc(k)}</span>`).join('  ') || '');
      },
      cd(args) {
        const target = args[0] || '~';
        const { node, stack } = t.resolve(target);
        if (node === null) return t.printText(`cd: no such file or directory: ${target}`, 'c-red');
        if (typeof node === 'string') return t.printText(`cd: not a directory: ${target}`, 'c-red');
        t.cwd = stack;
      },
      cat(args) {
        if (!args[0]) return t.printText('cat: missing file operand', 'c-red');
        const { node } = t.resolve(args[0]);
        if (node === null) return t.printText(`cat: ${args[0]}: No such file or directory`, 'c-red');
        if (typeof node === 'object') return t.printText(`cat: ${args[0]}: Is a directory`, 'c-red');
        node.split('\n').forEach((line) => t.print(line.startsWith('#') ? `<span class="c-cyan bold">${esc(line)}</span>` : (esc(line) || '&nbsp;')));
      },
      projects() {
        PROJECTS.forEach((p) => t.print(`<span class="c-cyan bold">${esc(p.id.padEnd(12))}</span>${esc(p.tagline)} <span class="c-dim">[${esc(p.stack.join(', '))}]</span>`));
        t.print('<span class="c-dim">open one with: open &lt;name&gt;</span>');
      },
      open(args) {
        const what = (args[0] || '').toLowerCase().replace(/\/$/, '');
        if (!what) return t.printText('usage: open <terminal|about|projects|skills|contact|project-name>', 'c-yellow');
        const proj = PROJECTS.find((p) => p.id === what || p.id === what.split('/').pop());
        if (proj) return openApp('projects', proj.id);
        if (APPS[what]) return openApp(what);
        t.printText(`open: nothing called '${what}'`, 'c-red');
      },
      kitty() { openApp('terminal'); },
      skills() { openApp('skills'); },
      btop() { openApp('skills'); },
      htop() { openApp('skills'); },
      contact() { t.commands().cat(['~/contact.txt']); },
      github() { window.open(PROFILE.github, '_blank', 'noopener'); t.printText(`opening ${PROFILE.github}`, 'c-dim'); },
      sudo(args) {
        if (args[0] === 'pacman') return t.commands().pacman(args.slice(1), '', true);
        t.printText('adit is not in the sudoers file. This incident will be reported.', 'c-red');
      },
      pacman(args, _raw, root = false) {
        if (!args.length || !args[0].startsWith('-')) return t.printText('error: no operation specified (use -h for help)', 'c-red');
        if (args[0].startsWith('-S') && !root) return t.printText('error: you cannot perform this operation unless you are root.', 'c-red');
        if (args[0] === '-Syu') {
          t.print('<span class="c-blue bold">::</span> Synchronizing package databases...');
          t.print(' core is up to date\n extra is up to date');
          t.print('<span class="c-blue bold">::</span> Starting full system upgrade...');
          return t.printText(' there is nothing to do');
        }
        if (args[0].startsWith('-S')) {
          const pkgs = args.slice(1);
          if (!pkgs.length) return t.printText('error: no targets specified', 'c-red');
          t.print(`resolving dependencies...\n<span class="c-blue bold">::</span> Proceed with installation? [Y/n] y`);
          pkgs.forEach((p) => t.print(`(1/1) installing <span class="c-green">${esc(p)}</span>  <span class="c-dim">[########################] 100%</span>`));
          if (pkgs.includes('kestrel')) t.print('<span class="c-yellow">kestrel is a Windows app, but nice try.</span> <span class="c-dim">try: open kestrel</span>');
          return;
        }
        if (args[0] === '-Q') return PROJECTS.forEach((p) => t.printText(`${p.id} ${p.status.split(' ')[0]}`));
        t.printText('error: invalid option', 'c-red');
      },
      yay(args) { t.commands().pacman(args.length ? args : ['-Syu'], '', true); },
      btw() { t.printText('I use Arch, btw.', 'c-cyan'); },
      vim() { t.printText('you can check out any time you like, but you can never leave. (try: open about)', 'c-yellow'); },
      nvim() { openApp('about'); },
      exit() { t.wm.closeTerminal(t); },
      reboot() { t.wm.reboot(); },
      shutdown() { t.wm.shutdown(); },
      poweroff() { t.wm.shutdown(); },
      rm(args) { t.printText(args.join(' ').includes('-rf') ? 'nice try.' : 'rm: permission denied', 'c-red'); },
      cowsay(args) {
        const msg = args.join(' ') || 'moo, I use Arch btw';
        t.printText([' ' + '_'.repeat(msg.length + 2), `< ${msg} >`, ' ' + '-'.repeat(msg.length + 2),
          '        \\   ^__^', '         \\  (oo)\\_______', '            (__)\\       )\\/\\', '                ||----w |', '                ||     ||'].join('\n'));
      },
    };
  }

  neofetch() {
    const up = Math.max(1, Math.round((Date.now() - this.wm.bootTime) / 60000));
    const info = [
      `<span class="c-cyan bold">adit</span>@<span class="c-cyan bold">${PROFILE.host}</span>`,
      '<span class="c-dim">-------------------</span>',
      ['OS', 'Arch Linux x86_64'], ['Host', 'MSI Vector A16 HX'], ['Kernel', '6.11.9-arch1-1'],
      ['Uptime', `${up} min${up > 1 ? 's' : ''}`], ['Shell', 'zsh 5.9'], ['WM', 'Hyprland (Wayland)'],
      ['Theme', 'Nord'], ['Terminal', 'kitty'], ['Font', 'JetBrains Mono'],
      ['Editor', 'neovim'], ['Langs', 'Rust, TS, Java, JS, Python'], ['Projects', String(PROJECTS.length)],
      '',
      ['#BF616A', '#D08770', '#EBCB8B', '#A3BE8C', '#88C0D0', '#81A1C1', '#B48EAD', '#ECEFF4'].map((c) => `<span class="swatch" style="background:${c}"></span>`).join(''),
    ];
    const lines = [];
    const n = Math.max(ARCH_ASCII.length, info.length);
    for (let i = 0; i < n; i++) {
      const art = (ARCH_ASCII[i] || '').padEnd(40);
      const inf = info[i];
      const right = Array.isArray(inf) ? `<span class="c-cyan bold">${inf[0]}</span>: ${esc(inf[1])}` : (inf || '');
      lines.push(`<span class="c-cyan art">${esc(art)}</span>${right}`);
    }
    this.print(`<div class="neofetch">${lines.join('\n')}</div>`);
  }
}
