import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Globe, Lock, Monitor, Wrench, Sparkles, Settings, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';
import './App.css';

function cn(...args) {
  return clsx(...args);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE CONTROLLER – single source of truth (edit here, no messy branches)
// ═══════════════════════════════════════════════════════════════════════════════
const ACTIVE_DEPLOYMENTS = [
  { id: '1', url: 'www.horizonaid.tech', progress: 72, color: 'green', status: 'ok' },
  { id: '2', url: 'akiraspacepro.io', progress: 45, color: 'orange', status: 'New' },
  { id: '3', url: 'bloometapro.com', progress: 88, color: 'blue', status: 'ok' },
];

// Live Blueprint Engine – change one word here, UI re-morphs instantly
const siteBlueprint = [
  { type: 'Hero', id: 'hero', props: { placeholder: 'What would you like to build?' } },
  { type: 'BentoStats', id: 'bento', props: {} },
  { type: 'DeploymentCard', id: 'deployments', props: {} },
  { type: 'InteractiveDock', id: 'dock', props: {} },
];

const DOCK_ITEMS = [
  { id: 'deploy', label: 'Deploy', Icon: Rocket, color: '#22c55e' },
  { id: 'domains', label: 'Domains', Icon: Globe, color: '#3b82f6' },
  { id: 'ssl', label: 'SSL', Icon: Lock, color: '#eab308' },
  { id: 'monitor', label: 'Monitor', Icon: Monitor, color: '#a855f7' },
  { id: 'fix', label: 'Fix', Icon: Wrench, color: '#f97316' },
  { id: 'automate', label: 'Automate', Icon: Sparkles, color: '#ec4899' },
  { id: 'settings', label: 'Settings', Icon: Settings, color: '#94a3b8' },
];

const AGENT_FIX_SCRIPT = 'Detecting SSL failure on horizonaid.tech...\nApplying certificate renewal...\nCertificate renewed. Status: OK';

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

function ProgressBar({ progress, color }) {
  const fillClass =
    color === 'green' ? 'progress-fill-green' : color === 'orange' ? 'progress-fill-orange' : 'progress-fill-blue';
  return (
    <div className="progress-track">
      <div className={cn('progress-fill', fillClass)} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
    </div>
  );
}

// ─── Block components (Live Blueprint drives these) ───
function HeroBlock({ props: blockProps = {}, context }) {
  const placeholder = blockProps.placeholder || 'What would you like to build?';
  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="relative flex items-center rounded-full bg-white/5 border border-white/10 focus-within:border-white/20 focus-within:ring-2 focus-within:ring-white/10 transition-all duration-200">
        <span className="pl-5 flex-shrink-0 text-white/60">
          <Rocket className="w-5 h-5" />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full py-4 pl-3 pr-6 bg-transparent text-white placeholder-white/40 outline-none text-base"
          aria-label="Search or command"
        />
      </div>
    </div>
  );
}

