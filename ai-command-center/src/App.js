import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';

// --- Aura Builder: JSON blueprint for the page ---
const siteBlueprint = [
  { type: 'Hero', id: 'hero', props: { placeholder: 'What would you like to build?' } },
  { type: 'DeploymentCard', id: 'deployments', props: {} },
  { type: 'InteractiveDock', id: 'dock', props: {} },
];

const DEPLOYMENTS = [
  { id: '1', url: 'www.horizonaid.tech', progress: 72, color: 'green' },
  { id: '2', url: 'akiraspacepro.io', progress: 45, color: 'orange' },
  { id: '3', url: 'bloometapro.com', progress: 88, color: 'blue' },
];

const DOCK_ITEMS = [
  { id: 'deploy', label: 'Deploy', icon: RocketIcon, color: '#22c55e' },
  { id: 'domains', label: 'Domains', icon: GlobeIcon, color: '#3b82f6' },
  { id: 'ssl', label: 'SSL', icon: LockIcon, color: '#eab308' },
  { id: 'monitor', label: 'Monitor', icon: MonitorIcon, color: '#a855f7' },
  { id: 'fix', label: 'Fix', icon: WrenchIcon, color: '#f97316' },
  { id: 'automate', label: 'Automate', icon: AutomateIcon, color: '#ec4899' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, color: '#94a3b8' },
];

function RocketIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.18a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function GlobeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function MonitorIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  );
}

function WrenchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function AutomateIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ProgressBar({ progress, color }) {
  const fillClass =
    color === 'green' ? 'progress-fill-green' : color === 'orange' ? 'progress-fill-orange' : 'progress-fill-blue';
  return (
    <div className="progress-track">
      <div className={`progress-fill ${fillClass}`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
    </div>
  );
}

// --- Aura Builder: Block components (used by AuraRenderer) ---
function HeroBlock({ props: blockProps = {}, context }) {
  const placeholder = blockProps.placeholder || 'What would you like to build?';
  return (
    <div className="w-full max-w-2xl mb-10">
      <div className="relative flex items-center rounded-full bg-white/5 border border-white/10 focus-within:border-white/20 focus-within:ring-2 focus-within:ring-white/10 transition-all duration-200">
        <span className="pl-5 flex-shrink-0 text-white/60">
          <RocketIcon className="w-5 h-5" />
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

function DeploymentCardBlock({ props: blockProps, context }) {
  const { frontCardId, setFrontCardId, deployments = DEPLOYMENTS, openFullScreen } = context || {};
  const selectedDeployment = deployments.find((d) => d.id === frontCardId);
  return (
    <div className="w-full flex flex-col items-center gap-6">
      {selectedDeployment && openFullScreen && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openFullScreen(selectedDeployment.id)}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/15 transition-colors"
          >
            Full Screen
          </button>
          <span className="text-white/50 text-sm">Selected: {selectedDeployment.url}</span>
        </div>
      )}
      <div className="w-full flex flex-wrap justify-center gap-6">
      {deployments.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => setFrontCardId && setFrontCardId(frontCardId === d.id ? null : d.id)}
          className={`deployment-card deployment-card-glass relative w-full sm:w-[280px] rounded-2xl p-6 text-left cursor-pointer ${frontCardId === d.id ? 'pop-front' : ''}`}
        >
          <div className="text-white/90 font-medium text-lg mb-3 truncate" title={d.url}>
            {d.url}
          </div>
          <ProgressBar progress={d.progress} color={d.color} />
          <div className="mt-2 text-white/40 text-sm">{d.progress}% complete</div>
        </button>
      ))}
      </div>
    </div>
  );
}

