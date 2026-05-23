import { useState } from 'react';

const pathways = {
  dcml: ['Receptor', 'DRG', 'Dorsal column', 'Nucleus gracilis/cuneatus', 'Medial lemniscus', 'VPL', 'S1'],
  spinothalamic: ['Nociceptor', 'DRG', 'Dorsal horn', 'Anterior commissure', 'Anterolateral tract', 'VPL', 'S1'],
  corticospinal: ['M1', 'Internal capsule', 'Cerebral peduncle', 'Pyramids', 'Decussation', 'Lateral CST', 'LMN'],
} as const;

export default function PathwayVisualizer() {
  const [active, setActive] = useState<keyof typeof pathways>('dcml');
  const nodes = pathways[active];
  return (
    <section className='glass-card rounded-2xl p-6 border border-white/10' aria-label='Interactive pathway visualizer'>
      <h3 className='text-2xl font-bold mb-3'>Interactive Pathway Visualizer</h3>
      <div className='flex gap-2 mb-4'>
        {Object.keys(pathways).map((k) => <button key={k} className='px-3 py-1 border rounded' onClick={() => setActive(k as keyof typeof pathways)}>{k}</button>)}
      </div>
      <svg viewBox='0 0 900 180' className='w-full h-48 bg-black/30 rounded-xl' role='img' aria-label={`${active} pathway diagram`}>
        {nodes.map((node, i) => {
          const x = 50 + i * 120;
          return <g key={node}>
            <rect x={x} y={70} width={100} height={40} rx={8} className='fill-violet-600/40 stroke-violet-300' />
            <text x={x + 50} y={95} textAnchor='middle' className='fill-white text-[10px]'>{node}</text>
            {i < nodes.length - 1 && <line x1={x + 100} y1={90} x2={x + 120} y2={90} className='stroke-emerald-300' markerEnd='url(#arrow)' />}
          </g>;
        })}
        <defs><marker id='arrow' markerWidth='6' markerHeight='6' refX='5' refY='3' orient='auto'><path d='M0,0 L0,6 L6,3 z' className='fill-emerald-300' /></marker></defs>
      </svg>
    </section>
  );
}
