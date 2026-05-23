export type Day5Card = {
  id: string;
  topic: string;
  prompt: string;
  answer: string;
  extra: string;
  tags: string[];
};

export type Day5Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type CompareTrap = {
  title: string;
  left: string;
  right: string;
  trap: string;
};

export const day5SpinalCards: Day5Card[] = [];
export const day5SpinalQuestions: Day5Question[] = [];
export const day5CompareTraps: CompareTrap[] = [];
export const day5HighYield = [];
export const day5Pitfalls = [];