function InteractiveDockBlock({ props: blockProps, context }) {
  const { activeView, setActiveView, dockItems = DOCK_ITEMS } = context || {};
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20" aria-label="Main navigation">
      <div className="dock flex items-center gap-1 px-4 py-3 rounded-2xl border border-white/10">
        {dockItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveView && setActiveView(item.id)}
            className={`p-3 rounded-xl transition-all duration-200 hover:bg-white/10 ${activeView === item.id ? 'bg-white/15' : ''}`}
            style={{
              color: item.color,
              opacity: activeView === item.id ? 1 : 0.5,
            }}
            title={item.label}
            aria-label={item.label}
            aria-pressed={activeView === item.id}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </nav>
  );
}

const COMPONENT_MAP = {
  Hero: HeroBlock,
  DeploymentCard: DeploymentCardBlock,
  InteractiveDock: InteractiveDockBlock,
};

// --- Aura Builder: JSON-to-UI renderer with Framer Motion ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function AuraRenderer({ blueprint, context }) {
  return (
    <motion.div
      className="aura-renderer flex flex-col items-center pt-12 pb-28 px-4 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {blueprint.map((block, index) => {
        const Component = COMPONENT_MAP[block.type];
        if (!Component) return null;
        return (
          <motion.div key={block.id || index} variants={itemVariants} className="w-full max-w-4xl flex flex-col items-center">
            <Component props={block.props || {}} context={context} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function App() {
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [activeView, setActiveView] = useState('deploy');
  const [frontCardId, setFrontCardId] = useState(null);
  const [fullScreenId, setFullScreenId] = useState(null);
  const [closingOverlay, setClosingOverlay] = useState(false);

  const fullScreenDeployment = fullScreenId ? DEPLOYMENTS.find((d) => d.id === fullScreenId) : null;

  const openFullScreen = (id) => setFullScreenId(id);

  const auraContext = {
    activeView,
    setActiveView,
    frontCardId,
    setFrontCardId,
    deployments: DEPLOYMENTS,
    dockItems: DOCK_ITEMS,
    openFullScreen,
  };

  const closeFullScreen = () => {
    setClosingOverlay(true);
    setTimeout(() => {
      setFullScreenId(null);
      setClosingOverlay(false);
    }, 250);
  };

  useEffect(() => {
    if (!fullScreenId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeFullScreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullScreenId]);

  const jsonString = JSON.stringify(siteBlueprint, null, 2);

  return (
    <div className="app-bg text-white flex flex-col">
      <div className="glow-orb glow-orb-tl" aria-hidden />
      <div className="glow-orb glow-orb-tr" aria-hidden />
      <div className="glow-orb glow-orb-bl" aria-hidden />
      <div className="glow-orb glow-orb-br" aria-hidden />

      {/* Source Code toggle - world-class builder style */}
      <div className="builder-toolbar">
        <button
          type="button"
          onClick={() => setShowSourceCode(!showSourceCode)}
          className={`builder-toggle ${showSourceCode ? 'active' : ''}`}
        >
          Source Code
        </button>
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
              <AuraRenderer blueprint={siteBlueprint} context={auraContext} />
            </div>
          </div>
        </div>
      ) : (
        <main className="main-screen">
          <AuraRenderer blueprint={siteBlueprint} context={auraContext} />
        </main>
      )}

      {/* Full-screen overlay for deployment (when implemented in cards) */}
      {fullScreenDeployment && (
        <div
          className={`full-screen-overlay ${closingOverlay ? 'closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Deployment full screen"
        >
          <div className="full-screen-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white/95 truncate pr-4">{fullScreenDeployment.url}</h3>
              <button
                type="button"
                onClick={closeFullScreen}
                className="flex-shrink-0 p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Exit full screen"
              >
                <span className="text-lg font-bold">×</span>
              </button>
            </div>
            <ProgressBar progress={fullScreenDeployment.progress} color={fullScreenDeployment.color} />
            <p className="mt-3 text-white/50 text-sm">{fullScreenDeployment.progress}% complete</p>
          </div>
          <div className="absolute inset-0" onClick={closeFullScreen} role="button" tabIndex={-1} aria-label="Close overlay" />
        </div>
      )}
    </div>
  );
}

export default App;
