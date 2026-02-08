import React, { useState } from 'react';
import { Activity, Zap, Brain, GraduationCap, Menu, X } from 'lucide-react';
import { Tab } from './types';
import NeuronModel from './components/NeuronModel';
import ActionPotentialLab from './components/ActionPotentialLab';
import BrainAtlas from './components/BrainAtlas';
import AITutor from './components/AITutor';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.NEURON);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.NEURON: return <NeuronModel />;
      case Tab.ELECTRO: return <ActionPotentialLab />;
      case Tab.ANATOMY: return <BrainAtlas />;
      case Tab.TUTOR: return <AITutor />;
      default: return <NeuronModel />;
    }
  };

  const NavItem = ({ tab, label, icon: Icon }: { tab: Tab; label: string; icon: any }) => (
    <button
      onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
        activeTab === tab 
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">NeuroMind</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">ANHB2217 COMPANION</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavItem tab={Tab.NEURON} label="Neuron" icon={Activity} />
            <NavItem tab={Tab.ELECTRO} label="Electrophysiology" icon={Zap} />
            <NavItem tab={Tab.ANATOMY} label="Anatomy" icon={Brain} />
            <NavItem tab={Tab.TUTOR} label="Study Vault" icon={GraduationCap} />
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg absolute w-full left-0">
            <NavItem tab={Tab.NEURON} label="Neuron Model" icon={Activity} />
            <NavItem tab={Tab.ELECTRO} label="Electrophysiology" icon={Zap} />
            <NavItem tab={Tab.ANATOMY} label="Neuroanatomy" icon={Brain} />
            <NavItem tab={Tab.TUTOR} label="Study Vault" icon={GraduationCap} />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} ANHB2217 Study Tool. Powered by React & Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