function BentoStatsBlock({ props: blockProps, context }) {
  const { bentoStats = { uptime: '99.98%', traffic: '12.4K', optimizing: 'Active' } } = context || {};
  return (
    <div className="w-full max-w-4xl flex justify-center mb-8">
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
      </div>
    </div>
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
  } = context || {};
  const errorDeploymentId = selfHealingOn ? criticalErrorId : null;
  const showAgentTerminal = selfHealingOn && agentTypingText !== null;
  const showDeployTerminal = isDeploying && deployLogText !== null;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Self-Healing agent terminal (fix/SSL) – separate from deploy logs */}
      {showAgentTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="agent-terminal"
        >
          <div className="agent-terminal-line whitespace-pre-wrap">{agentTypingText}</div>
        </motion.div>
      )}
      {/* Deployment simulator terminal – build/deploy log (only when deploying) */}
      {showDeployTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="deploy-terminal"
        >
          <div className="deploy-terminal-header">Build log</div>
          <div className="deploy-terminal-line whitespace-pre-wrap">{deployLogText}</div>
        </motion.div>
      )}
      {onDeployClick && !showDeployTerminal && (
        <motion.button
          type="button"
          onClick={onDeployClick}
          className="deploy-new-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <Rocket className="w-5 h-5" />
          Deploy New Project
        </motion.button>
      )}
      <div className="w-full flex flex-wrap justify-center gap-6">
        {deployments.map((d) => {
          const isError = d.status === 'Error' || (selfHealingOn && d.id === errorDeploymentId);
          const isHealing = healingId === d.id;
          return (
            <motion.div
              key={d.id}
              layout
              layoutId={fullScreenId === d.id ? `deploy-card-${d.id}` : undefined}
              className={cn(
                'deployment-card deployment-card-glass relative w-full sm:w-[280px] rounded-2xl p-6 text-left cursor-pointer overflow-hidden',
                isHealing && 'healing-pulse'
              )}
              onClick={() => openFullScreen && openFullScreen(d.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {isHealing && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-emerald-400/60 pointer-events-none"
                  initial={{ opacity: 0.8, scale: 0.95 }}
                  animate={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
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
              <ProgressBar progress={d.progress} color={d.color} />
              <div className="mt-2 text-white/40 text-sm">{d.progress}% complete</div>
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// View panel shown when a dock item other than Deploy is selected (navigation content)
const VIEW_PANEL_CONFIG = {
  domains: { label: 'Domains', description: 'Manage custom domains and DNS records.', Icon: Globe },
  ssl: { label: 'SSL', description: 'Certificates and HTTPS status for your deployments.', Icon: Lock },
  monitor: { label: 'Monitor', description: 'Uptime, logs, and performance metrics.', Icon: Monitor },
  fix: { label: 'Fix', description: 'Self-heal and repair deployment issues.', Icon: Wrench },
  automate: { label: 'Automate', description: 'Workflows and automation rules.', Icon: Sparkles },
  settings: { label: 'Settings', description: 'Project and account preferences.', Icon: Settings },
};

function ViewPanelBlock({ props: blockProps }) {
  const { viewId = 'domains' } = blockProps;
  const config = VIEW_PANEL_CONFIG[viewId] || VIEW_PANEL_CONFIG.domains;
  const Icon = config.Icon;
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

function InteractiveDockBlock({ props: blockProps, context }) {
  const { activeView, setActiveView, dockItems = DOCK_ITEMS, onFocusMode } = context || {};
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20" aria-label="Main navigation">
      <div className="dock flex items-center gap-1 px-4 py-3 rounded-2xl border border-white/10">
        {dockItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'dock-icon-btn p-3 rounded-xl transition-all duration-200 hover:bg-white/10',
              activeView === item.id && 'bg-white/15'
            )}
            style={{
              color: item.color,
              opacity: activeView === item.id ? 1 : 0.5,
            }}
            title={item.label}
            aria-label={item.label}
            aria-pressed={activeView === item.id}
            onClick={() => {
              setActiveView && setActiveView(item.id);
              if (item.id === 'deploy') onFocusMode && onFocusMode();
            }}
          >
            <item.Icon className="w-6 h-6" />
          </button>
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
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function renderPage(blueprint, context) {
  return (
    <motion.div
      className="aura-renderer flex flex-col items-center pt-10 pb-28 px-4 w-full"
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

function App() {
  // ═══ Global State Controller – one place, no confusion ═══
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [selfHealingOn, setSelfHealingOn] = useState(false);
  const [vibe, setVibe] = useState('obsidian');
  const [activeView, setActiveView] = useState('deploy');
  const [fullScreenId, setFullScreenId] = useState(null);
  const [closingOverlay, setClosingOverlay] = useState(false);
  const [healingId, setHealingId] = useState(null);
  const [deployments, setDeployments] = useState(() => [...ACTIVE_DEPLOYMENTS]);
  const [agentTypingText, setAgentTypingText] = useState(null);
  const [focusModeProgress, setFocusModeProgress] = useState({ dns: 0, ssl: 0 });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogText, setDeployLogText] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(null);
  const agentTypingIndex = useRef(0);
  const deployLogIndex = useRef(0);
  const CRITICAL_ERROR_DEPLOY_ID = '1';

  // Theme config: single source for vibe → JSON/cards (Vibe-to-Code bridge)
  const themeConfig = useMemo(
    () =>
      vibe === 'obsidian'
        ? {
            vibe: 'obsidian',
            cardGlow: true,
            shadowStyle: 'neon',
            cardBorder: 'rgba(255,255,255,0.1)',
            orbOpacity: 0.35,
          }
        : {
            vibe: 'cloud',
            cardGlow: false,
            shadowStyle: 'soft',
            cardBorder: 'rgba(0,0,0,0.06)',
            orbOpacity: 0.08,
          },
    [vibe]
  );

  const fullScreenDeployment = fullScreenId ? deployments.find((d) => d.id === fullScreenId) : null;

  const openFullScreen = (id) => {
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
    const ti = setInterval(() => {
      step += 1;
      const t = step / steps;
      setFocusModeProgress({
        dns: Math.min(100, Math.round(t * 100)),
        ssl: Math.min(100, Math.round(t * 100)),
      });
      if (step >= steps) clearInterval(ti);
    }, stepMs);
  };

  const closeFullScreen = () => {
    setClosingOverlay(true);
    setTimeout(() => {
      setFullScreenId(null);
      setClosingOverlay(false);
      setFocusModeProgress({ dns: 0, ssl: 0 });
    }, 220);
  };

  const onFocusMode = () => openFullScreen(deployments[0]?.id || '1');

  // Deploy simulator: scrolling build log (separate from Self-Healing terminal)
  const onDeployClick = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployLogText('');
    deployLogIndex.current = 0;
  };

  useEffect(() => {
    if (!isDeploying) return;
    const full = DEPLOY_SCRIPT;
    const id = setInterval(() => {
      if (deployLogIndex.current >= full.length) {
        clearInterval(id);
        setTimeout(() => {
          setIsDeploying(false);
          setDeployLogText(null);
        }, 800);
        return;
      }
      deployLogIndex.current += 1;
      setDeployLogText(full.slice(0, deployLogIndex.current));
    }, 55);
    return () => clearInterval(id);
  }, [isDeploying]);

  // Auto-onboarding: Focus Mode + 3 steps (Domain Check → DNS Config → Final Launch)
  const startOnboarding = (cardId) => {
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
    const ti = setInterval(() => {
      step += 1;
      if (step > 3) {
        setOnboardingStep(null);
        clearInterval(ti);
        return;
      }
      setOnboardingStep(step <= 3 ? step - 1 : null);
      const s = steps[Math.min(step - 1, 2)];
      setFocusModeProgress({ dns: s.dns, ssl: s.ssl });
    }, 900);
  };

  const onFixDeployment = (id) => {
    setHealingId(id);
    setTimeout(() => {
      setDeployments((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'ok' } : d)));
      setHealingId(null);
    }, 600);
  };

  // Agentic Self-Healer: when Self-Healing is ON, simulate bug and type fix in real-time
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
    setAgentTypingText('');
    agentTypingIndex.current = 0;
    const full = AGENT_FIX_SCRIPT;
    const id = setInterval(() => {
      if (agentTypingIndex.current >= full.length) {
        clearInterval(id);
        setTimeout(() => {
          setDeployments((prev) =>
            prev.map((d) => (d.id === CRITICAL_ERROR_DEPLOY_ID ? { ...d, status: 'ok' } : d))
          );
          setAgentTypingText(null);
        }, 400);
        return;
      }
      agentTypingIndex.current += 1;
      setAgentTypingText(full.slice(0, agentTypingIndex.current));
    }, 45);
    return () => clearInterval(id);
  }, [selfHealingOn]);

  useEffect(() => {
    if (!fullScreenId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeFullScreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullScreenId]);

  const auraContext = {
    activeView,
    setActiveView,
    deployments,
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
    bentoStats: { uptime: '99.98%', traffic: '12.4K', optimizing: 'Active' },
  };

  // Navigation: when activeView is not "deploy", show Hero + view panel + dock instead of full dashboard
  const dockBlock = siteBlueprint.find((b) => b.type === 'InteractiveDock') || siteBlueprint[siteBlueprint.length - 1];
  const heroBlock = siteBlueprint.find((b) => b.type === 'Hero') || siteBlueprint[0];
  const isDeployView = activeView === 'deploy';
  const effectiveBlueprint = isDeployView
    ? siteBlueprint
    : [heroBlock, { type: 'ViewPanel', id: 'view', props: { viewId: activeView } }, dockBlock];

  // Vibe-to-Code: JSON panel shows blueprint + current themeConfig (Obsidian = neon, Cloud = soft)
  const jsonForPanel = { theme: themeConfig, blueprint: siteBlueprint };
  const jsonString = JSON.stringify(jsonForPanel, null, 2);

  return (
    <div className={cn('app-bg text-white flex flex-col', vibe === 'cloud' ? 'vibe-cloud' : 'vibe-obsidian')}>
      <div className="glow-orb glow-orb-tl" aria-hidden />
      <div className="glow-orb glow-orb-tr" aria-hidden />
      <div className="glow-orb glow-orb-bl" aria-hidden />
      <div className="glow-orb glow-orb-br" aria-hidden />

      {/* Toolbar: Self-Healing, Vibe, Source Code – haptic springs */}
      <div className="builder-toolbar flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => setSelfHealingOn(!selfHealingOn)}
          className={cn('builder-toggle', selfHealingOn && 'active')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          Self-Healing
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setVibe(vibe === 'obsidian' ? 'cloud' : 'obsidian')}
          className={cn('builder-toggle', vibe === 'cloud' && 'active')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {vibe === 'obsidian' ? 'Obsidian' : 'Cloud'}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setShowSourceCode(!showSourceCode)}
          className={cn('builder-toggle', showSourceCode && 'active')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          Source Code
        </motion.button>
      </div>

      {showSourceCode ? (
        <div className="builder-split">
          <div className="builder-panel builder-panel-json">
            <div className="builder-panel-header">Blueprint JSON</div>
            <pre className="builder-json">{jsonString}</pre>
          </div>
          <div className="builder-panel builder-panel-live">
            <div className="builder-panel-header">Live Preview</div>
            <div className="builder-live-inner">
              {renderPage(effectiveBlueprint, auraContext)}
            </div>
          </div>
        </div>
      ) : (
        <main className="main-screen">
          {renderPage(effectiveBlueprint, auraContext)}
        </main>
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
