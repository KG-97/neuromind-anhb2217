import React, { useMemo, useState } from 'react';
import { Brain, Menu, X } from 'lucide-react';
import { AtlasRoute } from './types';
import { atlasDefaultRoute, atlasRouteRegistry } from './app/atlasRoutes';
import React, { useEffect, useState } from 'react';
import { Activity, Zap, Brain, GraduationCap, Menu, X, House, Download } from 'lucide-react';
import { Tab } from './types';
import StudyHub from './components/StudyHub';
import NeuronLab from './components/NeuronLab';
import ActionPotentialLab from './components/ActionPotentialLab';
import BrainAtlas from './components/BrainAtlas';
import AITutor from './components/AITutor';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<AtlasRoute>(atlasDefaultRoute);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const routeById = useMemo(
    () => Object.fromEntries(atlasRouteRegistry.map(route => [route.route, route])),
    [],
  );

  const activePage = routeById[activeRoute] ?? routeById[atlasDefaultRoute];

  const renderNavButton = (
    route: AtlasRoute,
    label: string,
    Icon: React.ComponentType<{ size?: number | string }>,
  ) => (
    <button
      key={`${route}-${label}`}
      onClick={() => {
        setActiveRoute(route);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
        activeRoute === route
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">NeuroMind</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">ATLAS V2 + NEURONLAB</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {atlasRouteRegistry.map(({ route, label, icon }) => renderNavButton(route, label, icon))}
          </nav>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg absolute w-full left-0">
            {atlasRouteRegistry.map(({ route, mobileLabel, icon }) => renderNavButton(route, mobileLabel, icon))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage?.render(setActiveRoute)}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} ANHB2217 Study Tool. Atlas-integrated.</p>
          <a
            href={`${import.meta.env.BASE_URL}workbooks/lab5-spinal-cord-workbook.html`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Open the Lab 5 spinal cord workbook
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
