import { Activity, Brain, GraduationCap, House, Zap } from 'lucide-react';
import React from 'react';
import StudyHub from '../components/StudyHub';
import ActionPotentialLab from '../components/ActionPotentialLab';
import BrainAtlas from '../components/BrainAtlas';
import AITutor from '../components/AITutor';
import { AtlasRoute } from '../types';
import { NeuronLabModulePage } from '../modules/neuron-lab';

export type AtlasRouteConfig = {
  route: AtlasRoute;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ size?: number | string }>;
  render: (setRoute: (route: AtlasRoute) => void) => React.ReactNode;
};

export const atlasRouteRegistry: AtlasRouteConfig[] = [
  {
    route: AtlasRoute.HOME,
    label: 'Dashboard',
    mobileLabel: 'Dashboard',
    icon: House,
    render: setRoute => <StudyHub onNavigate={setRoute} />,
  },
  {
    route: AtlasRoute.NEURON_LAB,
    label: 'Neuron Lab',
    mobileLabel: 'Neuron Lab',
    icon: Activity,
    render: () => <NeuronLabModulePage />,
  },
  {
    route: AtlasRoute.ELECTRO,
    label: 'Electrophysiology',
    mobileLabel: 'Electrophysiology',
    icon: Zap,
    render: () => <ActionPotentialLab />,
  },
  {
    route: AtlasRoute.ANATOMY,
    label: 'Anatomy',
    mobileLabel: 'Neuroanatomy',
    icon: Brain,
    render: () => <BrainAtlas />,
  },
  {
    route: AtlasRoute.TUTOR,
    label: 'Study Vault',
    mobileLabel: 'Study Vault',
    icon: GraduationCap,
    render: () => <AITutor />,
  },
];

export const atlasDefaultRoute = AtlasRoute.HOME;
