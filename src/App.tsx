/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Menu, X, Search, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Cortex from './components/Cortex';
import Spinal from './components/Spinal';
import Cranial from './components/Cranial';
import Senses from './components/Senses';
import Brainstem from './components/Brainstem';
import Trainer from './components/Trainer';
import NeuronLab from './components/NeuronLab';
import Subcortical from './components/Subcortical';
import AITutor from './components/AITutor';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: '🏠' },
    { id: 'cortex', name: 'Cortex, Meninges & CSF', icon: '🧠' },
    { id: 'subcortical', name: 'Subcortical & Internal', icon: '🧬' },
    { id: 'spinal', name: 'Spinal Cord Pathways', icon: '🦴' },
    { id: 'cranial', name: 'Cranial Nerves', icon: '⚡' },
    { id: 'brainstem', name: 'Brainstem & Localisation', icon: '🧭' },
    { id: 'senses', name: 'Special Senses', icon: '👁️' },
    { id: 'trainer', name: 'Labelling Trainer', icon: '🎯' },
    { id: 'neuron', name: 'Neuron Lab', icon: '🧠✨' },
  ];

  const searchTerms = [
    { term: 'Dura Mater', tab: 'cortex' },
    { term: 'Arachnoid', tab: 'cortex' },
    { term: 'Pia Mater', tab: 'cortex' },
    { term: 'CSF Flow', tab: 'cortex' },
    { term: 'Brodmann', tab: 'cortex' },
    { term: 'Basal Ganglia', tab: 'subcortical' },
    { term: 'Internal Capsule', tab: 'subcortical' },
    { term: 'Cerebellum', tab: 'subcortical' },
    { term: 'Hippocampus', tab: 'subcortical' },
    { term: 'Direct Pathway', tab: 'subcortical' },
    { term: 'DCML', tab: 'spinal' },
    { term: 'Spinothalamic', tab: 'spinal' },
    { term: 'Corticospinal', tab: 'spinal' },
    { term: 'Olfactory', tab: 'cranial' },
    { term: 'Optic', tab: 'cranial' },
    { term: 'Vagus', tab: 'cranial' },
    { term: 'Wallenberg', tab: 'brainstem' },
    { term: 'Weber', tab: 'brainstem' },
    { term: 'Vision', tab: 'senses' },
    { term: 'Audition', tab: 'senses' },
    { term: 'Action Potential', tab: 'neuron' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredSearch = searchTerms.filter(t => 
    t.term.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-100 overflow-hidden relative font-sans selection:bg-violet-500/30">
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center gap-4">
                <Search className="text-zinc-500" />
                <input 
                  autoFocus
                  placeholder="Search atlas (e.g. Vagus)..."
                  className="bg-transparent border-none text-xl text-zinc-100 focus:outline-none flex-1"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded border border-white/10 uppercase tracking-tighter">
                  ESC
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                {filteredSearch.length > 0 ? filteredSearch.map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => { setActiveTab(item.tab); setIsSearchOpen(false); setSearchQuery(''); }}
                    className="w-full text-left p-4 hover:bg-white/5 rounded-2xl flex items-center justify-between group transition-colors"
                  >
                    <span className="text-zinc-200 font-medium group-hover:text-violet-300 transition-colors">{item.term}</span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 bg-black/40 px-2 py-1 rounded-md border border-white/5">{item.tab}</span>
                  </button>
                )) : (
                  <div className="p-8 text-center text-zinc-500">No matching neuro-structures found.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 z-30 relative bg-zinc-950/80 backdrop-blur-md shrink-0">
        <h1 className="text-lg font-bold text-zinc-50 leading-tight">ANHB2217 <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent block text-xs font-bold">Neurobiology Atlas</span></h1>
        <div className="flex items-center gap-2">
           <button onClick={() => setIsSearchOpen(true)} className="p-2 glass-button rounded-lg border-none"><Search size={20} /></button>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 glass-button rounded-lg z-50 relative border-none">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Dynamic Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`w-64 glass-panel border-r border-white/5 flex flex-col h-full z-50 shrink-0 shadow-2xl relative overflow-hidden transition-transform duration-300 md:relative fixed inset-y-0 left-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
        <div className="p-6 border-b border-white/5 relative z-10 hidden md:block">
          <h1 className="text-xl font-bold text-zinc-50 leading-tight">ANHB2217 <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent block text-sm font-bold mt-1">Neurobiology Atlas</span></h1>
        </div>

        {/* Desktop Search Button */}
        <div className="px-4 py-3 hidden md:block relative z-10">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-black/40 hover:bg-black/60 border border-white/5 rounded-xl px-4 py-2.5 text-zinc-500 text-sm flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <Search size={16} className="group-hover:text-zinc-300 transition-colors" />
              <span className="group-hover:text-zinc-300 transition-colors">Search...</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              <Command size={10} />K
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-1 px-3 relative z-10 custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 relative group flex w-full items-center ${
                activeTab === item.id ? 'text-white font-semibold shadow-lg' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-violet-600/30 border border-violet-500/50 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="mr-3 text-lg z-10 group-hover:scale-110 transition-transform">{item.icon}</span> 
              <span className="z-10">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 z-10 relative custom-scrollbar section-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'cortex' && <Cortex />}
            { activeTab === 'subcortical' && <Subcortical /> }
            { activeTab === 'spinal' && <Spinal /> }
            { activeTab === 'cranial' && <Cranial /> }
            { activeTab === 'brainstem' && <Brainstem /> }
            { activeTab === 'senses' && <Senses /> }
            { activeTab === 'trainer' && <Trainer /> }
            { activeTab === 'neuron' && <NeuronLab /> }
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating AI Tutor Widget */}
      <AITutor />
    </div>
  );
}
