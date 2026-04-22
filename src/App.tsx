/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Cortex from './components/Cortex';
import Spinal from './components/Spinal';
import Cranial from './components/Cranial';
import Senses from './components/Senses';
import Brainstem from './components/Brainstem';
import Trainer from './components/Trainer';
import NeuronLab from './components/NeuronLab';
import AITutor from './components/AITutor';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: '🏠' },
    { id: 'cortex', name: 'Cortex, Meninges & CSF', icon: '🧠' },
    { id: 'spinal', name: 'Spinal Cord Pathways', icon: '🦴' },
    { id: 'cranial', name: 'Cranial Nerves', icon: '⚡' },
    { id: 'brainstem', name: 'Brainstem & Localisation', icon: '🧭' },
    { id: 'senses', name: 'Special Senses', icon: '👁️' },
    { id: 'trainer', name: 'Labelling Trainer', icon: '🎯' },
    { id: 'neuron', name: 'Neuron Lab', icon: '🧠✨' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-100 overflow-hidden relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 z-30 relative bg-zinc-950/80 backdrop-blur-md shrink-0">
        <h1 className="text-lg font-bold text-zinc-50 leading-tight">ANHB2217 <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent block text-xs font-bold">Neurobiology Atlas</span></h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 glass-button rounded-lg z-50 relative border-none">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3 relative z-10 custom-scrollbar">
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
