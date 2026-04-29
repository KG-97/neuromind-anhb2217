import React from 'react';
import NeuronModel from './NeuronModel';
import ActionPotentialLab from './ActionPotentialLab';

/**
 * Combined study module for neurons and basic electrophysiology.
 *
 * This component stitches together the interactive neuron model and the
 * action potential simulation into a single flow. Students can first
 * explore the anatomy of a typical neuron and then immediately dive
 * into the dynamics of action potential generation. Keeping both
 * experiences on one page makes it obvious that structure dictates
 * function: the axon hillock threshold leads directly into the spike
 * simulation, and the dendrites feed into the graded potentials that
 * trigger the lab.
 */
export default function NeuronLab() {
  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <section>
        <h2 className="text-3xl font-bold text-zinc-50 mb-4">Lab 5: Neuron Workbook</h2>
        <p className="text-zinc-400 mb-8">
          This combined module walks you through the anatomy of a neuron and the
          basics of electrophysiology. Start by clicking on the parts of the neuron
          diagram to learn about their roles, then stimulate an action potential to
          watch how voltage changes over time.
        </p>
        <NeuronModel />
      </section>
      <section>
        <h3 className="text-2xl font-bold text-zinc-50 mb-4">Electrophysiology Simulator</h3>
        <p className="text-zinc-400 mb-8">
          After you have familiarised yourself with the neuron structures, use this
          interactive lab to trigger and analyse an action potential. Pay close
          attention to the sequence of depolarisation, repolarisation and
          hyperpolarisation events.
        </p>
        <ActionPotentialLab />
      </section>
    </div>
  );
}