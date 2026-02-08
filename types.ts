export enum Tab {
  NEURON = 'NEURON',
  ELECTRO = 'ELECTRO',
  ANATOMY = 'ANATOMY',
  TUTOR = 'TUTOR'
}

export interface BrainRegion {
  id: string;
  name: string;
  function: string;
  location: string;
  clinical: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
