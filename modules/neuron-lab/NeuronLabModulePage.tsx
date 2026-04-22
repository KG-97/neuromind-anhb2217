import React from 'react';
import NeuronModel from '../../components/NeuronModel';

export const NeuronLabModulePage: React.FC = () => {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Atlas Module: <span className="font-semibold">NeuronLab</span>
      </div>
      <NeuronModel />
    </section>
  );
};
