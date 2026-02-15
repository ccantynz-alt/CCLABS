import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Rocket, Globe, Lock, Monitor, Wrench, Sparkles, Settings, AlertCircle, CheckCircle, Loader2, X, Mic, Ticket, FileText, Maximize2, DollarSign, Store, TrendingUp, Languages, Crown, Megaphone, MessageCircle, User, BookOpen, Target, Zap, Shield, Sliders, ChevronDown, PenLine } from 'lucide-react';
import { clsx } from 'clsx';
import './App.css';

// Animated brain icon for agents (pulses when working)
function AgentBrainIcon({ className, color = 'currentColor' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 4a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5M12 4a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5M12 4v2M8 8c0-1.5.8-2.8 2-3.5M16 8c0-1.5-.8-2.8-2-3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 10v10M9 14l3 3 3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="18" r="1.5" fill={color} opacity="0.8" />
      <path d="M5 14c0 2 1.5 4 4 4h6c2.5 0 4-2 4-4" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function cn(...args) {
  return clsx(...args);
}

// Rendering Stress Test: ?stress=N in URL renders N 3D cards + FPS meter
function getStressCount() {
  if (typeof window === 'undefined') return 0;
  const n = parseInt(new URLSearchParams(window.location.search).get('stress'), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : 0;
}

function FPSMeter() {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef();

  useEffect(() => {
    function tick() {
      frameCountRef.current += 1;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="stress-fps-meter" aria-live="polite">
      <span className="stress-fps-value">{fps}</span>
      <span className="stress-fps-label"> FPS</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE CONTROLLER – single source of truth (Aura Decathlon: no new files)
// ═══════════════════════════════════════════════════════════════════════════════
const projectData = [
  { id: '1', url: 'www.horizonaid.tech', label: 'Bot AI deployments', progress: 72, color: 'green', status: 'ok', speed: 94, statusText: 'Uptime 99.98%' },
  { id: '2', url: 'akiraspacepro.io', label: 'Web platform deploy', progress: 70, color: 'orange', status: 'New', speed: 88, statusText: 'Deploying 70%' },
  { id: '3', url: 'bloometapro.com', label: 'Bots upgrade deployment', progress: 54, color: 'blue', status: 'ok', speed: 97, statusText: 'Optimizing new bots 54%' },
];

// useAura: Theme, Active Deployment, Healing + Universal State Lock (no two agents fight over same code)
function useAura() {
  const [vibe, setVibe] = useState('obsidian');
  const [fullScreenId, setFullScreenId] = useState(null);
  const [healingId, setHealingId] = useState(null);
  const [selfHealingOn, setSelfHealingOn] = useState(false);
  const [agentTypingText, setAgentTypingText] = useState(null);
  const [agentLock, setAgentLock] = useState(null); // 'creative' | 'leadDev' | 'qa' | 'marketing' | null
  const acquireLock = useCallback((agent) => {
    setAgentLock((prev) => (prev ? prev : agent));
    return () => setAgentLock((prev) => (prev === agent ? null : prev));
  }, []);
  return {
    vibe,
    setVibe,
    fullScreenId,
    setFullScreenId,
    healingId,
    setHealingId,
    selfHealingOn,
    setSelfHealingOn,
    agentTypingText,
    setAgentTypingText,
    agentLock,
    setAgentLock,
    acquireLock,
  };
}

// Dominat8 Multi-Experience: .com = Showroom (Luxury Hero), .io = Engine (Immersive Dashboard)
const DOMINAT8_SHOWROOM_HOST = 'dominat8.com';
function getIsShowroomDomain() {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes(DOMINAT8_SHOWROOM_HOST);
}
const DOMINAT8_ENTERED_LAB_KEY = 'dominat8_entered_lab';

// Live Blueprint Engine – change one word here, UI re-morphs instantly
const siteBlueprint = [
  { type: 'Hero', id: 'hero', props: { heading: 'What would you like to build?', placeholder: 'Describe your project...' } },
  { type: 'BentoStats', id: 'bento', props: {} },
  { type: 'DeploymentCard', id: 'deployments', props: {} },
  { type: 'InteractiveDock', id: 'dock', props: {} },
];

// Multimodal Vibe: extract dominant colors from image for themeConfig
function getDominantColorsFromImage(file, callback) {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const scale = 0.15;
      canvas.width = Math.max(1, Math.floor(img.width * scale));
      canvas.height = Math.max(1, Math.floor(img.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = (data[i] >> 4) * 17;
        const g = (data[i + 1] >> 4) * 17;
        const b = (data[i + 2] >> 4) * 17;
        const a = data[i + 3];
        if (a < 128) continue;
        const key = `${r},${g},${b}`;
        buckets[key] = (buckets[key] || 0) + 1;
      }
      const sorted = Object.entries(buckets)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k]) => k.split(',').map(Number));
      const toRgb = (arr) => `rgb(${arr[0]},${arr[1]},${arr[2]})`;
      const toRgba = (arr, alpha) => `rgba(${arr[0]},${arr[1]},${arr[2]},${alpha})`;
      callback({
        orbPrimary: sorted[0] ? toRgba(sorted[0], 0.4) : null,
        orbSecondary: sorted[1] ? toRgba(sorted[1], 0.35) : null,
        orbTertiary: sorted[2] ? toRgba(sorted[2], 0.3) : null,
        cardBorder: sorted[0] ? toRgba(sorted[0], 0.25) : null,
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    callback(null);
  };
  img.src = url;
}

// Voice → Vibe: keyword presets (no image)
const VOICE_VIBE_PRESETS = {
  warmer: { orbPrimary: 'rgba(251,146,60,0.45)', orbSecondary: 'rgba(234,88,12,0.35)', orbTertiary: 'rgba(194,65,12,0.3)', cardBorder: 'rgba(251,146,60,0.25)' },
  cooler: { orbPrimary: 'rgba(96,165,250,0.45)', orbSecondary: 'rgba(59,130,246,0.35)', orbTertiary: 'rgba(37,99,235,0.3)', cardBorder: 'rgba(96,165,250,0.25)' },
  calmer: { orbPrimary: 'rgba(52,211,153,0.4)', orbSecondary: 'rgba(34,197,94,0.35)', orbTertiary: 'rgba(22,163,74,0.3)', cardBorder: 'rgba(52,211,153,0.2)' },
};

// Self-Healing Ticket: map ticket text to suggested CSS patch
function suggestPatchForTicket(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('button') && (t.includes('broken') || t.includes('not work') || t.includes('click'))) {
    return { type: 'css', code: '/* Fix: button visibility and interaction */\n.deploy-new-btn { opacity: 1 !important; pointer-events: auto !important; }\n.fix-btn-glow { opacity: 1 !important; }' };
  }
  if (t.includes('dark') || t.includes('can\'t see') || t.includes('contrast')) {
    return { type: 'css', code: '/* Fix: improve contrast */\n.app-bg { background: linear-gradient(165deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%); }\n.deployment-card-glass { border-color: rgba(255,255,255,0.2) !important; }' };
  }
  if (t.includes('card') || t.includes('border') || t.includes('glow')) {
    return { type: 'css', code: '/* Fix: card borders and glow */\n.deployment-card-glass { box-shadow: 0 0 24px rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.3) !important; }' };
  }
  return { type: 'css', code: '/* Generic UI polish */\n.deploy-new-btn { transition: transform 0.2s, box-shadow 0.2s; }\n.deploy-new-btn:hover { transform: scale(1.02); box-shadow: 0 4px 20px rgba(34,197,94,0.3); }' };
}

// Empire: Prime blueprints for Blueprint Marketplace (3D hover, One-Click Install)
const PRIME_BLUEPRINTS = [
  { id: 'luxury-real-estate', name: 'Luxury Real Estate', description: 'High-end listings, hero imagery, trust badges.', accent: '#c9a227', heroSubtitle: 'Elite properties worldwide.' },
  { id: 'high-fashion-ecom', name: 'High-Fashion E-com', description: 'Editorial layout, lookbook grid, checkout-ready.', accent: '#ec4899', heroSubtitle: 'Where style meets commerce.' },
  { id: 'saas-dashboard', name: 'SaaS Dashboard', description: 'Metrics, charts, team roles, and billing.', accent: '#3b82f6', heroSubtitle: 'Ship faster. Scale smarter.' },
];

const DOCK_ITEMS = [
  { id: 'deploy', label: 'Deploy', Icon: Rocket, color: '#3b82f6' },
  { id: 'domains', label: 'Domains', Icon: Globe, color: '#8b5a2b' },
  { id: 'ssl', label: 'SSL', Icon: Lock, color: '#a855f7' },
  { id: 'monitor', label: 'Monitor', Icon: Monitor, color: '#3b82f6' },
  { id: 'fix', label: 'Fix', Icon: Wrench, color: '#f97316' },
  { id: 'automate', label: 'Automate', Icon: Sparkles, color: '#1e40af' },
  { id: 'integrate', label: 'Integrate', Icon: PenLine, color: '#1e40af' },
  { id: 'settings', label: 'Settings', Icon: Settings, color: '#64748b' },
];

// Aura Agency Brain: 4 expert agents (status: idle | working)
const AGENCY_AGENTS = [
  { key: 'creativeDirector', label: 'Creative Director', short: 'Creative' },
  { key: 'leadDev', label: 'Lead Dev', short: 'Lead Dev' },
  { key: 'qa', label: 'QA', short: 'QA' },
  { key: 'marketing', label: 'Marketing', short: 'Marketing' },
];

const AGENT_FIX_SCRIPT = 'Detecting SSL failure on horizonaid.tech...\nApplying certificate renewal...\nCertificate renewed. Status: OK';

// Mock build logs for "Simulate error" — record Self-Healing TikTok without a real Vercel failure
const MOCK_BUILD_LOGS = `[09:42:11] Building...
[09:42:14] Installing dependencies
[09:42:18] Build failed: Module not found: 'react-helmet'
[09:42:18] Error: Cannot find module 'react-helmet'
[09:42:18] at Function.Module._resolveFilename (node:internal/modules/cjs/loader:119:15)
[09:42:19] Lead Dev: Analyzing Vercel build logs for repair.
[09:42:20] Suggested fix: Add react-helmet to package.json or replace with react-helmet-async`;

// Midnight Architect: domains cycled every 60s (Persistent Autopilot)
const MIDNIGHT_DOMAINS = [
  { id: '1', url: 'horizonaid.tech' },
  { id: '2', url: 'akiraspacepro.io' },
  { id: '3', url: 'bloometapro.com' },
];
const AURA_NIGHT_SHIFT_KEY = 'aura_night_shift';
const TRENDING_KEYWORDS_POOL = [
  'react performance 2024', 'vercel edge runtime', 'core web vitals', 'ssl best practices',
  'domain migration', 'cdn optimization', 'lighthouse score', 'meta tags seo',
  'responsive design', 'nextjs deploy', 'lets encrypt', 'dns propagation',
];

// Deployment simulator – AI build log (separate from Self-Healing agent terminal)
const DEPLOY_SCRIPT = [
  'Initializing Aura Builder environment...',
  'Detected framework: React (Create React App)',
  'Installing dependencies (npm ci)...',
  '✓ 247 packages installed in 3.2s',
  'Configuring Vercel Edge runtime...',
  'Generating SSL certificates (Let\'s Encrypt)...',
  'Propagating DNS records (A, AAAA, CNAME)...',
  'Building production bundle...',
  '✓ Build complete (12.4s)',
  'Deploying to production (CDN)...',
  'Deployment live at https://your-project.vercel.app',
  '',
  'Done. Status: OK',
].join('\n');

// Dominat8 "8" logo: Aura Pulse synced to 60s Autopilot heartbeat (engine)
const LOGO_8_SRC = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/logo-8.svg` : '/logo-8.svg';
function Dominat8Logo({ variant = 'subtle', heartbeat = 0 }) {
  const isHero = variant === 'hero';
  const pulseClass = !isHero && heartbeat !== undefined ? 'aura-pulse' : '';
  return (
    <motion.span
      key={isHero ? 'hero' : heartbeat}
      className={cn('dominat8-logo', isHero ? 'dominat8-logo-hero' : 'dominat8-logo-subtle', pulseClass)}
      animate={isHero ? { scale: [1, 1.03, 1], opacity: [0.5, 0.7, 0.5] } : {}}
      transition={isHero ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : {}}
      aria-hidden
    >
      <img src={LOGO_8_SRC} alt="" className="dominat8-logo-img" width={isHero ? 160 : 28} height={isHero ? 160 : 28} />
    </motion.span>
  );
}

function ProgressBar({ progress, color, taskColor }) {
  const fillClass =
    taskColor === 'seo'
      ? 'progress-fill-green progress-pulse'
      : taskColor === 'healing'
      ? 'progress-fill-blue progress-pulse'
      : color === 'green'
      ? 'progress-fill-green'
      : color === 'orange'
      ? 'progress-fill-orange'
      : 'progress-fill-blue';
  return (
    <div className={cn('progress-track', taskColor && 'progress-track-pulse')}>
      <div className={cn('progress-fill', fillClass)} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
    </div>
  );
}

// Luxury Hero Showroom (.com): Cloud theme, pulsing 8, Hyper-Drive CTA — subtle 3D tilt (Nexus language)
// Intelligence Suite: Stealth Blog — Autonomous Blog section (Creative Director posts from Self-Healing wins)
function ShowroomView({ onLaunchLab, autonomousBlogPosts = [] }) {
  const [hyperdriving, setHyperdriving] = useState(false);
  const panelRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [4, -4]);
  const rotateY = useTransform(mouseX, [0, 1], [-4, 4]);
  const handleMouseMove = useCallback((e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);
  const handleLaunch = () => {
    setHyperdriving(true);
    try {
      sessionStorage.setItem(DOMINAT8_ENTERED_LAB_KEY, 'true');
    } catch (_) {}
    if (getIsShowroomDomain()) {
      setTimeout(() => {
        window.location.href = 'https://dominat8.io';
      }, 1200);
      return;
    }
    setTimeout(() => onLaunchLab?.(), 1200);
  };
  const latestPosts = autonomousBlogPosts.slice(-3).reverse();
  return (
    <motion.div
      className="showroom-bg fixed inset-0 flex flex-col items-center overflow-y-auto overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="showroom-gradient" aria-hidden />
      <motion.div
        ref={panelRef}
        className="showroom-content showroom-content-3d relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-[70vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1000, rotateX, rotateY }}
      >
        <Dominat8Logo variant="hero" />
        <h1 className="showroom-title mt-6 text-4xl sm:text-5xl font-light tracking-tight">
          Dominat8 Lab
        </h1>
        <p className="showroom-tagline mt-3 text-lg max-w-md">
          The AI factory that shows the work.
        </p>
        <motion.button
          type="button"
          onClick={handleLaunch}
          disabled={hyperdriving}
          className="showroom-launch-btn showroom-hyperdrive mt-12 px-10 py-4 rounded-full text-lg font-semibold tracking-wide border backdrop-blur-xl transition-colors disabled:opacity-70"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {hyperdriving ? (
            <motion.span
              className="inline-block"
              animate={{ opacity: [1, 0.7, 1], scale: [1, 1.02, 1] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              HYPER-DRIVE…
            </motion.span>
          ) : (
            'Hyper-Drive'
          )}
        </motion.button>
      </motion.div>

      {/* Autonomous Blog — Stealth SEO: posts from Creative Director / Self-Healing wins */}
      {latestPosts.length > 0 && (
        <motion.section
          className="showroom-blog w-full max-w-2xl px-6 pb-24 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-white/60" />
            Autonomous Blog
          </h2>
          <p className="text-white/50 text-sm mb-6">How we keep your sites live. Generated from Self-Healing wins.</p>
          <div className="space-y-4">
            {latestPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl p-5 border border-white/10 bg-white/5 text-left"
              >
                <time className="text-white/40 text-xs" dateTime={post.date}>{post.date}</time>
                <h3 className="text-lg font-semibold text-white/95 mt-1">{post.title}</h3>
                <p className="text-white/70 text-sm mt-2">{post.body}</p>
              </article>
            ))}
          </div>
        </motion.section>
      )}

      <AnimatePresence>
        {hyperdriving && (
          <motion.div
            className="hyperdrive-overlay fixed inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// AuraTerminal: Matrix-style fade-in lines (typed-by-AI feel) + blink cursor
function AuraTerminal({ type = 'agent', content = '', title, matrixStyle = true }) {
  const isDeploy = type === 'deploy';
  const className = isDeploy ? 'deploy-terminal' : 'agent-terminal';
  const lines = (content || '').split('\n');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {isDeploy && title && <div className="deploy-terminal-header">{title}</div>}
      <div className={cn(isDeploy ? 'deploy-terminal-line' : 'agent-terminal-line', matrixStyle && lines.length > 0 && 'terminal-matrix')} style={!(matrixStyle && lines.length > 0) ? { whiteSpace: 'pre-wrap' } : undefined}>
        {matrixStyle && lines.length > 0
          ? lines.map((line, i) => <div key={i} className="terminal-line" style={{ whiteSpace: 'pre-wrap' }}>{line || '\u00A0'}</div>)
          : content}
      </div>
    </motion.div>
  );
}

// Team Status widget: Agent brain avatars + glowing status rings (Cinematic)
const AGENT_RING_COLORS = { creativeDirector: '#ec4899', leadDev: '#22d3ee', qa: '#fbbf24', marketing: '#a78bfa' };
function TeamStatusWidget({ agencyTeam = {}, activeAgentLead }) {
  return (
    <div className="team-status-widget">
      <div className="team-status-header">Agency Intelligence</div>
      <ul className="team-status-list" aria-label="Agency agents">
        {AGENCY_AGENTS.map((agent, idx) => {
          const status = agencyTeam[agent.key] || 'idle';
          const isWorking = status === 'working' || idx === activeAgentLead;
          const ringColor = AGENT_RING_COLORS[agent.key] || '#94a3b8';
          return (
            <li key={agent.key} data-agent={agent.key} className={cn('team-status-item', isWorking && 'team-status-working')}>
              <span className={cn('agent-status-ring', agent.key, isWorking && 'working')} aria-hidden>
                <AgentBrainIcon className="agent-brain-icon" color={ringColor} />
              </span>
              <span className="team-status-label">{agent.short}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Block components (Live Blueprint drives these) ───
// Hero: "What would you like to build?" + GENERATE — target design alignment
function HeroBlock({ props: blockProps = {}, context }) {
  const heading = context?.conciergeOverrides?.heroHeading ?? blockProps.heading ?? 'What would you like to build?';
  const placeholder = context?.conciergeOverrides?.heroPlaceholder ?? blockProps.placeholder ?? 'Describe your project...';
  const onVibeFromImage = context?.onVibeFromImage;
  const onVoiceVibe = context?.onVoiceVibe;
  const onAuraCommand = context?.onAuraCommand;
  const heroDeepGlass = context?.heroDeepGlass;
  const [dragOver, setDragOver] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const fileInputRef = React.useRef(null);
  const recognitionRef = React.useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/') && onVibeFromImage) onVibeFromImage(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  };

  const onPaste = (e) => {
    const file = e.clipboardData?.files?.[0];
    handleFile(file);
  };

  const submitCommand = () => {
    const t = commandInput.trim();
    if (t && onAuraCommand) {
      onAuraCommand(t);
      setCommandInput('');
    }
  };

  const startVoiceListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !onVoiceVibe) return;
    if (voiceListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? '';
      onVoiceVibe(transcript);
    };
    rec.onend = () => setVoiceListening(false);
    rec.onerror = () => setVoiceListening(false);
    recognitionRef.current = rec;
    rec.start();
    setVoiceListening(true);
  };

  return (
    <div className="w-full max-w-2xl mb-8">
      <h1 className="hero-heading text-2xl sm:text-3xl font-semibold text-white/95 mb-6 text-center">
        {heading}
      </h1>
      <motion.div
        className={cn(
          'hero-input-wrap relative flex items-center rounded-2xl bg-white/5 border transition-all duration-200',
          dragOver ? 'border-white/30 ring-2 ring-white/20' : 'border-white/10 focus-within:border-white/20 focus-within:ring-2 focus-within:ring-white/10',
          heroDeepGlass && 'hero-input-deep-glass'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <span className="pl-5 flex-shrink-0 text-white/60">
          <Rocket className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitCommand()}
          placeholder={placeholder}
          className="w-full py-4 pl-3 pr-32 bg-transparent text-white placeholder-white/40 outline-none text-base"
          aria-label="Describe your project"
          onPaste={onPaste}
        />
        <div className="absolute right-2 flex items-center gap-2">
          {onAuraCommand && (
            <motion.button
              type="button"
              onClick={submitCommand}
              className="hero-generate-btn px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-500 hover:bg-blue-600 border-0 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              GENERATE
            </motion.button>
          )}
          {onVibeFromImage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; handleFile(f); e.target.value = ''; }}
                aria-hidden
              />
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-white/50 hover:text-white/80 text-xs"
                title="Drop or paste image to set vibe"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + Vibe
              </motion.button>
            </>
          )}
          {onVoiceVibe && (
            <motion.button
              type="button"
              onClick={startVoiceListen}
              className={cn('p-2 rounded-full transition-colors', voiceListening ? 'bg-red-500/30 text-red-300' : 'text-white/50 hover:text-white/80')}
              title="Voice: warmer, cooler, obsidian, cloud"
              aria-label="Voice vibe"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
      {onAuraCommand && (
        <p className="mt-2 text-white/40 text-xs text-center">
          Try: &quot;Creative Director, go Darker&quot; · &quot;make the cards more neon&quot; · &quot;cloud&quot;
        </p>
      )}
      {(onVibeFromImage || onVoiceVibe) && !onAuraCommand && (
        <p className="mt-2 text-white/40 text-xs text-center">
          Drop or paste image, or use mic: say &quot;warmer&quot;, &quot;cooler&quot;, &quot;obsidian&quot;, &quot;cloud&quot;
        </p>
      )}
    </div>
  );
}

function BentoStatsBlock({ props: blockProps, context }) {
  const { bentoStats = { uptime: '99.98%', traffic: '12.4K', optimizing: 'Active', speed: 93 } } = context || {};
  const speedVal = bentoStats.speed != null ? Math.round(bentoStats.speed) : null;
  return (
    <motion.div
      className="w-full max-w-4xl flex justify-center mb-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="bento-grid">
        <div className="bento-cell">
          <div className="bento-cell-label">Uptime</div>
          <div className="bento-cell-value">{bentoStats.uptime}</div>
        </div>
        <div className="bento-cell">
          <div className="bento-cell-label">Traffic</div>
          <div className="bento-cell-value">{bentoStats.traffic}</div>
        </div>
        <div className="bento-cell">
          <div className="bento-cell-label">Optimizing</div>
          <div className="bento-cell-value">{bentoStats.optimizing}</div>
        </div>
        {speedVal != null && (
          <div className="bento-cell">
            <div className="bento-cell-label">Speed</div>
            <div className="bento-cell-value">{speedVal}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DeploymentCardBlock({ props: blockProps, context }) {
  const {
    deployments = [],
    openFullScreen,
    onFixDeployment,
    healingId,
    selfHealingOn,
    agentTypingText,
    criticalErrorId,
    fullScreenId,
    isDeploying,
    deployLogText,
    onDeployClick,
    deployTarget,
    setDeployTarget,
    agencyTeam,
    activeAgentLead,
    deploymentStatus = 'unknown',
    vercelBuildLogs,
  } = context || {};
  const errorDeploymentId = selfHealingOn ? criticalErrorId : null;
  const taskColor = healingId || selfHealingOn ? 'healing' : (activeAgentLead === 0 || activeAgentLead === 2) ? 'seo' : undefined;
  const showAgentTerminal = selfHealingOn && agentTypingText !== null;
  const showDeployTerminal = isDeploying && deployLogText !== null;
  const showRealLogs = deploymentStatus === 'error' && vercelBuildLogs;
  const deployTargets = [
    { value: 'horizonaid-tech', label: 'horizonaid.tech' },
    { value: 'akiraspacepro-io', label: 'akiraspacepro.io' },
    { value: 'bloometapro-com', label: 'bloometapro.com' },
    { value: 'ai-command-center', label: 'ai-command-center (this app)' },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* System Vital: glowing orb (green / red pulse) — Self-Healing Bridge */}
      <div className="system-vital-wrap flex flex-col items-center gap-3">
        <span className="text-white/50 text-xs uppercase tracking-wider">System Vital</span>
        <div
          className={cn(
            'system-vital-orb',
            deploymentStatus === 'ok' && 'system-vital-ok',
            deploymentStatus === 'error' && 'system-vital-error'
          )}
          role="status"
          aria-label={deploymentStatus === 'ok' ? 'Vercel status: healthy' : deploymentStatus === 'error' ? 'Vercel status: error' : 'Vercel status: unknown'}
          title={deploymentStatus === 'ok' ? 'Vercel status: healthy' : deploymentStatus === 'error' ? 'Vercel status: error' : 'Vercel status: unknown'}
        />
      </div>
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-stretch gap-4 justify-center">
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          {showAgentTerminal && <AuraTerminal type="agent" content={agentTypingText} />}
          {showDeployTerminal && <AuraTerminal type="deploy" content={deployLogText} title="Build log" />}
          {showRealLogs && <AuraTerminal type="deploy" content={vercelBuildLogs} title="Vercel build logs (live)" />}
        </div>
        <TeamStatusWidget agencyTeam={agencyTeam} activeAgentLead={activeAgentLead} />
      </div>
      {onDeployClick && !showDeployTerminal && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          {setDeployTarget && (
            <label className="flex items-center gap-2 text-white/70 text-sm">
              <span>Deploy to:</span>
              <select
                value={deployTarget || 'horizonaid-tech'}
                onChange={(e) => setDeployTarget(e.target.value)}
                className="deploy-target-select rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Select Vercel project"
              >
                {deployTargets.map((t) => (
                  <option key={t.value} value={t.value} className="bg-gray-900 text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <motion.button
            type="button"
            onClick={onDeployClick}
            className="deploy-new-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Rocket className="w-5 h-5" />
            Deploy to Vercel
          </motion.button>
        </div>
      )}
      <h2 className="text-white/80 font-semibold text-lg mb-2 w-full max-w-4xl text-left">Deployments</h2>
      <div className="w-full flex flex-wrap justify-center gap-6">
        {deployments.map((d) => {
          const isError = d.status === 'Error' || (selfHealingOn && d.id === errorDeploymentId);
          const isHealing = healingId === d.id;
          return (
            <DeploymentCard3D
              key={d.id}
              layoutId={fullScreenId === d.id ? `deploy-card-${d.id}` : undefined}
              isHealing={isHealing}
              onClick={() => openFullScreen && openFullScreen(d.id)}
              isError={isError}
              d={d}
              taskColor={taskColor}
              agentTypingText={agentTypingText}
              onFixDeployment={onFixDeployment}
              selfHealingOn={selfHealingOn}
              healingId={healingId}
            />
          );
        })}
      </div>
    </div>
  );
}

// 3D Stage card: tilt from mouse, flip on hover to reveal SEO / Speed / Revenue (ACC)
function DeploymentCard3D({ layoutId, isHealing, onClick, isError, d, taskColor, agentTypingText, onFixDeployment, selfHealingOn, healingId }) {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const flipY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateYMouse = useTransform(mouseX, [0, 1], [-8, 8]);
  const rotateY = useTransform(() => rotateYMouse.get() + flipY.get());
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    flipY.set(0);
  }, [mouseX, mouseY, flipY]);
  const handleMouseEnter = useCallback(() => { flipY.set(180); }, [flipY]);
  const seoScore = Math.min(99, Math.max(70, (d.progress || 0) + 10));
  const speedVal = d.speed != null ? Math.round(d.speed) : '—';
  return (
    <motion.div
      ref={cardRef}
      layout
      layoutId={layoutId}
      className="deployment-card deployment-card-3d w-full sm:w-[280px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ perspective: 1200 }}
    >
      <motion.div
        className={cn(
          'deployment-card-3d-inner deployment-card deployment-card-glass deployment-card-flip relative rounded-2xl p-0 text-left cursor-pointer overflow-hidden',
          isHealing && 'healing-pulse'
        )}
        onClick={onClick}
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <div className="deployment-card-face deployment-card-front rounded-2xl p-6">
              {isHealing && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-emerald-400/60 pointer-events-none"
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  animate={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
              {d.label && (
                <p className="text-white/60 text-sm mb-1">{d.label}</p>
              )}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-white/90 font-medium text-lg truncate" title={d.url}>
                  {d.url}
                </span>
                {isError && (
                  <span className="critical-error-badge flex-shrink-0">CRITICAL ERROR</span>
                )}
                {!isError && d.status === 'New' && (
                  <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/25 text-blue-200 border border-blue-400/40">
                    New
                  </span>
                )}
                {!isError && d.status === 'ok' && (
                  <span className="flex-shrink-0 text-emerald-400" title="OK">
                    <CheckCircle className="w-5 h-5" />
                  </span>
                )}
              </div>
              <ProgressBar progress={d.progress} color={d.color} taskColor={isHealing ? 'healing' : taskColor} />
              <div className="mt-2 flex items-center justify-between text-white/40 text-sm">
                <span>{d.progress}% complete</span>
                {d.statusText ? (
                  <span className={cn(
                    'deployment-status-pill text-xs font-medium px-2 py-0.5 rounded-full',
                    d.status === 'ok' && 'text-emerald-400/90 bg-emerald-500/20',
                    d.status === 'New' && 'text-amber-400/90 bg-amber-500/20',
                    d.color === 'blue' && d.status === 'ok' && 'text-cyan-400/90 bg-cyan-500/20'
                  )}>
                    {d.statusText}
                  </span>
                ) : d.speed != null ? (
                  <span className="text-white/50 font-medium">Speed {Math.round(d.speed)}</span>
                ) : null}
              </div>
              {isError && !agentTypingText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-red-400/80 text-xs"
                >
                  SSL certificate expired. Self-heal in progress...
                </motion.div>
              )}
              {isError && onFixDeployment && !selfHealingOn && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'fix-btn-glow mt-4 w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 relative overflow-hidden',
                    'bg-orange-500/20 border border-orange-400/40 text-orange-300 hover:bg-orange-500/30 transition-colors',
                    healingId && 'cursor-wait'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFixDeployment(d.id);
                  }}
                  disabled={!!healingId}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(249, 115, 22, 0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {healingId === d.id ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="w-4 h-4" />
                      </motion.span>
                      <span>Fixing...</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-4 h-4" />
                      Fix
                    </>
                  )}
                </motion.button>
              )}
        </div>
        <div className="deployment-card-face deployment-card-back rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-white/50 text-xs uppercase tracking-wider">Metrics</span>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">SEO</span>
              <span className="text-emerald-400 font-semibold">{seoScore}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Speed</span>
              <span className="text-cyan-300 font-semibold">{speedVal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Revenue</span>
              <span className="text-amber-400 font-semibold">—</span>
            </div>
          </div>
          <p className="text-white/40 text-xs">Hover to flip back</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Viral Growth: Lead Magnet — simulates social scan ("AI Website Builder", "Lovable alternative"), Draft Site notifications
const SOCIAL_TREND_SOURCES = [
  { keyword: 'AI Website Builder', handle: '@buildwithai' },
  { keyword: 'Lovable alternative', handle: '@nocode_seeker' },
  { keyword: 'AI site builder', handle: '@startupfounder' },
];
function LeadMagnetPanelBlock({ draftLeads = [], onScan, onCreateInvite }) {
  return (
    <motion.div
      className="w-full max-w-2xl rounded-2xl p-8 deployment-card-glass border border-white/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span style={{ color: '#a855f7' }}>
          <Target className="w-8 h-8" />
        </span>
        <h2 className="text-xl font-semibold text-white/95">Lead Magnet</h2>
      </div>
      <p className="text-white/60 text-sm mb-4">Monitors social mentions of &quot;AI Website Builder&quot; and &quot;Lovable alternative&quot;. Draft builds are created in the background; Creative Director sends a personalized invite.</p>
      <motion.button
        type="button"
        onClick={onScan}
        className="mb-6 px-4 py-2 rounded-xl bg-violet-500/25 border border-violet-400/40 text-violet-200 hover:bg-violet-500/35 text-sm font-medium flex items-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Zap className="w-4 h-4" />
        Scan social trends now
      </motion.button>
      <div className="text-white/50 text-xs uppercase tracking-wider mb-3">Draft Site notifications</div>
      <div className="space-y-3 max-h-72 overflow-y-auto">
        {draftLeads.length === 0 ? (
          <p className="text-white/40 text-sm italic">No draft builds yet. Run a scan to simulate new leads.</p>
        ) : (
          draftLeads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl p-4 border border-white/10 bg-white/5 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-white/90 font-medium text-sm">{lead.handle} — {lead.source}</p>
                <p className="text-white/50 text-xs mt-0.5">Draft: {lead.suggestedSite}</p>
              </div>
              {!lead.invited ? (
                <button
                  type="button"
                  onClick={() => onCreateInvite(lead)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/30 border border-violet-400/40 text-violet-200 hover:bg-violet-500/50"
                >
                  Create invite
                </button>
              ) : (
                <span className="text-emerald-400/90 text-xs font-medium">Invite sent</span>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// Intelligence Suite: Autonomous Ad Architect — FB/Google ad copy from Pulse (Marketing tab)
function MarketingPanelBlock({ nightShiftLog = [], seoHealth = {} }) {
  const [generatedAds, setGeneratedAds] = useState(null);
  const recent = (nightShiftLog || []).slice(-40);
  const trafficEvents = recent.filter((e) => /Deploy|Vercel|Marketing|traffic/i.test(e.message)).length;
  const score = seoHealth.score ?? 85;
  const keywords = (seoHealth.keywords || []).slice(0, 5).join(', ') || 'AI, automation, uptime';
  const generateAds = () => {
    const fbHeadline = `We just hit ${score} SEO score and ${trafficEvents} deploy events this week.`;
    const fbBody = `Dominat8 runs your site on autopilot. Self-healing, SEO, and analytics — no manual work. Keywords: ${keywords}.`;
    const googleHeadline = `Dominat8 Lab | ${score} SEO · Self-Healing Sites`;
    const googleDesc = `Sites that fix themselves. ${trafficEvents} automated events. Trending: ${keywords}. Join the AI factory.`;
    setGeneratedAds({ fb: { headline: fbHeadline, body: fbBody }, google: { headline: googleHeadline, desc: googleDesc } });
  };
  return (
    <motion.div
      className="w-full max-w-2xl rounded-2xl p-8 deployment-card-glass border border-white/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span style={{ color: '#f59e0b' }}>
          <Megaphone className="w-8 h-8" />
        </span>
        <h2 className="text-xl font-semibold text-white/95">Autonomous Ad Architect</h2>
      </div>
      <p className="text-white/60 text-sm mb-4">High-conversion ad copy generated from your latest Growth Heartbeat (SEO + Traffic).</p>
      <button
        type="button"
        onClick={generateAds}
        className="mb-4 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 hover:bg-amber-500/30 text-sm font-medium"
      >
        Generate Facebook &amp; Google Ads
      </button>
      {generatedAds && (
        <div className="space-y-4 text-sm">
          <div className="rounded-xl bg-white/5 p-4 border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Facebook Ad</div>
            <p className="font-semibold text-white/90">{generatedAds.fb.headline}</p>
            <p className="text-white/70 mt-1">{generatedAds.fb.body}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Google Ad</div>
            <p className="font-semibold text-white/90">{generatedAds.google.headline}</p>
            <p className="text-white/70 mt-1">{generatedAds.google.desc}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Intelligence Suite: Concierge Support Agent — 24/7 widget; Lead Dev applies design changes to JSON
function ConciergeSupportWidget({ isOpen, onOpen, onClose, onSubmit }) {
  const [input, setInput] = useState('');
  const handleSubmit = () => {
    const t = input.trim();
    if (!t) return;
    onSubmit(t);
    setInput('');
    onClose();
  };
  return (
    <>
      {!isOpen && (
        <motion.button
          type="button"
          onClick={onOpen}
          className="concierge-fab fixed bottom-20 right-6 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-violet-500/90 border border-white/20 shadow-lg text-white hover:bg-violet-500"
          aria-label="Open Support"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden />
            <motion.div
              className="concierge-panel fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl p-4 deployment-card-glass border border-white/20 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-white/95 font-semibold">
                  <MessageCircle className="w-5 h-5 text-violet-400" />
                  Concierge Support
                </span>
                <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10" aria-label="Close"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-white/50 text-xs mb-3">Ask for design changes. Lead Dev will apply them to the JSON.</p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Change hero title to Welcome"
                className="w-full h-24 rounded-xl bg-black/30 border border-white/10 text-white/90 text-sm p-3 resize-none placeholder:text-white/40"
                aria-label="Support request"
              />
              <motion.button
                type="button"
                onClick={handleSubmit}
                className="w-full mt-2 py-2.5 rounded-xl font-medium bg-violet-500/30 border border-violet-400/40 text-white hover:bg-violet-500/50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Send — Lead Dev will apply
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Elite Operations: Ghost Copywriter — convert Uptime/Self-Heal logs into Success Stories
function CaseStudiesPanelBlock({ nightShiftLog = [], onGenerateSuccessStory }) {
  const [generatedStory, setGeneratedStory] = useState(null);
  const generate = () => {
    const healing = nightShiftLog.filter((e) => /Self-Heal|SSL|Certificate|repair|Lead Dev|fix applied/i.test(e.message));
    const seo = nightShiftLog.filter((e) => /SEO|Scanned|keyword|Trend/i.test(e.message));
    const url = healing[0]?.message?.match(/'([^']+)'/)?.[1] || 'your-site.com';
    const title = `How We Kept ${url} at 99.9% Uptime`;
    const body = `${healing.length} self-healing event(s) and ${seo.length} SEO optimization(s) in the last cycle. Zero manual intervention. Our Lead Dev and Creative Director agents detected issues and applied fixes before users noticed.`;
    setGeneratedStory({ title, body, metrics: { uptime: '99.9%', selfHealEvents: healing.length, seoUpdates: seo.length } });
    onGenerateSuccessStory?.({ title, body });
  };
  return (
    <motion.div
      className="w-full max-w-2xl rounded-2xl p-8 deployment-card-glass border border-white/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span style={{ color: '#06b6d4' }}><BookOpen className="w-8 h-8" /></span>
        <h2 className="text-xl font-semibold text-white/95">Ghost Copywriter</h2>
      </div>
      <p className="text-white/60 text-sm mb-4">Turns Self-Healing and uptime logs into professional Success Stories for the .com Showroom.</p>
      <button type="button" onClick={generate} className="mb-6 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30 text-sm font-medium">Generate Success Story</button>
      {generatedStory && (
        <div className="rounded-xl p-5 border border-white/10 bg-white/5 space-y-3">
          <h3 className="text-lg font-semibold text-white/90">{generatedStory.title}</h3>
          <p className="text-white/70 text-sm">{generatedStory.body}</p>
          <div className="flex gap-4 text-xs text-white/50">
            <span>Uptime: {generatedStory.metrics.uptime}</span>
            <span>Self-Heal: {generatedStory.metrics.selfHealEvents}</span>
            <span>SEO: {generatedStory.metrics.seoUpdates}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Elite Operations: Feature Control — toggle Social Agent & SEO Autopilot per deployment
function FeatureControlPanelBlock({ deployments = [], featureFlagsByDeployment = {}, onToggleFeature }) {
  return (
    <motion.div
      className="w-full max-w-2xl rounded-2xl p-8 deployment-card-glass border border-white/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span style={{ color: '#64748b' }}><Sliders className="w-8 h-8" /></span>
        <h2 className="text-xl font-semibold text-white/95">Feature Control</h2>
      </div>
      <p className="text-white/60 text-sm mb-4">Turn Social Agent and SEO Autopilot ON or OFF per deployment (subscription-level control).</p>
      <div className="space-y-4">
        {deployments.map((d) => {
          const flags = featureFlagsByDeployment[d.id] ?? { socialAgent: true, seoAutopilot: true };
          return (
            <div key={d.id} className="rounded-xl p-4 border border-white/10 bg-white/5">
              <p className="text-white/90 font-medium text-sm mb-3">{d.url}</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={!!flags.socialAgent} onChange={() => onToggleFeature?.(d.id, 'socialAgent', !flags.socialAgent)} className="rounded" />
                  Social Agent
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={!!flags.seoAutopilot} onChange={() => onToggleFeature?.(d.id, 'seoAutopilot', !flags.seoAutopilot)} className="rounded" />
                  SEO Autopilot
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// View panel shown when a dock item other than Deploy is selected (navigation content)
const VIEW_PANEL_CONFIG = {
  deploy: { label: 'Deploy', description: 'Deploy and manage your projects.', Icon: Rocket },
  domains: { label: 'Domains', description: 'Manage custom domains and DNS records.', Icon: Globe },
  ssl: { label: 'SSL', description: 'Certificates and HTTPS status for your deployments.', Icon: Lock },
  monitor: { label: 'Monitor', description: 'Uptime, logs, and performance metrics.', Icon: Monitor },
  fix: { label: 'Fix', description: 'Self-heal and repair deployment issues.', Icon: Wrench },
  automate: { label: 'Automate', description: 'Workflows and automation rules.', Icon: Sparkles },
  integrate: { label: 'Integrate', description: 'Connect APIs, webhooks, and third-party services.', Icon: PenLine },
  settings: { label: 'Settings', description: 'Project and account preferences.', Icon: Settings },
};

function ViewPanelBlock({ props: blockProps, context }) {
  const { viewId = 'domains' } = blockProps;
  const config = VIEW_PANEL_CONFIG[viewId] || VIEW_PANEL_CONFIG.domains;
  const Icon = config.Icon;
  const nightShiftLog = context?.nightShiftLog || [];

  if (viewId === 'revenue') {
    const referralBase = 'https://dominat8.io?ref=';
    const referralCode = context?.referralCode || 'dashboard';
    const referralLink = referralBase + referralCode;
    const badgeSnippet = `<a href="${referralLink}" target="_blank" rel="noopener" class="dominat8-badge">Built with Dominat8</a>`;
    return (
      <motion.div
        className="w-full max-w-2xl rounded-2xl p-8 deployment-card-glass border border-white/10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span style={{ color: '#10b981' }}>
            <DollarSign className="w-8 h-8" />
          </span>
          <h2 className="text-xl font-semibold text-white/95">Revenue & Affiliate</h2>
        </div>
        <p className="text-white/60 text-sm mb-4">Every site built with Dominat8 shows a high-end referral badge. When a visitor signs up via your link, you share the revenue.</p>
        <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10 mb-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Your referral link (use on all child deployments)</div>
          <code className="text-emerald-400/90 text-sm break-all font-mono">{referralLink}</code>
          <button
            type="button"
            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
            onClick={() => navigator.clipboard?.writeText(referralLink)}
          >
            Copy link
          </button>
        </div>
        <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Built with Dominat8 badge (embed on every site)</div>
          <pre className="text-white/70 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">{badgeSnippet}</pre>
          <button
            type="button"
            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
            onClick={() => navigator.clipboard?.writeText(badgeSnippet)}
          >
            Copy badge code
          </button>
        </div>
      </motion.div>
    );
  }

  if (viewId === 'leads') {
    return (
      <LeadMagnetPanelBlock
        draftLeads={context?.draftLeads || []}
        onScan={context?.onLeadScan}
        onCreateInvite={context?.onCreateLeadInvite}
      />
    );
  }

  if (viewId === 'marketing') {
    return (
      <MarketingPanelBlock nightShiftLog={nightShiftLog} seoHealth={context?.seoHealth} />
    );
  }

  if (viewId === 'case-studies') {
    return (
      <CaseStudiesPanelBlock
        nightShiftLog={nightShiftLog}
        onGenerateSuccessStory={context?.onGenerateSuccessStory}
      />
    );
  }
  if (viewId === 'feature-control') {
    return (
      <FeatureControlPanelBlock
        deployments={context?.deployments || []}
        featureFlagsByDeployment={context?.featureFlagsByDeployment || {}}
        onToggleFeature={context?.onToggleFeature}
      />
    );
  }

  if (viewId === 'summary') {
    const creative = nightShiftLog.filter((e) => e.message.startsWith('Creative') || e.message.startsWith('Vibe-Sync')).length;
    const leadDev = nightShiftLog.filter((e) => e.message.startsWith('Lead Dev')).length;
    const qa = nightShiftLog.filter((e) => e.message.startsWith('QA')).length;
    const marketing = nightShiftLog.filter((e) => e.message.startsWith('Marketing')).length;
    const retentionHooks = context?.retentionHooks || [];
    return (
      <motion.div
        className="w-full max-w-2xl rounded-2xl p-8 deployment-card-glass border border-white/10 morning-report-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <span style={{ color: '#8b5cf6' }}>
            <FileText className="w-8 h-8" />
          </span>
          <h2 className="text-xl font-semibold text-white/95">Morning Report</h2>
        </div>
        {retentionHooks.length > 0 && (
          <div className="rounded-xl p-4 border border-amber-500/30 bg-amber-500/10 mb-6">
            <div className="text-amber-400/90 text-xs uppercase tracking-wider mb-2">User Pulse — Retention Hooks</div>
            <ul className="space-y-2">
              {retentionHooks.map((h) => (
                <li key={h.id} className="text-sm text-white/90">{h.message}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-white/60 text-sm mb-6">Summary of value generated by the Aura Agency overnight.</p>
        <div className="morning-report-stats grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider">Creative Director</div>
            <div className="text-lg font-semibold text-white/90">{creative} updates</div>
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider">Lead Dev</div>
            <div className="text-lg font-semibold text-white/90">{leadDev} refactors</div>
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider">QA</div>
            <div className="text-lg font-semibold text-white/90">{qa} scans</div>
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 border border-white/10">
            <div className="text-white/50 text-xs uppercase tracking-wider">Marketing</div>
            <div className="text-lg font-semibold text-white/90">{marketing} suggestions</div>
          </div>
        </div>
        <div className="morning-report-log">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Recent activity (aura_night_shift)</div>
          <ul className="space-y-1 max-h-64 overflow-y-auto text-sm text-white/70 font-mono">
            {nightShiftLog.slice(-24).reverse().map((entry, i) => (
              <li key={`${entry.time}-${i}`}>
                <span className="text-white/40">[{entry.time}]</span> {entry.message}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-2xl rounded-2xl p-8 deployment-card-glass border border-white/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span style={{ color: DOCK_ITEMS.find((d) => d.id === viewId)?.color || '#94a3b8' }}>
          <Icon className="w-8 h-8" />
        </span>
        <h2 className="text-xl font-semibold text-white/95">{config.label}</h2>
      </div>
      <p className="text-white/50 text-sm leading-relaxed">{config.description}</p>
    </motion.div>
  );
}

// Morning Report Modal: beautiful startup summary of Night Shift (Production Engine)
function MorningReportModal({ nightShiftLog, onClose }) {
  const creative = nightShiftLog.filter((e) => e.message.startsWith('Creative') || e.message.startsWith('Vibe-Sync')).length;
  const leadDev = nightShiftLog.filter((e) => e.message.startsWith('Lead Dev')).length;
  const qa = nightShiftLog.filter((e) => e.message.startsWith('QA')).length;
  const marketing = nightShiftLog.filter((e) => e.message.startsWith('Marketing')).length;
  const seo = nightShiftLog.filter((e) => e.message.includes('SEO') || e.message.includes('Scanned')).length;
  const ssl = nightShiftLog.filter((e) => e.message.includes('SSL') || e.message.includes('Certificate') || e.message.includes('Self-Heal')).length;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="morning-report-modal relative max-w-lg w-full rounded-3xl p-8 deployment-card-glass border border-white/20 shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.span className="text-3xl" style={{ color: '#8b5cf6' }} animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <FileText className="w-10 h-10" />
            </motion.span>
            <div>
              <h2 className="text-2xl font-bold text-white/98">Morning Report</h2>
              <p className="text-white/50 text-sm">What the Night Shift accomplished</p>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Creative Director', value: creative, sub: 'Vibe & glow', color: '#ec4899' },
            { label: 'Lead Dev', value: leadDev, sub: 'Refactors', color: '#3b82f6' },
            { label: 'QA', value: qa, sub: 'Scans', color: '#22c55e' },
            { label: 'Marketing', value: marketing, sub: 'Suggestions', color: '#f59e0b' },
            { label: 'SEO wins', value: seo, sub: 'Keywords', color: '#8b5cf6' },
            { label: 'SSL / Self-Heal', value: ssl, sub: 'Fixes', color: '#eab308' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-xl bg-white/5 px-4 py-3 border border-white/10"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <div className="text-white/50 text-xs uppercase tracking-wider">{stat.label}</div>
              <div className="text-xl font-bold text-white/95" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
        <div className="mb-4">
          <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Recent activity (aura_night_shift)</div>
          <ul className="space-y-1 max-h-48 overflow-y-auto text-sm text-white/70 font-mono">
            {nightShiftLog.slice(-16).reverse().map((entry, i) => (
              <li key={`${entry.time}-${i}`}>
                <span className="text-white/40">[{entry.time}]</span> {entry.message}
              </li>
            ))}
          </ul>
        </div>
        <motion.button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl font-semibold bg-white/10 border border-white/20 text-white/90 hover:bg-white/15 transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          Got it — start the day
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Empire: Blueprint Store modal — 3 Prime templates, 3D hover, One-Click Install
function BlueprintStoreModal({ isOpen, onClose, primeBlueprints = PRIME_BLUEPRINTS, installedBlueprintId, onInstall }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
        <motion.div
          className="blueprint-store-modal relative max-w-2xl w-full rounded-3xl p-8 deployment-card-glass border border-white/20 shadow-2xl"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Store className="w-10 h-10" style={{ color: '#8b5cf6' }} />
              <div>
                <h2 className="text-2xl font-bold text-white/98">Blueprint Store</h2>
                <p className="text-white/50 text-sm">Prime templates — one-click install</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10" aria-label="Close"><X className="w-6 h-6" /></button>
          </div>
          <div className="grid gap-4">
            {primeBlueprints.map((bp, idx) => {
              const isInstalled = installedBlueprintId === bp.id;
              return (
                <motion.div
                  key={bp.id}
                  className="blueprint-card-3d rounded-2xl p-5 border border-white/10 bg-white/5 relative overflow-hidden"
                  style={{ ['--accent']: bp.accent }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ scale: 1.02, rotateY: 8 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white/95">{bp.name}</h3>
                      <p className="text-sm text-white/60 mt-1">{bp.description}</p>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => !isInstalled && onInstall(bp.id)}
                      disabled={isInstalled}
                      className={cn(
                        'px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap',
                        isInstalled ? 'bg-white/10 text-white/50 cursor-default' : 'bg-white/15 text-white/90 hover:bg-white/20 border border-white/20'
                      )}
                      whileHover={!isInstalled ? { scale: 1.05 } : {}}
                      whileTap={!isInstalled ? { scale: 0.98 } : {}}
                    >
                      {isInstalled ? 'Installed' : 'One-Click Install'}
                    </motion.button>
                  </div>
                  {isInstalled && (
                    <span className="absolute top-3 right-3 text-xs text-emerald-400/90 font-medium">Active</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Empire: Upgrade to Pro modal (subscription gate CTA)
function UpgradeProModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} aria-hidden />
        <motion.div
          className="upgrade-pro-modal relative max-w-sm w-full rounded-3xl p-8 deployment-card-glass border border-amber-500/30 shadow-2xl nexus-modal-bloom"
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Crown className="w-10 h-10 text-amber-400" />
            </motion.span>
            <h2 className="text-xl font-bold text-white/95">Upgrade to Pro</h2>
          </div>
          <p className="text-white/60 text-sm mb-6">Unlock Self-Healing, Content Creator, and Vercel Monitor. Priority support and exclusive blueprints.</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 text-sm font-medium">Maybe later</button>
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-amber-500/30 border border-amber-400/40 text-amber-200 hover:bg-amber-500/40 text-sm font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Upgrade Now
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Single social script (legacy)
function generateSocialScript(nightShiftLog) {
  return generateSocialScripts(nightShiftLog)[0];
}

// Viral Content Factory: 3 TikTok scripts with hooks from aura_night_shift (ACC)
function generateSocialScripts(nightShiftLog) {
  const recent = (nightShiftLog || []).slice(-30);
  const ssl = recent.filter((e) => /SSL|Certificate|Self-Heal|Healing|fix|error/i.test(e.message));
  const seo = recent.filter((e) => /SEO|Scanned|trending|Trend/i.test(e.message));
  const deploy = recent.filter((e) => /Deploy|Vercel|Sync|build/i.test(e.message));
  const hooks = [
    'How I built an AI that fixes itself while I sleep.',
    'Our dashboard just fixed a production error at 3am. No coffee needed.',
    'The command center that ships while you sleep — here\'s what ran last night.',
  ];
  const bodies = [];
  if (ssl.length) bodies.push(`Our Self-Healing agent ran ${ssl.length} time(s) last night. SSL and cert checks, zero manual intervention. The logs are right there in the dashboard.`);
  if (seo.length) bodies.push(`SEO Autopilot scanned for trending keywords ${seo.length} time(s). Meta tags and headers update live.`);
  if (deploy.length) bodies.push(`We had ${deploy.length} deploy/sync event(s). Vercel status, build logs, System Vital orb — one place.`);
  if (!bodies.length && recent.length) bodies.push(`The night shift log has ${recent.length} entries. Every agent action turns into content like this.`);
  const cta = 'CTA: "Link in bio — dominat8.com showroom, dominat8.io engine. Hit Hyper-Drive."';
  const vibe = 'Vibe: Obsidian / glass UI. Audio: minimal tech or trending "productivity build" sound.';
  return hooks.map((hook, i) => {
    const body = bodies[i % bodies.length] || bodies[0] || 'Dominat8 Lab — the AI factory that shows the work.';
    return `Hook (first 3 sec):\n"${hook}"\n\nBody:\n${body}\n\n${cta}\n\n${vibe}`;
  });
}

// Empire: Growth Heartbeat — SEO + Traffic from agent logs (Pulse Analytics)
function GrowthHeartbeat({ nightShiftLog = [], seoHealth = {} }) {
  const recent = (nightShiftLog || []).slice(-50);
  const seoCount = recent.filter((e) => /SEO|Scanned|trending|Trend|keyword/i.test(e.message)).length;
  const trafficCount = recent.filter((e) => /Deploy|Vercel|Sync|build|Marketing|traffic/i.test(e.message)).length;
  const maxVal = Math.max(seoCount, trafficCount, 1);
  const seoPct = Math.min(100, (seoCount / maxVal) * 100);
  const trafficPct = Math.min(100, (trafficCount / maxVal) * 100);
  const score = seoHealth.score ?? 85;
  return (
    <motion.div
      className="growth-heartbeat rounded-2xl p-4 border border-white/10 bg-white/5 mb-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-emerald-400/90" />
        <span className="text-sm font-semibold text-white/90">Growth Heartbeat</span>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <div className="flex justify-between text-white/60 mb-0.5">SEO (from logs)</div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div className="h-full rounded-full bg-emerald-500/80" initial={{ width: 0 }} animate={{ width: `${seoPct}%` }} transition={{ duration: 0.6 }} />
          </div>
          <span className="text-white/50">{seoCount} events</span>
        </div>
        <div>
          <div className="flex justify-between text-white/60 mb-0.5">Traffic / Deploy</div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div className="h-full rounded-full bg-blue-500/80" initial={{ width: 0 }} animate={{ width: `${trafficPct}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
          </div>
          <span className="text-white/50">{trafficCount} events</span>
        </div>
        <div className="pt-1 text-white/50">SEO Score: <span className="text-white/80 font-medium">{score}</span></div>
      </div>
    </motion.div>
  );
}

// Agency Intelligence sidebar: Live workstations + Content Creator (Content & Commerce Engine)
function AgencyIntelligenceSidebar({ nightShiftLog = [], agencyTeam = {}, activeAgentLead, isOpen, onClose, seoHealth, isPro, onUpgradePro, onGlobalUpdate }) {
  const [generatedScript, setGeneratedScript] = useState(null);
  const creativeTasks = nightShiftLog.filter((e) => e.message.startsWith('Creative') || e.message.startsWith('Vibe-Sync')).slice(-5).reverse();
  const leadDevTasks = nightShiftLog.filter((e) => e.message.startsWith('Lead Dev')).slice(-5).reverse();
  const qaTasks = nightShiftLog.filter((e) => e.message.startsWith('QA')).slice(-5).reverse();
  const marketingTasks = nightShiftLog.filter((e) => e.message.startsWith('Marketing')).slice(-5).reverse();
  const workstations = [
    { key: 'creativeDirector', label: 'Creative Director', short: 'Creative', tasks: creativeTasks, color: '#ec4899' },
    { key: 'leadDev', label: 'Lead Dev', short: 'Lead Dev', tasks: leadDevTasks, color: '#22d3ee' },
    { key: 'qa', label: 'QA', short: 'QA', tasks: qaTasks, color: '#fbbf24' },
    { key: 'marketing', label: 'Marketing', short: 'Marketing', tasks: marketingTasks, color: '#a78bfa' },
  ];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            className="agency-sidebar social-lab-drawer fixed top-0 right-0 h-full w-full max-w-sm z-50 deployment-card-glass border-l border-white/10 shadow-2xl overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white/95 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                  Social Lab
                  {isPro === false && (
                    <span className="pro-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Crown className="w-3 h-3" /> Pro
                    </span>
                  )}
                </h2>
                <p className="text-xs text-white/50 mt-0.5">TikTok &amp; Facebook scripts from aura_night_shift</p>
                {isPro === false && onUpgradePro && (
                  <button type="button" onClick={onUpgradePro} className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-medium">
                    Upgrade to Pro →
                  </button>
                )}
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10" aria-label="Close sidebar"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-6">
              {onGlobalUpdate && (
                <motion.button
                  type="button"
                  onClick={onGlobalUpdate}
                  className="w-full py-3 rounded-xl font-medium bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  title="Apply Self-Healing patch to all deployments"
                >
                  <Zap className="w-5 h-5" />
                  Global Update (Commander)
                </motion.button>
              )}
              <GrowthHeartbeat nightShiftLog={nightShiftLog} seoHealth={seoHealth} />
              {workstations.map((ws, idx) => {
                const isWorking = idx === activeAgentLead;
                return (
                  <motion.div
                    key={ws.key}
                    className="workstation rounded-2xl p-4 border border-white/10 bg-white/5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn('agent-status-ring', ws.key, isWorking && 'working')} aria-hidden>
                        <AgentBrainIcon className="agent-brain-icon" color={ws.color} />
                      </span>
                      <span className="font-semibold text-white/90" style={{ color: ws.color }}>{ws.label}</span>
                      {isWorking && <motion.span className="text-xs text-white/50" animate={{ opacity: [0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>Working...</motion.span>}
                    </div>
                    <ul className="space-y-1.5 text-sm text-white/70">
                      {ws.tasks.length === 0 ? (
                        <li className="text-white/40 italic">No recent tasks</li>
                      ) : (
                        ws.tasks.map((t, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-white/40 text-xs mt-0.5">[{t.time}]</span>
                            <span>{t.message}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </motion.div>
                );
              })}

              {/* Content Creator: 3 TikTok scripts from night_shift (ACC Viral Sidebar) — Empire: Pro badge */}
              <motion.div
                className="workstation rounded-2xl p-4 border border-white/10 bg-white/5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold text-white/90">Content Creator</span>
                  {isPro === false && (
                    <span className="pro-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Crown className="w-3 h-3" /> Pro
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-xs mb-3">Ready-to-post TikTok scripts from aura_night_shift. Hooks like &quot;How I built an AI that fixes itself while I sleep.&quot;</p>
                <motion.button
                  type="button"
                  onClick={() => setGeneratedScript(generateSocialScripts(nightShiftLog).join('\n\n———\n\n'))}
                  className="w-full py-2.5 rounded-xl font-medium bg-amber-500/20 border border-amber-400/40 text-amber-200 hover:bg-amber-500/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Generate 3 TikTok Scripts
                </motion.button>
                {generatedScript && (
                  <textarea
                    readOnly
                    className="mt-3 w-full h-48 rounded-xl bg-black/30 border border-white/10 text-white/80 text-xs p-3 resize-none font-mono"
                    value={generatedScript}
                    aria-label="Generated scripts"
                  />
                )}
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function InteractiveDockBlock({ props: blockProps, context }) {
  const { activeView, setActiveView, dockItems = DOCK_ITEMS, onFocusMode, cinematicFocus } = context || {};
  if (cinematicFocus) return null;
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20" aria-label="Main navigation">
      <div className="dock flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/10">
        {dockItems.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            className={cn(
              'dock-icon-btn flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 min-w-[4rem]',
              activeView === item.id && 'bg-white/15'
            )}
            style={{
              color: item.color,
              opacity: activeView === item.id ? 1 : 0.7,
            }}
            title={item.label}
            aria-label={item.label}
            aria-pressed={activeView === item.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => {
              setActiveView && setActiveView(item.id);
              if (item.id === 'deploy') onFocusMode && onFocusMode();
            }}
          >
            <item.Icon className="w-6 h-6 flex-shrink-0" />
            <span className="dock-label text-[10px] font-medium uppercase tracking-wider opacity-90">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
}

const COMPONENT_MAP = {
  Hero: HeroBlock,
  BentoStats: BentoStatsBlock,
  DeploymentCard: DeploymentCardBlock,
  ViewPanel: ViewPanelBlock,
  InteractiveDock: InteractiveDockBlock,
};

// ─── renderPage: JSON-to-UI (Live Blueprint Engine) ───
// Tighter stagger for cohesive first paint — avoids "parts" loading feeling
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function renderPage(blueprint, context) {
  return (
    <motion.div
      className="aura-render flex flex-col items-center pt-12 pb-28 px-4 w-full gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {blueprint.map((block, index) => {
        const Component = COMPONENT_MAP[block.type];
        if (!Component) return null;
        return (
          <motion.div
            key={block.id || index}
            variants={itemVariants}
            className="w-full max-w-4xl flex flex-col items-center"
          >
            <Component props={block.props || {}} context={context} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Multi-step labels for DNS / SSL onboarding
const DNS_STEPS = ['Pending', 'Propagating', 'Live'];
const SSL_STEPS = ['Pending', 'Issuing', 'Secured'];

function StepProgress({ progress, steps, label }) {
  const stepIndex = progress >= 100 ? 2 : progress >= 33 ? 1 : 0;
  const segmentFill0 = stepIndex >= 1 ? 100 : stepIndex === 0 ? (progress / 33) * 100 : 0;
  const segmentFill1 = stepIndex >= 2 ? 100 : stepIndex === 1 ? ((progress - 33) / 67) * 100 : 0;
  return (
    <div className="full-screen-section">
      <div className="focus-progress-label">{label}</div>
      <div className="focus-steps">
        {steps.map((name, i) => (
          <React.Fragment key={name}>
            <div className="focus-step">
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    'focus-step-dot',
                    i < stepIndex && 'done',
                    i === stepIndex && 'active'
                  )}
                  animate={i === stepIndex ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                />
                <span
                  className={cn(
                    'focus-step-label',
                    i < stepIndex && 'done',
                    i === stepIndex && 'active'
                  )}
                >
                  {name}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="focus-step-line">
                <motion.div
                  className="focus-step-line-fill"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${i === 0 ? segmentFill0 : segmentFill1}%`,
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <ProgressBar progress={progress} color={label.toLowerCase().includes('dns') ? 'green' : 'blue'} />
    </div>
  );
}

const ONBOARDING_STEP_LABELS = ['Domain Check', 'DNS Config', 'Final Launch'];

// ─── Full-screen DNS/SSL (Focus Mode – layoutId explosion) + Auto-onboarding steps ───
function FullScreenSetup({ deployment, onClose, closing, focusModeProgress, onboardingStep }) {
  const dnsProgress = focusModeProgress?.dns ?? 0;
  const sslProgress = focusModeProgress?.ssl ?? 0;
  const isOnboarding = onboardingStep != null && onboardingStep >= 0 && onboardingStep <= 2;
  return (
    <motion.div
      className="full-screen-overlay focus-mode-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        layoutId={deployment ? `deploy-card-${deployment.id}` : undefined}
        className="full-screen-card focus-mode-card"
        onClick={(e) => e.stopPropagation()}
        initial={false}
        animate={{ opacity: 1, scale: closing ? 0.96 : 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-white/95 truncate pr-4">{deployment?.url}</h3>
          <motion.button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
        <ProgressBar progress={deployment?.progress ?? 0} color={deployment?.color ?? 'green'} />
        <p className="mt-2 mb-5 text-white/50 text-sm">{deployment?.progress ?? 0}% complete</p>

        {isOnboarding && (
          <div className="mb-4 flex gap-2 flex-wrap">
            {ONBOARDING_STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  'text-xs font-semibold px-2.5 py-1 rounded-lg',
                  i === onboardingStep
                    ? 'bg-blue-500/25 text-blue-200 border border-blue-400/40'
                    : i < onboardingStep
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-white/5 text-white/40 border border-white/10'
                )}
              >
                {i + 1}. {label}
              </span>
            ))}
          </div>
        )}

        <StepProgress progress={dnsProgress} steps={DNS_STEPS} label="DNS propagation" />
        <StepProgress progress={sslProgress} steps={SSL_STEPS} label="SSL issuance" />
      </motion.div>
      <button type="button" className="absolute inset-0 -z-10" onClick={onClose} aria-label="Close overlay" />
    </motion.div>
  );
}

const AURA_MORNING_REPORT_DISMISSED_KEY = 'aura_morning_report_dismissed';
const ONBOARDING_MODAL_DISMISSED_KEY = 'dominat8_onboarding_dismissed';

// Domain Setup onboarding modal (Viral Growth): Zero-Touch 3-step, futuristic scanning, Nexus glass
const LAUNCH_STEPS = ['DNS Mapping', 'SSL Security', 'Engine Launch'];
const PROGRESS_LABELS = ['DNS Verification', 'SSL Security', 'Engine Launch'];
function OnboardingModal({ isOpen, onClose, onLaunch }) {
  const [step, setStep] = useState(0);
  return (
    <AnimatePresence>
      {isOpen && (
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="onboarding-panel domain-setup-portal relative max-w-md w-full rounded-2xl p-8 deployment-card-glass border border-white/20 shadow-2xl nexus-modal-bloom overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Futuristic scanning sweep line */}
          {(step === 0 || step === 1) && (
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
              aria-hidden
            >
              <motion.div
                className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
          <h2 className="text-xl font-semibold text-white/95 mb-1">Domain Setup</h2>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Zero-Touch automation</p>
          <p className="text-white/60 text-sm mb-6">DNS → SSL → Engine Launch. Real-time progress as the AI handles the tech.</p>
          {(step === 0 || step === 1) && (
            <motion.div
              className="flex items-center gap-2 text-cyan-300/90 text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                Scanning...
              </motion.span>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </span>
            </motion.div>
          )}
          <div className="flex gap-2 mb-4">
            {LAUNCH_STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  'flex-1 text-center text-xs font-semibold py-2 rounded-lg',
                  i === step ? 'bg-blue-500/25 text-blue-200 border border-blue-400/40' : i < step ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/5 text-white/40 border border-white/10'
                )}
              >
                {i + 1}. {label}
              </span>
            ))}
          </div>
          <div className="mb-1 text-xs text-white/50">{PROGRESS_LABELS[step]}</div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-6">
            <motion.div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" initial={{ width: 0 }} animate={{ width: `${((step + 1) / LAUNCH_STEPS.length) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={() => {
                try { sessionStorage.setItem(ONBOARDING_MODAL_DISMISSED_KEY, 'true'); } catch (_) {}
                onClose();
              }}
              className="flex-1 py-3 rounded-xl font-medium bg-white/10 border border-white/20 text-white/90 hover:bg-white/15"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Skip
            </motion.button>
            {step < LAUNCH_STEPS.length - 1 ? (
              <motion.button
                type="button"
                onClick={() => setStep((s) => Math.min(s + 1, LAUNCH_STEPS.length - 1))}
                className="flex-1 py-3 rounded-xl font-semibold bg-blue-500/30 border border-blue-400/50 text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={() => {
                  try { sessionStorage.setItem(ONBOARDING_MODAL_DISMISSED_KEY, 'true'); } catch (_) {}
                  onLaunch?.();
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl font-semibold bg-emerald-500/30 border border-emerald-400/50 text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                Engine Launch
              </motion.button>
            )}
          </div>
          <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10" aria-label="Close"><X className="w-5 h-5" /></button>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  // useAura: Theme, Active Deployment, Healing + Universal State Lock (Production Engine)
  const {
    vibe,
    setVibe,
    fullScreenId,
    setFullScreenId,
    healingId,
    setHealingId,
    selfHealingOn,
    setSelfHealingOn,
    agentTypingText,
    setAgentTypingText,
    agentLock,
    setAgentLock,
    acquireLock,
  } = useAura();

  const [showSourceCode, setShowSourceCode] = useState(false);
  const [showTickets, setShowTickets] = useState(false);
  const [showAgencySidebar, setShowAgencySidebar] = useState(false);
  const [showToolbarMore, setShowToolbarMore] = useState(false);
  const [cinematicFocus, setCinematicFocus] = useState(false);
  const [enteredLab, setEnteredLab] = useState(() => {
    try {
      return sessionStorage.getItem(DOMINAT8_ENTERED_LAB_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const isShowroomDomain = getIsShowroomDomain();
  const showroomQuery = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('showroom') === '1';
  const showShowroom = (isShowroomDomain || showroomQuery) && !enteredLab;
  const [showMorningReportModal, setShowMorningReportModal] = useState(() => {
    try {
      if (localStorage.getItem(AURA_MORNING_REPORT_DISMISSED_KEY) === 'true') return false;
      const raw = localStorage.getItem(AURA_NIGHT_SHIFT_KEY);
      const log = raw ? JSON.parse(raw) : [];
      return log.length > 0;
    } catch {
      return false;
    }
  });
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [activeView, setActiveView] = useState('deploy');
  const [closingOverlay, setClosingOverlay] = useState(false);
  const [deployments, setDeployments] = useState(() => [...projectData]);
  const [focusModeProgress, setFocusModeProgress] = useState({ dns: 0, ssl: 0 });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogText, setDeployLogText] = useState(null);
  const [deploySimulate, setDeploySimulate] = useState(false);
  const [deployTarget, setDeployTarget] = useState('horizonaid-tech');
  const [customVibeFromImage, setCustomVibeFromImage] = useState(null);
  const [supportTicket, setSupportTicket] = useState(null);
  const [suggestedPatch, setSuggestedPatch] = useState(null);
  const ticketFixStyleRef = useRef(null);
  const [onboardingStep, setOnboardingStep] = useState(null);
  const agentTypingIndex = useRef(0);
  const deployLogIndex = useRef(0);
  const autoHealTriggered = useRef(false);
  const focusProgressIntervalRef = useRef(null);
  const onboardingIntervalRef = useRef(null);
  const CRITICAL_ERROR_DEPLOY_ID = '1';

  // Midnight Architect: SEO Pulse + Live Log (aura_night_shift)
  const [seoHealth, setSeoHealth] = useState({
    keywords: [],
    lastScan: null,
    score: 85,
  });
  const [nightShiftLog, setNightShiftLog] = useState(() => {
    try {
      const raw = localStorage.getItem(AURA_NIGHT_SHIFT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const midnightCycleRef = useRef(0);

  // Aura Agency Brain: multi-agent team state and rotation
  const [agencyTeam, setAgencyTeam] = useState({
    creativeDirector: 'idle',
    leadDev: 'idle',
    qa: 'idle',
    marketing: 'idle',
  });
  const [activeAgentLead, setActiveAgentLead] = useState(0);
  const [agencyTweak, setAgencyTweak] = useState({ glow: 1, glass: 1 });
  const agencyLeadRef = useRef(0);
  const [logoHeartbeat, setLogoHeartbeat] = useState(0);
  const [auraMouse, setAuraMouse] = useState({ x: 0.5, y: 0.5 });
  // Empire Expansion: Revenue, Blueprint Store, Pro gate
  const [referralCode] = useState('dashboard');
  const [showBlueprintStore, setShowBlueprintStore] = useState(false);
  const [installedBlueprintId, setInstalledBlueprintId] = useState(null);
  const [isPro] = useState(false);
  const [showUpgradeProModal, setShowUpgradeProModal] = useState(false);
  // Intelligence Suite: Concierge, User View, Stealth Blog
  const [showConcierge, setShowConcierge] = useState(false);
  const [conciergeOverrides, setConciergeOverrides] = useState({});
  const [userViewMode, setUserViewMode] = useState(false);
  const [clientPortalProjectId, setClientPortalProjectId] = useState('1');
  const [autonomousBlogPosts, setAutonomousBlogPosts] = useState(() => {
    try {
      const raw = localStorage.getItem('dominat8_autonomous_blog');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [draftLeads, setDraftLeads] = useState([]);
  const [lastLoginAt, setLastLoginAt] = useState(() => {
    try {
      const t = parseInt(localStorage.getItem('dominat8_last_login') || '0', 10);
      return t || Date.now();
    } catch { return Date.now(); }
  });
  const [retentionHooks, setRetentionHooks] = useState([]);
  const [featureFlagsByDeployment, setFeatureFlagsByDeployment] = useState(() => {
    try {
      const raw = localStorage.getItem('dominat8_feature_flags');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  // Rendering Stress Test: ?stress=N renders N 3D cards + FPS meter (max 100)
  const [stressCount] = useState(() => getStressCount());
  const stressDeployments = useMemo(() => {
    if (stressCount <= 0) return [];
    const out = [];
    for (let i = 0; i < stressCount; i++) {
      const base = projectData[i % projectData.length];
      out.push({
        ...base,
        id: `stress-${i}`,
        url: `${(base.url || '').replace(/^www\./, '')} #${i + 1}`,
      });
    }
    return out;
  }, [stressCount]);
  const effectiveDeployments = stressCount > 0 ? stressDeployments : deployments;

  const appendNightLog = (message) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry = { time, message };
    setNightShiftLog((prev) => {
      const next = [...prev, entry].slice(-200);
      try {
        localStorage.setItem(AURA_NIGHT_SHIFT_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Theme config: vibe + optional custom from image (Multimodal Vibe Analyzer)
  const baseThemeConfig = useMemo(
    () =>
      vibe === 'obsidian'
        ? {
            vibe: 'obsidian',
            cardGlow: true,
            shadowStyle: 'neon',
            cardBorder: 'rgba(255,255,255,0.1)',
            orbOpacity: 0.35,
            orbPrimary: null,
            orbSecondary: null,
            orbTertiary: null,
          }
        : {
            vibe: 'cloud',
            cardGlow: false,
            shadowStyle: 'soft',
            cardBorder: 'rgba(0,0,0,0.06)',
            orbOpacity: 0.08,
            orbPrimary: null,
            orbSecondary: null,
            orbTertiary: null,
          },
    [vibe]
  );
  const themeConfig = useMemo(
    () =>
      customVibeFromImage
        ? {
            ...baseThemeConfig,
            vibe: 'custom',
            cardBorder: customVibeFromImage.cardBorder || baseThemeConfig.cardBorder,
            orbPrimary: customVibeFromImage.orbPrimary,
            orbSecondary: customVibeFromImage.orbSecondary,
            orbTertiary: customVibeFromImage.orbTertiary,
          }
        : baseThemeConfig,
    [baseThemeConfig, customVibeFromImage]
  );

  const onVibeFromImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    getDominantColorsFromImage(file, (colors) => {
      if (!colors || !colors.orbPrimary) return;
      setCustomVibeFromImage(colors);
      appendNightLog('Vibe updated from mood board image.');
    });
  };

  const onVoiceVibe = (transcript) => {
    const t = (transcript || '').toLowerCase();
    if (/\b(warmer|warm)\b/.test(t) && VOICE_VIBE_PRESETS.warmer) {
      setCustomVibeFromImage(VOICE_VIBE_PRESETS.warmer);
      appendNightLog('Voice: Applied "warmer" vibe preset.');
      return;
    }
    if (/\b(cooler|cool)\b/.test(t) && VOICE_VIBE_PRESETS.cooler) {
      setCustomVibeFromImage(VOICE_VIBE_PRESETS.cooler);
      appendNightLog('Voice: Applied "cooler" vibe preset.');
      return;
    }
    if (/\b(calmer|calm|green)\b/.test(t) && VOICE_VIBE_PRESETS.calmer) {
      setCustomVibeFromImage(VOICE_VIBE_PRESETS.calmer);
      appendNightLog('Voice: Applied "calmer" vibe preset.');
      return;
    }
    if (/\b(obsidian|dark)\b/.test(t)) {
      setVibe('obsidian');
      setCustomVibeFromImage(null);
      appendNightLog('Voice: Switched to Obsidian theme.');
      return;
    }
    if (/\b(cloud|light|lighter)\b/.test(t)) {
      setVibe('cloud');
      setCustomVibeFromImage(null);
      appendNightLog('Voice: Switched to Cloud theme.');
      return;
    }
    if (/\b(reset|default)\b/.test(t)) {
      setCustomVibeFromImage(null);
      appendNightLog('Voice: Reset to default vibe.');
    }
  };

  const simulateTicket = () => {
    const tickets = [
      'The button on my home page is broken',
      'The page is too dark, I can\'t see the cards',
      'Can you fix the card borders and add a glow?',
    ];
    const text = tickets[Math.floor(Math.random() * tickets.length)];
    setSupportTicket(text);
    const patch = suggestPatchForTicket(text);
    setSuggestedPatch(patch);
    appendNightLog(`Support ticket: "${text.slice(0, 40)}..."`);
  };

  const applyTicketFix = () => {
    if (!suggestedPatch?.code) return;
    if (!ticketFixStyleRef.current) {
      const el = document.createElement('style');
      el.id = 'aura-ticket-fix';
      document.head.appendChild(el);
      ticketFixStyleRef.current = el;
    }
    ticketFixStyleRef.current.textContent = suggestedPatch.code;
    appendNightLog('Ticket fix applied (CSS injected).');
  };

  const fullScreenDeployment = fullScreenId ? deployments.find((d) => d.id === fullScreenId) : null;

  const openFullScreen = (id) => {
    if (focusProgressIntervalRef.current) {
      clearInterval(focusProgressIntervalRef.current);
      focusProgressIntervalRef.current = null;
    }
    setFullScreenId(id);
    const deployment = deployments.find((d) => d.id === id);
    if (deployment?.status === 'New') {
      startOnboarding(id);
      return;
    }
    setFocusModeProgress({ dns: 0, ssl: 0 });
    const duration = 2400;
    const steps = 32;
    const stepMs = duration / steps;
    let step = 0;
    focusProgressIntervalRef.current = setInterval(() => {
      step += 1;
      const t = step / steps;
      setFocusModeProgress({
        dns: Math.min(100, Math.round(t * 100)),
        ssl: Math.min(100, Math.round(t * 100)),
      });
      if (step >= steps) {
        clearInterval(focusProgressIntervalRef.current);
        focusProgressIntervalRef.current = null;
      }
    }, stepMs);
  };

  const closeFullScreen = () => {
    if (focusProgressIntervalRef.current) {
      clearInterval(focusProgressIntervalRef.current);
      focusProgressIntervalRef.current = null;
    }
    if (onboardingIntervalRef.current) {
      clearInterval(onboardingIntervalRef.current);
      onboardingIntervalRef.current = null;
    }
    setClosingOverlay(true);
    setTimeout(() => {
      setFullScreenId(null);
      setClosingOverlay(false);
      setFocusModeProgress({ dns: 0, ssl: 0 });
    }, 220);
  };

  const onFocusMode = () => openFullScreen(deployments[0]?.id || '1');

  // Real-World Vercel Sync + Production Monitor (Self-Healing Bridge)
  const [vercelSyncLoading, setVercelSyncLoading] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState('unknown'); // 'ok' | 'error' | 'unknown'
  const [vercelBuildLogs, setVercelBuildLogs] = useState(null); // raw build log text when error
  const checkVercelStatus = useCallback(async () => {
    setVercelSyncLoading(true);
    try {
      const res = await fetch('/api/vercel-status', { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.deployments)) {
        let hasError = false;
        let errorVercelId = null;
        setDeployments((prev) =>
          prev.map((d) => {
            const remote = data.deployments.find((r) => r.id === d.id || r.url === d.url || (r.url && d.url && (r.url === d.url || r.url.includes(d.url))));
            if (!remote) return d;
            const status = remote.state === 'READY' ? 'ok' : remote.state === 'ERROR' ? 'Error' : d.status;
            if (status === 'Error') {
              hasError = true;
              errorVercelId = remote.id;
            }
            return {
              ...d,
              status,
              vercelId: remote.id,
            };
          })
        );
        setDeploymentStatus(hasError ? 'error' : data.deployments.length ? 'ok' : 'unknown');
        appendNightLog('Vercel Sync: Fetched live build status from API.');
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setDeployments((prev) => prev.map((d, i) => ({ ...d, status: i === 0 ? 'ok' : d.status })));
        setDeploymentStatus('unknown');
        appendNightLog('Vercel Sync: Simulated status check (API not configured).');
      }
    } catch (_) {
      await new Promise((r) => setTimeout(r, 800));
      setDeploymentStatus('unknown');
      appendNightLog('Vercel Sync: Network error — using local state.');
    } finally {
      setVercelSyncLoading(false);
    }
  }, [appendNightLog]);

  // Production Monitor: ping Vercel every 5 min on engine; Red-to-Green triggers Lead Dev (Self-Healing Bridge)
  useEffect(() => {
    if (showShowroom) return;
    checkVercelStatus();
    const id = setInterval(checkVercelStatus, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [showShowroom, checkVercelStatus]);

  // Red-to-Green: when deploymentStatus === 'error', Lead Dev Agent wakes up (Self-Healing Bridge)
  useEffect(() => {
    if (deploymentStatus !== 'error') return;
    setActiveAgentLead(1);
    setAgencyTeam((prev) => ({ ...prev, leadDev: 'working' }));
  }, [deploymentStatus]);

  // Fetch real Vercel build logs when error (for Self-Heal suggestion in terminal)
  useEffect(() => {
    if (deploymentStatus !== 'error') {
      setVercelBuildLogs(null);
      return;
    }
    const errorDeploy = deployments.find((d) => d.status === 'Error' && d.vercelId);
    if (!errorDeploy?.vercelId) return;
    let cancelled = false;
    fetch(`/api/vercel-logs?deploymentId=${encodeURIComponent(errorDeploy.vercelId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.logs != null) {
          setVercelBuildLogs(data.logs);
          appendNightLog('Lead Dev: Analyzing Vercel build logs for repair.');
        }
      })
      .catch(() => {
        if (!cancelled) setVercelBuildLogs('Could not load build logs.');
      });
    return () => { cancelled = true; };
  }, [deploymentStatus, deployments, appendNightLog]);

  // Self-Healing Vercel Bridge: when real build logs arrive, show in terminal and put UI in repair mode (once per log load)
  const vercelBridgeTriggeredRef = useRef(false);
  useEffect(() => {
    if (deploymentStatus !== 'error' || !vercelBuildLogs) {
      if (deploymentStatus !== 'error') vercelBridgeTriggeredRef.current = false;
      return;
    }
    const errorDeploy = deployments.find((d) => d.status === 'Error');
    if (!errorDeploy || vercelBridgeTriggeredRef.current) return;
    vercelBridgeTriggeredRef.current = true;
    setSelfHealingOn(true);
    setHealingId(errorDeploy.id);
    setAgentTypingText(vercelBuildLogs);
  }, [deploymentStatus, vercelBuildLogs, deployments, setSelfHealingOn, setHealingId, setAgentTypingText]);

  // Simulate error: set deployment to Error + mock logs so you can record Self-Healing TikTok without a real failure
  const simulateError = useCallback(() => {
    vercelBridgeTriggeredRef.current = false;
    setDeploymentStatus('error');
    setDeployments((prev) => prev.map((d, i) => (i === 0 ? { ...d, status: 'Error' } : d)));
    setVercelBuildLogs(MOCK_BUILD_LOGS);
    setActiveAgentLead(1);
    setAgencyTeam((prev) => ({ ...prev, leadDev: 'working' }));
    appendNightLog('Lead Dev: Analyzing Vercel build logs for repair.');
  }, [appendNightLog, setActiveAgentLead, setAgencyTeam]);

  const clearSimulation = useCallback(() => {
    vercelBridgeTriggeredRef.current = false;
    setDeploymentStatus('ok');
    setVercelBuildLogs(null);
    setDeployments((prev) => prev.map((d) => ({ ...d, status: d.status === 'Error' ? 'ok' : d.status })));
    setSelfHealingOn(false);
    setHealingId(null);
    appendNightLog('Simulation cleared — back to healthy.');
  }, [appendNightLog, setSelfHealingOn, setHealingId]);

  // Trigger onboarding modal when there is a New deployment (Content & Commerce Engine)
  useEffect(() => {
    if (showShowroom) return;
    try {
      if (sessionStorage.getItem(ONBOARDING_MODAL_DISMISSED_KEY) === 'true') return;
    } catch (_) {}
    if (deployments.some((d) => d.status === 'New')) setShowOnboardingModal(true);
  }, [showShowroom, deployments]);

  // Sitemap Generator: build sitemap.xml from blueprint + deployments (Production Engine)
  const downloadSitemap = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://your-site.com';
    const urls = [
      { loc: baseUrl + '/', changefreq: 'daily', priority: '1.0' },
      ...siteBlueprint.filter((b) => b.id).map((b) => ({ loc: `${baseUrl}/${b.id}`, changefreq: 'weekly', priority: '0.8' })),
      ...deployments.map((d) => ({ loc: `https://${d.url}`, changefreq: 'daily', priority: '0.9' })),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(a.href);
    appendNightLog('SEO: Sitemap generated and downloaded (sitemap.xml).');
  }, [deployments, appendNightLog]);

  // Vibe-to-Build: generate vercel.json config for current vibe (Production Engine)
  const vercelJsonForVibe = useMemo(() => {
    return JSON.stringify(
      {
        buildCommand: 'cd ai-command-center && npm run build',
        outputDirectory: 'build',
        framework: 'create-react-app',
        env: { REACT_APP_VIBE: vibe },
      },
      null,
      2
    );
  }, [vibe]);

  const downloadVercelJson = useCallback(() => {
    const blob = new Blob([vercelJsonForVibe], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vercel.json';
    a.click();
    URL.revokeObjectURL(a.href);
    appendNightLog(`Vibe-to-Build: Downloaded vercel.json for vibe "${vibe}".`);
  }, [vercelJsonForVibe, vibe, appendNightLog]);

  // Intelligence Suite: Predictive QA — system health before Vercel push; if complexity high, QA suggests refactor
  const getBlueprintComplexity = useCallback(() => {
    try {
      return JSON.stringify(siteBlueprint).length;
    } catch {
      return 0;
    }
  }, []);
  const COMPLEXITY_THRESHOLD = 400;

  // Aura-to-Vercel: try real deploy first, fallback to simulated build log
  const onDeployClick = async () => {
    if (isDeploying) return;
    const complexity = getBlueprintComplexity();
    if (complexity > COMPLEXITY_THRESHOLD) {
      setActiveAgentLead(2);
      setAgencyTeam((prev) => ({ ...prev, qa: 'working' }));
      appendNightLog('QA: System Health — code complexity high before push. Suggesting clean-up refactor.');
    }
    setIsDeploying(true);
    setDeploySimulate(false);
    setDeployLogText('Connecting to Vercel...');
    const projectName = deployTarget || 'horizonaid-tech';
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setDeployLogText(
          `Deployment triggered for ${projectName}\n` +
            `URL: https://${data.url}\n` +
            `Status: ${data.status || 'QUEUED'}\n\n` +
            'Done. Check your Vercel dashboard for build progress.'
        );
        appendNightLog(`Aura-to-Vercel: Deployed '${projectName}' → https://${data.url}`);
        setTimeout(() => {
          setIsDeploying(false);
          setDeployLogText(null);
        }, 8000);
        return;
      }
    } catch (_) {}
    setDeployLogText('');
    setDeploySimulate(true);
    deployLogIndex.current = 0;
    appendNightLog(`Deploy: Vercel API unavailable, ran simulated build for '${projectName}'.`);
  };

  useEffect(() => {
    if (!isDeploying || !deploySimulate) return;
    const full = DEPLOY_SCRIPT;
    const id = setInterval(() => {
      if (deployLogIndex.current >= full.length) {
        clearInterval(id);
        setTimeout(() => {
          setIsDeploying(false);
          setDeploySimulate(false);
          setDeployLogText(null);
        }, 800);
        return;
      }
      deployLogIndex.current += 1;
      setDeployLogText(full.slice(0, deployLogIndex.current));
    }, 55);
    return () => clearInterval(id);
  }, [isDeploying, deploySimulate]);

  // Auto-onboarding: Focus Mode + 3 steps (Domain Check → DNS Config → Final Launch)
  const startOnboarding = (cardId) => {
    if (onboardingIntervalRef.current) {
      clearInterval(onboardingIntervalRef.current);
      onboardingIntervalRef.current = null;
    }
    if (focusProgressIntervalRef.current) {
      clearInterval(focusProgressIntervalRef.current);
      focusProgressIntervalRef.current = null;
    }
    const id = cardId || deployments[0]?.id || '1';
    setOnboardingStep(0);
    setFullScreenId(id);
    setFocusModeProgress({ dns: 0, ssl: 0 });
    const steps = [
      { label: 'Domain Check', dns: 33, ssl: 0 },
      { label: 'DNS Config', dns: 66, ssl: 50 },
      { label: 'Final Launch', dns: 100, ssl: 100 },
    ];
    let step = 0;
    onboardingIntervalRef.current = setInterval(() => {
      step += 1;
      if (step > 3) {
        setOnboardingStep(null);
        clearInterval(onboardingIntervalRef.current);
        onboardingIntervalRef.current = null;
        return;
      }
      setOnboardingStep(step <= 3 ? step - 1 : null);
      const s = steps[Math.min(step - 1, 2)];
      setFocusModeProgress({ dns: s.dns, ssl: s.ssl });
    }, 900);
  };

  const onFixDeployment = (id) => {
    const deployment = deployments.find((d) => d.id === id);
    const url = deployment?.url || id;
    setHealingId(id);
    setTimeout(() => {
      setDeployments((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'ok' } : d)));
      setHealingId(null);
      appendNightLog(`SSL Certificate fix applied to '${url}'.`);
    }, 600);
  };

  // Viral Growth: Commander View — apply Self-Healing patch to all deployments at once
  const runGlobalUpdate = useCallback(() => {
    effectiveDeployments.forEach((d, i) => {
      setTimeout(() => onFixDeployment(d.id), i * 350);
    });
    appendNightLog('Commander: Global Update — Self-Healing patch applied to all deployments.');
  }, [effectiveDeployments, appendNightLog]);

  const deploymentsRef = useRef(deployments);
  deploymentsRef.current = deployments;

  // selfHeal(deploymentId, urlForLog?, onComplete?): runs agent terminal fix for a deployment (fused to project state)
  const selfHeal = useCallback((deploymentId, urlForLog, onComplete) => {
    const url =
      urlForLog ||
      deploymentsRef.current.find((d) => d.id === deploymentId)?.url ||
      deploymentId;
    setHealingId(deploymentId);
    setAgentTypingText('');
    agentTypingIndex.current = 0;
    const full = AGENT_FIX_SCRIPT;
    const id = setInterval(() => {
      if (agentTypingIndex.current >= full.length) {
        clearInterval(id);
        setTimeout(() => {
          setDeployments((prev) =>
            prev.map((d) => (d.id === deploymentId ? { ...d, status: 'ok' } : d))
          );
          setHealingId(null);
          setAgentTypingText(null);
          appendNightLog(`SSL Certificate simulation fix applied to '${url}'.`);
          onComplete?.();
        }, 400);
        return;
      }
      agentTypingIndex.current += 1;
      setAgentTypingText(full.slice(0, agentTypingIndex.current));
    }, 45);
  }, []);

  // Agentic Self-Healer: when Self-Healing toggle is ON, set deploy 1 to Error and run selfHeal (terminal fix)
  useEffect(() => {
    if (!selfHealingOn) {
      setAgentTypingText(null);
      setDeployments((prev) =>
        prev.map((d) => (d.id === CRITICAL_ERROR_DEPLOY_ID ? { ...d, status: 'ok' } : d))
      );
      agentTypingIndex.current = 0;
      return;
    }
    setDeployments((prev) =>
      prev.map((d) => (d.id === CRITICAL_ERROR_DEPLOY_ID ? { ...d, status: 'Error' } : d))
    );
    const deploy1 = projectData.find((d) => d.id === CRITICAL_ERROR_DEPLOY_ID) || projectData[0];
    selfHeal(CRITICAL_ERROR_DEPLOY_ID, deploy1?.url);
  }, [selfHealingOn, selfHeal]);

  // Auto-trigger (Autopilot): if a project has Error status, automatically trigger terminal fix after 3s
  const autoHealIntervalRef = useRef(null);
  useEffect(() => {
    const errorCard = deployments.find((d) => d.status === 'Error');
    if (!errorCard || selfHealingOn || agentTypingText !== null || healingId) return;
    if (autoHealTriggered.current) return;
    const t = setTimeout(() => {
      autoHealTriggered.current = true;
      selfHeal(errorCard.id, errorCard.url, () => {
        autoHealTriggered.current = false;
      });
    }, 3000);
    return () => {
      clearTimeout(t);
      if (autoHealIntervalRef.current) clearInterval(autoHealIntervalRef.current);
    };
  }, [deployments, selfHealingOn, agentTypingText, healingId, selfHeal]);

  useEffect(() => {
    if (!fullScreenId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeFullScreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullScreenId]);

  // Midnight Architect: Persistent Autopilot – 60s loop, SEO Pulse, Self-Heal every 20 cycles, Live Log
  // Agency Brain: every 60s a different agent takes the lead and runs their task
  const runMidnightTick = () => {
    const cycle = midnightCycleRef.current;
    const domain = MIDNIGHT_DOMAINS[cycle % MIDNIGHT_DOMAINS.length];
    const url = domain.url;

    // SEO Autopilot: Trend Scan every 60s — update meta/headers data (high-performing keywords)
    const count = 1 + Math.floor(Math.random() * 3);
    const keywords = [];
    const pool = [...TRENDING_KEYWORDS_POOL];
    for (let i = 0; i < count && pool.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      keywords.push(pool.splice(idx, 1)[0]);
    }
    setSeoHealth((prev) => ({
      keywords: [...prev.keywords, ...keywords].slice(-50),
      lastScan: new Date().toISOString(),
      score: Math.min(99, Math.max(70, prev.score + (Math.random() > 0.5 ? 1 : -1))),
    }));
    appendNightLog(`Trend Scan: '${url}' — ${count} high-performing keyword(s) added to site-data.`);

    // Vibe-Sync: log blueprint update for current theme (Vibe Engine stays active)
    const themeLabel = vibe === 'obsidian' ? 'Obsidian' : 'Cloud';
    appendNightLog(`Vibe-Sync: Updated JSON blueprint for '${themeLabel}' theme optimization.`);

    // Every 20 cycles: simulate Server Latency or SSL Warning, then Autopilot triggers terminal to fix
    if (cycle > 0 && cycle % 20 === 0) {
      const simType = Math.random() > 0.5 ? 'SSL Warning' : 'Server Latency';
      const target = MIDNIGHT_DOMAINS[Math.floor(Math.random() * MIDNIGHT_DOMAINS.length)];
      appendNightLog(`${simType} simulation applied to '${target.url}'.`);
      setDeployments((prev) =>
        prev.map((d) => (d.id === target.id ? { ...d, status: 'Error' } : d))
      );
      appendNightLog(`Self-Heal triggered for '${target.url}'.`);
      selfHeal(target.id, target.url);
    }

    // Agency Brain: rotate lead agent (0=Creative, 1=Lead Dev, 2=QA, 3=Marketing)
    const lead = agencyLeadRef.current % 4;
    agencyLeadRef.current += 1;
    setActiveAgentLead(lead);
    setAgencyTeam({
      creativeDirector: lead === 0 ? 'working' : 'idle',
      leadDev: lead === 1 ? 'working' : 'idle',
      qa: lead === 2 ? 'working' : 'idle',
      marketing: lead === 3 ? 'working' : 'idle',
    });
    if (lead === 0) {
      const glow = 0.5 + Math.random() * 0.5;
      const glass = 0.4 + Math.random() * 0.6;
      setAgencyTweak({ glow, glass });
      appendNightLog('Creative Director: Updated glow and glass intensity for 2026-ready look.');
    } else if (lead === 1) {
      appendNightLog('Lead Dev: Code refactor — removed unused exports from blueprint.');
    } else if (lead === 2) {
      const frictions = [
        'CTA button contrast ratio below 4.5:1 on step 2',
        'Form label focus ring not visible in dark mode',
        'Onboarding step 3 copy exceeds recommended line length',
      ];
      const friction = frictions[Math.floor(Math.random() * frictions.length)];
      appendNightLog(`QA: Deep Onboarding Scan — Simulated UX Friction: ${friction}.`);
      // QA: Multi-Deployment Stress Test — update Speed stat for a random site
      const target = MIDNIGHT_DOMAINS[Math.floor(Math.random() * MIDNIGHT_DOMAINS.length)];
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === target.id
            ? { ...d, speed: Math.min(100, Math.max(70, (d.speed ?? 90) + (Math.random() > 0.5 ? 1 : -1))) }
            : d
        )
      );
      appendNightLog(`QA: Performance check — updated Speed for ${target.url}.`);
    } else {
      const pages = ['Case Studies', 'Pricing', 'Testimonials', 'Blog'];
      const page = pages[Math.floor(Math.random() * pages.length)];
      appendNightLog(`Marketing: Suggested new page: ${page} — simulated traffic spike on /${page.toLowerCase().replace(/\s/g, '-')}.`);
    }

    midnightCycleRef.current += 1;
    setLogoHeartbeat((n) => n + 1);
  };

  useEffect(() => {
    const t = setTimeout(runMidnightTick, 2000);
    const intervalId = setInterval(runMidnightTick, 60000);
    return () => {
      clearTimeout(t);
      clearInterval(intervalId);
    };
  }, [vibe]);

  // Aura AI command: "Creative Director, go Darker" -> setVibe('obsidian'); etc. (Production Engine)
  const onAuraCommand = useCallback(
    (raw) => {
      const t = (raw || '').toLowerCase().trim();
      if (!t) return;
      appendNightLog(`Aura AI: "${raw.slice(0, 50)}${raw.length > 50 ? '…' : ''}"`);
      if (/\b(creative\s*director|creative)\b.*\b(darker|dark|obsidian)\b/.test(t) || /\bgo\s*darker\b/.test(t)) {
        setVibe('obsidian');
        setCustomVibeFromImage(null);
        appendNightLog('Creative Director: Switched to Obsidian (darker).');
        return;
      }
      if (/\b(creative\s*director|creative)\b.*\b(lighter|light|cloud)\b/.test(t) || /\bgo\s*lighter\b/.test(t)) {
        setVibe('cloud');
        setCustomVibeFromImage(null);
        appendNightLog('Creative Director: Switched to Cloud (lighter).');
        return;
      }
      if (/\b(neon|glow|brighter|more\s*glow)\b/.test(t)) {
        setAgencyTweak((prev) => ({ ...prev, glow: Math.min(1.5, (prev.glow || 1) + 0.2), glass: Math.min(1.2, (prev.glass || 1) + 0.1) }));
        appendNightLog('Creative Director: Increased glow and glass intensity.');
        return;
      }
      if (/\b(obsidian|dark)\b/.test(t)) {
        setVibe('obsidian');
        setCustomVibeFromImage(null);
        return;
      }
      if (/\b(cloud|light)\b/.test(t)) {
        setVibe('cloud');
        setCustomVibeFromImage(null);
        return;
      }
      appendNightLog(`Aura AI: Command acknowledged (no specific action for "${t.slice(0, 30)}…").`);
    },
    [appendNightLog]
  );

  const dismissMorningReport = useCallback(() => {
    setShowMorningReportModal(false);
    try {
      localStorage.setItem(AURA_MORNING_REPORT_DISMISSED_KEY, 'true');
    } catch (_) {}
  }, []);

  // Viral Growth: Lead Magnet — scan adds draft lead; Create invite flags Creative Director
  const onLeadScan = useCallback(() => {
    const s = SOCIAL_TREND_SOURCES[Math.floor(Math.random() * SOCIAL_TREND_SOURCES.length)];
    setDraftLeads((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        source: s.keyword,
        handle: s.handle,
        suggestedSite: `${s.handle.replace('@', '')}.dominat8.site`,
        invited: false,
      },
    ]);
    appendNightLog(`Lead Magnet: Draft build created for ${s.handle} (${s.keyword}).`);
  }, [appendNightLog]);

  const onCreateLeadInvite = useCallback(
    (lead) => {
      setDraftLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, invited: true } : l)));
      setActiveAgentLead(0);
      setAgencyTeam((prev) => ({ ...prev, creativeDirector: 'working' }));
      appendNightLog(`Creative Director: Personalized invite created for ${lead.handle} — ${lead.suggestedSite}`);
    },
    [appendNightLog, setActiveAgentLead, setAgencyTeam]
  );

  // Elite Operations: Feature Control — toggle per deployment, persist to localStorage
  const onToggleFeature = useCallback((deploymentId, feature, value) => {
    setFeatureFlagsByDeployment((prev) => {
      const next = { ...prev, [deploymentId]: { ...(prev[deploymentId] ?? { socialAgent: true, seoAutopilot: true }), [feature]: value } };
      try { localStorage.setItem('dominat8_feature_flags', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  }, []);

  const onGenerateSuccessStory = useCallback(
    (story) => {
      setAutonomousBlogPosts((prev) => [...prev, { id: String(Date.now()), ...story, date: new Date().toISOString().slice(0, 10), type: 'case-study' }]);
      try {
        const raw = localStorage.getItem('dominat8_autonomous_blog');
        const list = raw ? JSON.parse(raw) : [];
        list.push({ id: String(Date.now()), ...story, date: new Date().toISOString().slice(0, 10), type: 'case-study' });
        localStorage.setItem('dominat8_autonomous_blog', JSON.stringify(list));
      } catch (_) {}
      appendNightLog('Ghost Copywriter: Success Story generated and added to Showroom.');
    },
    [appendNightLog, setAutonomousBlogPosts]
  );

  // Intelligence Suite: Concierge — Lead Dev applies user request to JSON (e.g. hero placeholder)
  const handleConciergeRequest = useCallback(
    (text) => {
      if (!text || !text.trim()) return;
      const t = text.trim();
      const heroPlaceholder = t.includes(' to ') ? t.split(' to ').slice(1).join(' to ').trim() : t;
      setConciergeOverrides((prev) => ({ ...prev, heroPlaceholder }));
      setActiveAgentLead(1);
      setAgencyTeam((prev) => ({ ...prev, leadDev: 'working' }));
      appendNightLog(`Lead Dev: Concierge — applied to JSON: "${t.slice(0, 60)}${t.length > 60 ? '…' : ''}"`);
    },
    [appendNightLog, setActiveAgentLead, setAgencyTeam]
  );

  const auraContext = {
    activeView,
    setActiveView,
    deployments: effectiveDeployments,
    projectData: effectiveDeployments,
    dockItems: DOCK_ITEMS,
    openFullScreen,
    onFixDeployment,
    healingId,
    selfHealingOn,
    agentTypingText,
    criticalErrorId: CRITICAL_ERROR_DEPLOY_ID,
    onFocusMode,
    fullScreenId,
    themeConfig,
    isDeploying,
    deployLogText,
    onDeployClick,
    startOnboarding,
    deployTarget,
    setDeployTarget,
    onVibeFromImage,
    onVoiceVibe,
    onAuraCommand,
    supportTicket,
    suggestedPatch,
    simulateTicket,
    applyTicketFix,
    showTickets,
    setShowTickets,
    bentoStats: {
      uptime: '99.98%',
      traffic: '12.4K',
      optimizing: 'Active',
      speed: effectiveDeployments.reduce((acc, d) => acc + (d.speed ?? 0), 0) / (effectiveDeployments.length || 1),
    },
    agencyTeam,
    activeAgentLead,
    agencyTweak,
    nightShiftLog,
    agentLock,
    setShowAgencySidebar,
    cinematicFocus,
    setCinematicFocus,
    heroDeepGlass: cinematicFocus || vibe === 'obsidian',
    deploymentStatus,
    vercelBuildLogs,
    referralCode,
    showBlueprintStore,
    setShowBlueprintStore,
    installedBlueprintId,
    setInstalledBlueprintId,
    isPro,
    setShowUpgradeProModal,
    showUpgradeProModal,
    appendNightLog,
    setActiveAgentLead,
    seoHealth,
    conciergeOverrides,
    showConcierge,
    setShowConcierge,
    handleConciergeRequest,
    userViewMode,
    setUserViewMode,
    clientPortalProjectId,
    setClientPortalProjectId,
    autonomousBlogPosts,
    setAutonomousBlogPosts,
    draftLeads,
    onLeadScan,
    onCreateLeadInvite,
    onGlobalUpdate: runGlobalUpdate,
    retentionHooks,
    featureFlagsByDeployment,
    onToggleFeature,
    onGenerateSuccessStory,
  };

  // Navigation: when activeView is not "deploy", show Hero + view panel + dock instead of full dashboard
  const dockBlock = siteBlueprint.find((b) => b.type === 'InteractiveDock') || siteBlueprint[siteBlueprint.length - 1];
  const heroBlock = siteBlueprint.find((b) => b.type === 'Hero') || siteBlueprint[0];
  const isDeployView = activeView === 'deploy';
  const effectiveBlueprint = isDeployView
    ? siteBlueprint
    : [heroBlock, { type: 'ViewPanel', id: 'view', props: { viewId: activeView } }, dockBlock];

  // Developer View: raw JSON blueprint + theme + SEO health (Midnight Architect)
  const jsonForPanel = { theme: themeConfig, blueprint: siteBlueprint, projectData: effectiveDeployments, seoHealth };
  const jsonString = JSON.stringify(jsonForPanel, null, 2);

  const customOrbVars = {
    ...(themeConfig.vibe === 'custom' && themeConfig.orbPrimary
      ? {
          '--orb-tl': themeConfig.orbPrimary,
          '--orb-tr': themeConfig.orbSecondary || themeConfig.orbPrimary,
          '--orb-bl': themeConfig.orbTertiary || themeConfig.orbPrimary,
          '--orb-br': themeConfig.orbPrimary,
          '--card-border': themeConfig.cardBorder || 'rgba(255,255,255,0.1)',
        }
      : {}),
    '--agency-glow': agencyTweak.glow,
    '--agency-glass': agencyTweak.glass,
  };

  // Intelligence Suite: Stealth Blog — Creative Director generates post from Self-Healing wins (every 24h or on first run)
  const autonomousBlogLastGenRef = useRef(0);
  useEffect(() => {
    if (autonomousBlogPosts.length === 0) {
      const first = {
        id: '1',
        title: 'How we achieved 99.9% uptime for horizonaid.tech',
        body: 'Our Self-Healing agent detected a certificate issue and renewed it automatically. Zero manual intervention. The Lead Dev analyzed the logs and applied the fix before you woke up.',
        date: new Date().toISOString().slice(0, 10),
        type: 'self-healing',
      };
      autonomousBlogLastGenRef.current = Date.now();
      setAutonomousBlogPosts([first]);
      try {
        localStorage.setItem('dominat8_autonomous_blog', JSON.stringify([first]));
      } catch (_) {}
    }
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const healing = nightShiftLog.filter((e) => /Self-Heal|Lead Dev|repair|Certificate|SSL|analyzing|Vercel build/i.test(e.message));
      if (healing.length > 0 && Date.now() - autonomousBlogLastGenRef.current > 23 * 60 * 60 * 1000) {
        autonomousBlogLastGenRef.current = Date.now();
        const msg = healing[healing.length - 1].message;
        const title = `How we kept ${effectiveDeployments[0]?.url || 'your site'} live`;
        const body = msg.length > 140 ? msg.slice(0, 140) + '…' : msg;
        setAutonomousBlogPosts((prev) => {
          const next = [...prev, { id: String(Date.now()), title, body, date: new Date().toISOString().slice(0, 10), type: 'self-healing' }];
          try {
            localStorage.setItem('dominat8_autonomous_blog', JSON.stringify(next));
          } catch (_) {}
          return next;
        });
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [nightShiftLog, effectiveDeployments]);

  // Viral Growth: Legacy Backup — Daily Blueprint Snapshot every 24h for instant recovery (revert Self-Healing, etc.)
  const DOMINAT8_DAILY_SNAPSHOT_KEY = 'dominat8_daily_snapshot';
  const snapshotStateRef = useRef({ deployments, themeConfig, nightShiftLog });
  snapshotStateRef.current = { deployments, themeConfig, nightShiftLog };
  useEffect(() => {
    const saveSnapshot = () => {
      try {
        const { deployments: d, themeConfig: t, nightShiftLog: n } = snapshotStateRef.current;
        const snapshot = {
          blueprint: siteBlueprint,
          deployments: d,
          themeConfig: t,
          nightShiftLog: n,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(DOMINAT8_DAILY_SNAPSHOT_KEY, JSON.stringify(snapshot));
        appendNightLog('Legacy Backup: Daily Blueprint Snapshot saved. Revert anytime from storage.');
      } catch (_) {}
    };
    saveSnapshot();
    const interval = setInterval(saveSnapshot, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Elite Operations: User Pulse / Retention — if lastLogin > 3 days, Creative Director drafts Value Update
  useEffect(() => {
    try {
      const raw = localStorage.getItem('dominat8_last_login');
      const t = raw ? parseInt(raw, 10) : 0;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (t > 0 && Date.now() - t > threeDaysMs) {
        setRetentionHooks((prev) => [...prev, { id: Date.now(), message: 'Value Update draft: We just updated your SEO keywords!', createdAt: Date.now() }]);
        setActiveAgentLead(0);
        setAgencyTeam((prev) => ({ ...prev, creativeDirector: 'working' }));
        appendNightLog('Creative Director: Retention Hook — drafted Value Update email for inactive user.');
      }
      localStorage.setItem('dominat8_last_login', String(Date.now()));
    } catch (_) {}
  }, []);

  // Elite Operations: Performance Scaler — Speed Insights; if latency > 200ms, Lead Dev suggests Edge Optimization
  const EDGE_OPTIMIZATION_PATCH = `[Speed Insights] Latency: 220ms — above threshold.
Lead Dev: Edge Optimization patch suggested.
- Enable Vercel Image Optimization for /public assets.
- Add cache-control: public, max-age=31536000 for static assets.
- Edge caching: enable ISR for dynamic routes.`;
  const speedInsightsCheckedRef = useRef(false);
  useEffect(() => {
    if (speedInsightsCheckedRef.current) return;
    speedInsightsCheckedRef.current = true;
    const latency = 150 + Math.random() * 120;
    if (latency > 200) {
      setActiveAgentLead(1);
      setAgencyTeam((prev) => ({ ...prev, leadDev: 'working' }));
      setAgentTypingText(EDGE_OPTIMIZATION_PATCH);
      appendNightLog('Lead Dev: Speed Insights — latency > 200ms. Edge Optimization patch suggested in terminal.');
    }
  }, [setActiveAgentLead, setAgencyTeam, setAgentTypingText, appendNightLog]);

  if (showShowroom) {
    return (
      <ShowroomView
        onLaunchLab={() => setEnteredLab(true)}
        autonomousBlogPosts={autonomousBlogPosts}
      />
    );
  }

  const onMouseMoveAura = useCallback((e) => {
    setAuraMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, []);

  return (
    <div
      className={cn(
        'app-bg text-white flex flex-col',
        vibe === 'cloud' ? 'vibe-cloud' : 'vibe-obsidian',
        themeConfig.vibe === 'custom' && 'vibe-custom',
        nightShiftLog.length > 0 && 'has-night-feed',
        cinematicFocus && 'cinematic-mode'
      )}
      style={{
        ...customOrbVars,
        ['--mouse-x']: auraMouse.x,
        ['--mouse-y']: auraMouse.y,
      }}
      data-health={deploymentStatus}
      onMouseMove={onMouseMoveAura}
    >
      <div className="aura-cursor-layer" aria-hidden />
      <div className="glow-orb glow-orb-tl" aria-hidden />
      <div className="glow-orb glow-orb-tr" aria-hidden />
      <div className="glow-orb glow-orb-bl" aria-hidden />
      <div className="glow-orb glow-orb-br" aria-hidden />

      {/* Aura Pulse 8 logo — breathe synced to 60s Autopilot heartbeat */}
      <div className="dominat8-engine-logo nexus-logo-wrap" aria-hidden>
        <Dominat8Logo variant="subtle" heartbeat={logoHeartbeat} />
      </div>

      {/* Biometric heartbeat ripple — spreads across UI when Autopilot loop completes */}
      <AnimatePresence>
        {logoHeartbeat > 0 && (
          <motion.div
            key={logoHeartbeat}
            className="nexus-heartbeat-ripple fixed inset-0 z-[8] pointer-events-none"
            initial={{ opacity: 0.6, scale: 0.3 }}
            animate={{ opacity: 0, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Stress Test: FPS meter when ?stress=N is in URL */}
      {stressCount > 0 && <FPSMeter />}

      {/* Cinematic overlay when Focus Mode on */}
      <AnimatePresence>
        {cinematicFocus && (
          <motion.div
            className="cinematic-dim fixed inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Toolbar: Bring Forward, Vercel Status, … (hidden in Focus Mode and User View) */}
      {!cinematicFocus && !userViewMode && (
      <div className="builder-toolbar flex items-center gap-2">
        {/* Energy Orbs: Creative (Pink), Dev (Cyan), QA (Amber) — pulse speed reflects active agent */}
        <div className="nexus-energy-orbs flex items-center gap-2 px-2 border-r border-white/15 mr-1" aria-label="Agent status">
          {[
            { key: 'creativeDirector', color: '#ec4899', label: 'Creative' },
            { key: 'leadDev', color: '#22d3ee', label: 'Dev' },
            { key: 'qa', color: '#fbbf24', label: 'QA' },
          ].map((agent, idx) => {
            const isActive = activeAgentLead === idx;
            return (
              <motion.span
                key={agent.key}
                className={cn('nexus-orb', isActive && 'nexus-orb-active')}
                style={{ ['--orb-color']: agent.color }}
                animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.9, 1, 0.9] } : { scale: 1, opacity: 0.6 }}
                transition={{ duration: isActive ? 0.8 : 2, repeat: Infinity, ease: 'easeInOut' }}
                title={`${agent.label}: ${isActive ? 'Active' : 'Idle'}`}
              />
            );
          })}
        </div>
        <motion.button
          type="button"
          onClick={() => setCinematicFocus(true)}
          className="builder-toggle flex items-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          title="Cinematic Mode — hide sidebars, center build terminal"
        >
          <Maximize2 className="w-4 h-4" />
          Cinematic
        </motion.button>
        <motion.button
          type="button"
          onClick={checkVercelStatus}
          disabled={vercelSyncLoading}
          className={cn(
            'vercel-status-pill flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium cursor-pointer border-none',
            deploymentStatus === 'error'
              ? 'vercel-status-failed'
              : deploymentStatus === 'ok'
              ? 'vercel-status-active'
              : 'vercel-status-active'
          )}
          title={vercelSyncLoading ? 'Syncing…' : `Vercel status (Pro): ${deploymentStatus === 'ok' ? 'healthy' : deploymentStatus === 'error' ? 'error' : 'unknown'}. Click to sync.`}
          aria-label={vercelSyncLoading ? 'Syncing Vercel status' : `Vercel status: ${deploymentStatus === 'ok' ? 'healthy' : deploymentStatus === 'error' ? 'error' : 'unknown'}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <span className="vercel-status-dot" aria-hidden />
          {vercelSyncLoading ? 'Syncing…' : 'Vercel Status'}
          {!isPro && <Crown className="w-3.5 h-3.5 text-amber-400/90 ml-0.5" />}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setSelfHealingOn(!selfHealingOn)}
          className={cn('builder-toggle', selfHealingOn && 'active')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          title={!isPro ? 'Self-Healing (Pro) — Upgrade to Pro for full access' : 'Toggle Self-Healing'}
        >
          <span className="flex items-center gap-1.5">
            Self-Healing
            {!isPro && <Crown className="w-3.5 h-3.5 text-amber-400/90" />}
          </span>
        </motion.button>
        {!isPro && (
          <button
            type="button"
            onClick={() => setShowUpgradeProModal(true)}
            className="text-xs text-amber-400/90 hover:text-amber-300 font-medium px-1"
            title="Upgrade to Pro"
          >
            Upgrade to Pro
          </button>
        )}
        {deploymentStatus === 'error' ? (
          <motion.button
            type="button"
            onClick={clearSimulation}
            className="builder-toggle text-xs text-white/80 hover:text-white border border-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Clear simulated error and restore healthy state"
          >
            Clear simulation
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={simulateError}
            className="builder-toggle text-xs text-white/70 hover:text-white/90"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Simulate Vercel error + mock logs for recording Self-Healing TikTok"
          >
            Simulate error
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={() => {
            setVibe(vibe === 'obsidian' ? 'cloud' : 'obsidian');
            setCustomVibeFromImage(null);
          }}
          className={cn('builder-toggle', vibe === 'cloud' && 'active')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {themeConfig.vibe === 'custom' ? 'Custom' : vibe === 'obsidian' ? 'Obsidian' : 'Cloud'}
        </motion.button>
        {/* More dropdown: secondary actions — cleaner toolbar for dominat8.io focus */}
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => setShowToolbarMore(!showToolbarMore)}
            className={cn('builder-toggle flex items-center gap-1.5', showToolbarMore && 'active')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            title="More actions"
          >
            More
            <ChevronDown className={cn('w-4 h-4 transition-transform', showToolbarMore && 'rotate-180')} />
          </motion.button>
          <AnimatePresence>
            {showToolbarMore && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowToolbarMore(false)} aria-hidden />
                <motion.div
                  className="toolbar-more-dropdown absolute top-full right-0 mt-1 z-50 min-w-[180px] py-1 rounded-xl deployment-card-glass border border-white/20 shadow-2xl"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <button type="button" onClick={() => { setShowBlueprintStore(true); setShowToolbarMore(false); }} className="toolbar-more-item"><Store className="w-4 h-4" /> Blueprint Store</button>
                  <button type="button" onClick={() => { setShowSourceCode(!showSourceCode); setShowToolbarMore(false); }} className={cn('toolbar-more-item', showSourceCode && 'active')}><FileText className="w-4 h-4" /> Developer View</button>
                  <button type="button" onClick={() => { downloadSitemap(); setShowToolbarMore(false); }} className="toolbar-more-item">Sitemap</button>
                  <button type="button" onClick={() => { downloadVercelJson(); setShowToolbarMore(false); }} className="toolbar-more-item">vercel.json</button>
                  <button type="button" onClick={() => { setShowTickets(!showTickets); setShowToolbarMore(false); }} className={cn('toolbar-more-item', showTickets && 'active')}><Ticket className="w-4 h-4" /> Tickets</button>
                  <button type="button" onClick={() => { setShowAgencySidebar(true); setShowToolbarMore(false); }} className={cn('toolbar-more-item', showAgencySidebar && 'active')}><Sparkles className="w-4 h-4" /> Social Lab</button>
                  <button type="button" onClick={() => { setActiveAgentLead(0); appendNightLog('Creative Director: Global Launch — suggested translated meta-tags and headers for EN, ES, FR, DE, PT, JA, ZH, KO, AR, HI. Ready for multi-language rollout.'); setShowToolbarMore(false); }} className="toolbar-more-item"><Languages className="w-4 h-4" /> Global Launch</button>
                  <button type="button" onClick={() => { setUserViewMode(true); setShowAgencySidebar(false); setShowToolbarMore(false); }} className="toolbar-more-item"><User className="w-4 h-4" /> User View</button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        {/* DNS Status: green when dominat8.io / dominat8.com are valid (Content & Commerce Engine) */}
        <div
          className={cn(
            'dns-status-pill flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border',
            typeof window !== 'undefined' && /dominat8\.(io|com)$/.test(window.location.hostname)
              ? 'dns-status-valid'
              : 'dns-status-pending'
          )}
          title={typeof window !== 'undefined' && /dominat8\.(io|com)$/.test(window.location.hostname) ? 'Domain valid (dominat8.io / dominat8.com)' : 'DNS status'}
        >
          <span className="dns-status-dot" aria-hidden />
          DNS
        </div>
        {/* Team Status strip: always visible in toolbar so neon indicators show (Empire State) */}
        <div className="team-status-toolbar-strip" aria-label="Agency team status">
          {AGENCY_AGENTS.map((agent, idx) => {
            const status = agencyTeam[agent.key] || 'idle';
            const isWorking = status === 'working' || idx === activeAgentLead;
            return (
              <span key={agent.key} data-agent={agent.key} className={cn('team-status-toolbar-item', isWorking && 'team-status-working')} title={`${agent.label}: ${isWorking ? 'Working' : 'Idle'}`}>
                <span className="team-status-dot" aria-hidden />
                <span className="team-status-label">{agent.short}</span>
              </span>
            );
          })}
        </div>
      </div>
      )}

      {/* Exit Focus button (visible only in cinematic mode) */}
      <AnimatePresence>
        {cinematicFocus && (
          <motion.button
            type="button"
            className="cinematic-exit-focus fixed top-4 right-4 z-30 p-2 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 transition-colors"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setCinematicFocus(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Exit Focus Mode"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Morning Report Modal (on startup when night shift has data) */}
      <AnimatePresence>
        {showMorningReportModal && nightShiftLog.length > 0 && (
          <MorningReportModal nightShiftLog={nightShiftLog} onClose={dismissMorningReport} />
        )}
      </AnimatePresence>

      {/* Onboarding modal: 3-Step Launch for New deployments (Content & Commerce Engine) */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onLaunch={() => {
          const newDeploy = deployments.find((d) => d.status === 'New');
          if (newDeploy?.id) startOnboarding(newDeploy.id);
        }}
      />

      {/* Empire: Blueprint Store modal */}
      <BlueprintStoreModal
        isOpen={showBlueprintStore}
        onClose={() => setShowBlueprintStore(false)}
        primeBlueprints={PRIME_BLUEPRINTS}
        installedBlueprintId={installedBlueprintId}
        onInstall={(id) => {
          setInstalledBlueprintId(id);
          const bp = PRIME_BLUEPRINTS.find((b) => b.id === id);
          appendNightLog(bp ? `Blueprint "${bp.name}" installed. Site look upgraded.` : `Blueprint ${id} installed.`);
        }}
      />

      {/* Empire: Upgrade to Pro CTA modal */}
      <UpgradeProModal isOpen={showUpgradeProModal} onClose={() => setShowUpgradeProModal(false)} />

      {/* Intelligence Suite: Concierge Support — 24/7 widget; Lead Dev applies to JSON */}
      {!userViewMode && (
        <ConciergeSupportWidget
          isOpen={showConcierge}
          onOpen={() => setShowConcierge(true)}
          onClose={() => setShowConcierge(false)}
          onSubmit={handleConciergeRequest}
        />
      )}

      {/* Agency Intelligence sidebar */}
      <AgencyIntelligenceSidebar
        nightShiftLog={nightShiftLog}
        agencyTeam={agencyTeam}
        activeAgentLead={activeAgentLead}
        isOpen={showAgencySidebar}
        onClose={() => setShowAgencySidebar(false)}
        seoHealth={seoHealth}
        isPro={isPro}
        onUpgradePro={() => setShowUpgradeProModal(true)}
        onGlobalUpdate={runGlobalUpdate}
      />

      {/* Self-Healing Ticket panel */}
      <AnimatePresence>
        {showTickets && (
          <motion.div
            className="ticket-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
          <div className="ticket-panel-header">
            <span>Support ticket → CSS fix</span>
            <button type="button" onClick={() => setShowTickets(false)} className="text-white/60 hover:text-white" aria-label="Close"> <X className="w-4 h-4" /> </button>
          </div>
          <div className="ticket-panel-body">
            {supportTicket ? (
              <>
                <div className="ticket-quote">"{supportTicket}"</div>
                {suggestedPatch && (
                  <pre className="ticket-patch">{suggestedPatch.code}</pre>
                )}
                <div className="flex gap-2 flex-wrap">
                  <motion.button type="button" onClick={applyTicketFix} className="ticket-btn ticket-btn-apply" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}> Apply fix </motion.button>
                  <motion.button type="button" onClick={simulateTicket} className="ticket-btn ticket-btn-sim" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}> New ticket </motion.button>
                </div>
              </>
            ) : (
              <>
                <p className="text-white/60 text-sm mb-3">Simulate a user support ticket. The agent suggests a CSS patch and you can apply it live.</p>
                <motion.button type="button" onClick={simulateTicket} className="ticket-btn ticket-btn-sim" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}> Simulate ticket </motion.button>
              </>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* AI Activity Feed – hidden in Focus Mode and User View */}
      {!cinematicFocus && !userViewMode && nightShiftLog.length > 0 && (
        <motion.div
          className="night-shift-feed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="night-shift-feed-header">AI Activity Feed (aura_night_shift)</div>
          <ul className="night-shift-feed-list" aria-label="Night shift log">
            {nightShiftLog.slice(-18).reverse().map((entry, i) => (
              <li key={`${entry.time}-${i}`} className="night-shift-feed-item">
                <span className="night-shift-feed-time">[{entry.time}]</span>
                <span className="night-shift-feed-msg">{entry.message}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {userViewMode ? (
        <motion.div
          className="main-content-wrap flex flex-col items-center pt-20 pb-32 px-4 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Elite Operations: Tenant Shield — Matrix-style scanlines when Client View active */}
          <div className="tenant-shield-scanlines fixed inset-0 z-[5] pointer-events-none" aria-hidden />
          <div className="w-full max-w-xl rounded-2xl p-8 deployment-card-glass border border-white/10 relative z-10">
            <h2 className="text-xl font-semibold text-white/95 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400/80" />
              Client Portal
            </h2>
            <p className="text-white/50 text-sm mb-4">Pulse Analytics for your project. No Admin tools — what your clients see.</p>
            <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Project</label>
            <select
              value={clientPortalProjectId}
              onChange={(e) => setClientPortalProjectId(e.target.value)}
              className="mb-4 w-full rounded-xl bg-white/5 border border-white/10 text-white/90 py-2 px-3 text-sm"
            >
              {(() => {
                const sanitized = effectiveDeployments.map((d) => ({ id: d.id, url: d.url, status: d.status }));
                return sanitized.map((d) => (
                  <option key={d.id} value={d.id}>{d.url}</option>
                ));
              })()}
            </select>
            <GrowthHeartbeat nightShiftLog={nightShiftLog} seoHealth={seoHealth} />
            <button
              type="button"
              onClick={() => setUserViewMode(false)}
              className="mt-6 w-full py-3 rounded-xl font-medium bg-white/10 border border-white/20 text-white/90 hover:bg-white/15"
            >
              Exit User View
            </button>
          </div>
        </motion.div>
      ) : (
      <motion.div
        className={cn('main-content-wrap', cinematicFocus && 'main-content-cinematic')}
        animate={{
          scale: cinematicFocus ? 1.02 : 1,
          transition: { type: 'spring', stiffness: 300, damping: 30 },
        }}
      >
        <AnimatePresence mode="wait">
          {showSourceCode ? (
            <motion.div
              key="developer"
              className="builder-split"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="builder-panel builder-panel-json">
                <div className="builder-panel-header">Blueprint JSON (Developer View)</div>
                <pre className="builder-json">{jsonString}</pre>
              </div>
              <div className="builder-panel builder-panel-live">
                <div className="builder-panel-header">Live Preview</div>
                <div className="builder-live-inner">
                  {renderPage(effectiveBlueprint, auraContext)}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.main
              key={vibe}
              className="main-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {renderPage(effectiveBlueprint, auraContext)}
            </motion.main>
          )}
        </AnimatePresence>
      </motion.div>
      )}

      <AnimatePresence mode="wait">
        {fullScreenDeployment && (
          <FullScreenSetup
            key={fullScreenId}
            deployment={fullScreenDeployment}
            onClose={() => {
              setOnboardingStep(null);
              closeFullScreen();
            }}
            closing={closingOverlay}
            focusModeProgress={focusModeProgress}
            onboardingStep={onboardingStep}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
