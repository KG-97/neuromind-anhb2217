import React, { useState } from 'react';
import { Brain, Search, MapPin, Activity, AlertCircle } from 'lucide-react';
import { BrainRegion } from '../types';

const regions: BrainRegion[] = [
  {
    id: 'frontal',
    name: 'Frontal Lobe',
    location: 'Anterior Cortex',
    function: 'Executive function, motor control (primary motor cortex), Broca\'s area (speech production), personality, planning.',
    clinical: 'Damage can lead to personality changes (Phineas Gage), Broca\'s aphasia, or hemiplegia.'
  },
  {
    id: 'parietal',
    name: 'Parietal Lobe',
    location: 'Superior/Posterior Cortex',
    function: 'Somatosensory processing (touch, pain, temp), spatial awareness, proprioception.',
    clinical: 'Hemispatial neglect (ignoring one side of space), agraphia, acalculia (Gerstmann syndrome).'
  },
  {
    id: 'temporal',
    name: 'Temporal Lobe',
    location: 'Lateral Cortex',
    function: 'Auditory processing, memory (Hippocampus), Wernicke\'s area (language comprehension), object recognition.',
    clinical: 'Wernicke\'s aphasia (word salad), anterograde amnesia, prosopagnosia (face blindness).'
  },
  {
    id: 'occipital',
    name: 'Occipital Lobe',
    location: 'Posterior Cortex',
    function: 'Visual processing (Primary visual cortex V1).',
    clinical: 'Cortical blindness, Anton syndrome (denial of blindness).'
  },
  {
    id: 'cerebellum',
    name: 'Cerebellum',
    location: 'Posterior Fossa',
    function: 'Coordination, balance, motor learning, fine-tuning movement.',
    clinical: 'Ataxia, intention tremor, dysdiadochokinesia.'
  },
  {
    id: 'basalganglia',
    name: 'Basal Ganglia',
    location: 'Deep Cerebral Hemispheres',
    function: 'Initiation and regulation of movement, habit learning.',
    clinical: 'Parkinson\'s Disease (hypokinetic), Huntington\'s Disease (hyperkinetic).'
  },
  {
    id: 'thalamus',
    name: 'Thalamus',
    location: 'Diencephalon',
    function: 'Sensory relay station (except smell), regulation of consciousness.',
    clinical: 'Thalamic pain syndrome, coma.'
  },
  {
    id: 'brainstem',
    name: 'Brainstem',
    location: 'Connects Cerebrum to Spinal Cord',
    function: 'Vital functions (breathing, heart rate), cranial nerve nuclei, ascending/descending tracts.',
    clinical: 'Locked-in syndrome, respiratory failure, cranial nerve palsies.'
  }
];

const BrainAtlas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRegions = regions.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.function.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="text-purple-600" /> Neuroanatomy Atlas
          </h2>
          <p className="text-slate-500 text-sm">Review structure, function, and clinical correlates.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search regions or functions..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scroll pb-4">
        {filteredRegions.map((region) => (
          <div key={region.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-purple-700 transition-colors">{region.name}</h3>
              <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2 py-1 rounded-full">{region.id.toUpperCase()}</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="text-slate-400 shrink-0 mt-1" size={16} />
                <p className="text-sm text-slate-600"><span className="font-semibold">Location:</span> {region.location}</p>
              </div>
              <div className="flex gap-3">
                <Activity className="text-slate-400 shrink-0 mt-1" size={16} />
                <p className="text-sm text-slate-600"><span className="font-semibold">Function:</span> {region.function}</p>
              </div>
              <div className="flex gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle className="text-red-500 shrink-0 mt-1" size={16} />
                <p className="text-sm text-slate-700"><span className="font-semibold text-red-700">Clinical:</span> {region.clinical}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrainAtlas;
