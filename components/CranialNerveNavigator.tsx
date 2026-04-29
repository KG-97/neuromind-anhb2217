import React, { useState } from 'react';
import { Brain, Search, MapPin, Activity, AlertCircle } from 'lucide-react';
import { CranialNerve } from '../types';

const cranialNerves: CranialNerve[] = [
  {
    number: 1,
    name: 'Olfactory',
    type: 'Sensory',
    foramen: 'Cribriform plate',
    function: 'Olfaction (smell)',
    clinical: 'Anosmia (loss of smell), often first sign in frontal lobe tumors or head trauma'
  },
  {
    number: 2,
    name: 'Optic',
    type: 'Sensory',
    foramen: 'Optic canal',
    function: 'Vision',
    clinical: 'Visual field defects, bitemporal hemianopia (pituitary tumors), monocular blindness'
  },
  {
    number: 3,
    name: 'Oculomotor',
    type: 'Motor',
    foramen: 'Superior orbital fissure',
    function: 'Eye movement (superior/inferior/medial rectus, inferior oblique), pupil constriction, eyelid elevation',
    clinical: 'Ptosis, diplopia, mydriasis, loss of accommodation (uncal herniation, aneurysm)'
  },
  {
    number: 4,
    name: 'Trochlear',
    type: 'Motor',
    foramen: 'Superior orbital fissure',
    function: 'Eye movement (superior oblique - down and out)',
    clinical: 'Diplopia on downward gaze, head tilt to compensate (longest intracranial course, vulnerable to trauma)'
  },
  {
    number: 5,
    name: 'Trigeminal',
    type: 'Both',
    foramen: 'V1: Superior orbital fissure, V2: Foramen rotundum, V3: Foramen ovale',
    function: 'Facial sensation (ophthalmic, maxillary, mandibular divisions), mastication (V3 motor)',
    clinical: 'Trigeminal neuralgia (vascular compression), loss of facial sensation, jaw deviation'
  },
  {
    number: 6,
    name: 'Abducens',
    type: 'Motor',
    foramen: 'Superior orbital fissure',
    function: 'Lateral eye movement (lateral rectus)',
    clinical: 'Diplopia, esotropia (increased ICP, cavernous sinus pathology)'
  },
  {
    number: 7,
    name: 'Facial',
    type: 'Both',
    foramen: 'Internal acoustic meatus',
    function: 'Facial expression, taste (anterior 2/3 tongue), lacrimation, salivation (submandibular/sublingual)',
    clinical: 'Bell\'s palsy (facial paralysis), loss of taste, hyperacusis, crocodile tears'
  },
  {
    number: 8,
    name: 'Vestibulocochlear',
    type: 'Sensory',
    foramen: 'Internal acoustic meatus',
    function: 'Hearing (cochlear), balance/vestibular function',
    clinical: 'Sensorineural deafness, vertigo, tinnitus (acoustic neuroma, Meniere\'s disease)'
  },
  {
    number: 9,
    name: 'Glossopharyngeal',
    type: 'Both',
    foramen: 'Jugular foramen',
    function: 'Taste (posterior 1/3 tongue), swallowing, salivation (parotid), carotid body chemoreceptors',
    clinical: 'Glossopharyngeal neuralgia, dysphagia, loss of gag reflex, syncope (carotid sinus hypersensitivity)'
  },
  {
    number: 10,
    name: 'Vagus',
    type: 'Both',
    foramen: 'Jugular foramen',
    function: 'Autonomic (parasympathetic), speech, swallowing, cardiac/vagal tone',
    clinical: 'Hoarseness, dysphagia, tachycardia/bradycardia, Horner\'s syndrome variant'
  },
  {
    number: 11,
    name: 'Accessory',
    type: 'Motor',
    foramen: 'Jugular foramen (cranial), foramen magnum (spinal)',
    function: 'Head turning (sternocleidomastoid), shoulder shrug (trapezius)',
    clinical: 'Weakness in sternocleidomastoid/trapezius, shoulder drop, difficulty turning head'
  },
  {
    number: 12,
    name: 'Hypoglossal',
    type: 'Motor',
    foramen: 'Hypoglossal canal',
    function: 'Tongue movement (extrinsic muscles)',
    clinical: 'Dysarthria, tongue deviation toward affected side, atrophy, fasciculations'
  }
];

const CranialNerveNavigator: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Motor' | 'Sensory' | 'Both'>('All');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCard = (number: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(number)) {
      newExpanded.delete(number);
    } else {
      newExpanded.add(number);
    }
    setExpandedCards(newExpanded);
  };

  const filteredNerves = cranialNerves.filter(nerve => {
    const matchesSearch = nerve.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nerve.function.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || nerve.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Motor': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Sensory': return 'bg-green-50 text-green-600 border-green-200';
      case 'Both': return 'bg-purple-50 text-purple-600 border-purple-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="text-purple-600" /> Cranial Nerve Navigator
          </h2>
          <p className="text-slate-500 text-sm">Review all 12 cranial nerves with clinical correlations.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search nerves or functions..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {(['All', 'Motor', 'Sensory', 'Both'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === type
                ? 'bg-purple-600 text-white'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scroll pb-4">
        {filteredNerves.map((nerve) => (
          <div
            key={nerve.number}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow group cursor-pointer"
            onClick={() => toggleCard(nerve.number)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                {nerve.number}. {nerve.name}
              </h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getTypeColor(nerve.type)}`}>
                {nerve.type}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="text-slate-400 shrink-0 mt-1" size={16} />
                <p className="text-sm text-slate-600"><span className="font-semibold">Foramen:</span> {nerve.foramen}</p>
              </div>
              <div className="flex gap-3">
                <Activity className="text-slate-400 shrink-0 mt-1" size={16} />
                <p className="text-sm text-slate-600"><span className="font-semibold">Function:</span> {nerve.function}</p>
              </div>
              {expandedCards.has(nerve.number) && (
                <div className="flex gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle className="text-red-500 shrink-0 mt-1" size={16} />
                  <p className="text-sm text-slate-700"><span className="font-semibold text-red-700">Clinical:</span> {nerve.clinical}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CranialNerveNavigator;