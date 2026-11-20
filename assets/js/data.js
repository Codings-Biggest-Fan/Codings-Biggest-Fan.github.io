// Edit this file to update the portfolio content.
const PROFILE = {
  name: 'Adit Sharma',
  handle: 'Codings-Biggest-Fan',
  host: 'archlinux',
  github: 'https://github.com/Codings-Biggest-Fan',
  alt: 'https://github.com/sharma-adit',
  team: { name: 'MVRT (FRC Team 115)', url: 'https://github.com/mvrt-115' },
  tagline: 'I build things for fun: native apps, games and the tools I wish existed.',
  about: [
    'Hi, I\'m Adit. I code because I enjoy it, and I learn by digging into how things actually work instead of sitting through full video courses.',
    'Lately I\'ve been writing a lot of Rust: a lightweight replacement for MSI Center and a native board game. I also build TypeScript apps for my robotics team, MVRT, and I\'m designing my own keyboard.',
    'Tools I make for myself stay free and open source. I don\'t believe in paying for 800 monthly subscriptions.',
    'Linux is my daily driver. I run Hyprland, hop between distros, and like experimenting with my setup.',
  ],
  now: [
    'Kestrel: native Rust control center for MSI laptops',
    'The Colonizers of Resourceville: native board game in Rust',
    'Scout and SuperScout v1.1 for MVRT',
    'Learning backend development and low-level programming (C)',
  ],
};

const PROJECTS = [
  {
    id: 'kestrel',
    name: 'Kestrel',
    icon: 'fan',
    category: 'tools',
    tagline: 'A lightweight MSI Center replacement with a 50 MB RAM budget',
    stack: ['Rust', 'Slint', 'Win32', 'ACPI/WMI'],
    status: 'active · open source (GPL-3.0)',
    description: [
      'Open-source control center for MSI laptops: scenarios, fan curves, battery limits, keyboard lighting and hardware monitoring. Native Rust and Slint with no .NET and no WebView.',
      'A Windows service is the only process that touches the embedded controller. It checks the firmware ID against a verified register map, journals the original value before writing, reads it back and rolls back if the write didn\'t stick.',
      'The tray icon and main window talk to the service over a versioned JSON protocol on a locked-down named pipe. Updates are signed (Ed25519 manifest + SHA-256).',
    ],
    links: [
      { label: 'GitHub', url: 'https://github.com/Codings-Biggest-Fan/kestrel', icon: 'github' },
      { label: 'Install guide', url: 'https://github.com/Codings-Biggest-Fan/kestrel/blob/main/docs/INSTALL.md', icon: 'file' },
    ],
  },
  {
    id: 'colonizers',
    name: 'The Colonizers of Resourceville',
    icon: 'hex',
    category: 'games',
    tagline: 'A native Colonist-style board game, written in Rust',
    stack: ['Rust', 'Game dev', 'HTML/CSS site'],
    status: 'testing · Windows preview',
    description: [
      'An unofficial native take on Colonist, implemented independently in Rust. The full offline base rules are in testing, and strategic bots, saves and online rooms are next.',
      'The download website hosts verified Windows testing builds. The game source is kept private.',
    ],
    links: [
      { label: 'Website', url: 'https://codings-biggest-fan.github.io/colonizers-of-resourceville-website/', icon: 'globe' },
      { label: 'Site repo', url: 'https://github.com/Codings-Biggest-Fan/colonizers-of-resourceville-website', icon: 'github' },
    ],
  },
  {
    id: 'scout',
    name: 'Scout & SuperScout',
    icon: 'robot',
    category: 'apps',
    tagline: 'Match scouting and strategy apps for FRC Team 115',
    stack: ['TypeScript', 'Mobile', 'Desktop'],
    status: 'v1.1 · used by MVRT',
    description: [
      'Scout is a phone app for match and pit scouting. SuperScout is a laptop app for reviewing that data and preparing match strategy.',
      'Built for my robotics team, MVRT (FRC 115), with a public guide site and desktop downloads.',
    ],
    links: [
      { label: 'Website & guides', url: 'https://codings-biggest-fan.github.io/Scouting-Website/', icon: 'globe' },
      { label: 'Downloads', url: 'https://codings-biggest-fan.github.io/Scouting-Downloads/', icon: 'link' },
    ],
  },
  {
    id: 'keyboard',
    name: 'Custom Keyboard',
    icon: 'keyboard',
    category: 'hardware',
    tagline: 'A 60% layout with F-keys, a volume knob and wood accents',
    stack: ['PCB design', 'CAD', 'Hack Club'],
    status: 'in progress',
    description: [
      'No keyboard I could buy matched what I wanted, so I\'m designing my own: compact like a 60% but with function keys, a volume knob, MX Red switches, a wooden accent, front-printed keycaps and some RGB.',
      'Inspired and funded by a Hack Club grant. The PCB matrix is a 6×15 grid. Up next: the knob, the case CAD and sourcing parts.',
    ],
    links: [
      { label: 'Build log', url: 'https://github.com/Codings-Biggest-Fan/my-keyboard', icon: 'github' },
    ],
  },
  {
    id: 'learning',
    name: 'Learning repos',
    icon: 'book',
    category: 'learning',
    tagline: 'Java and JavaScript courses and experiments',
    stack: ['Java', 'JavaScript', 'Sass'],
    status: 'archive',
    description: [
      'Where I started: course work and experiments from learning Java and JavaScript, mixed with small projects I built along the way.',
    ],
    links: [
      { label: 'My-Java-Learning', url: 'https://github.com/Codings-Biggest-Fan/My-Java-Learning', icon: 'github' },
      { label: 'Learn-JavaScript', url: 'https://github.com/Codings-Biggest-Fan/Learn-JavaScript', icon: 'github' },
      { label: 'JavaScriptCourse', url: 'https://github.com/Codings-Biggest-Fan/JavaScriptCourse', icon: 'github' },
    ],
  },
];

// Bars in the btop window: rough comfort level, 0-100.
const SKILLS = {
  languages: [
    ['Rust', 80], ['TypeScript', 75], ['JavaScript', 75], ['Java', 70],
    ['HTML/CSS', 80], ['Python', 60], ['Shell', 65], ['C / C++', 40],
  ],
  tools: [
    ['Linux / Hyprland', 85], ['Git / GitHub', 80], ['React', 60], ['Node / npm', 65],
    ['Slint', 60], ['Arduino', 50], ['Photoshop / AE / Premiere', 55], ['NumPy / Matplotlib', 45],
  ],
};
