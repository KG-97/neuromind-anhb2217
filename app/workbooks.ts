export type Workbook = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
  badge: string;
  stats: string[];
  modules: string[];
  primary?: boolean;
};

const workbookPath = (filename: string) => `${import.meta.env.BASE_URL}workbooks/${filename}`;

export const workbookRegistry: Workbook[] = [
  {
    id: 'neuroanatomy-builder-v5',
    title: 'Neuroanatomy Practical Builder v5',
    shortTitle: 'Practical Builder v5',
    description: 'Main ANHB2217 practical study tool with stations, cranial nerves, pathways, progress tracking, and review questions.',
    href: workbookPath('neuroanatomy-builder-v5.html'),
    badge: 'Main practical tool',
    stats: ['8 stations', '12 cranial nerves', '5 pathways', '30 review questions'],
    modules: ['brainstem', 'cranial nerves', 'spinal cord', 'pathways'],
    primary: true,
  },
  {
    id: 'lab5-spinal-cord',
    title: 'Lab 5 Spinal Cord Workbook',
    shortTitle: 'Lab 5 Workbook',
    description: 'Focused spinal cord workbook for tract logic, lesion localisation, and practical revision.',
    href: workbookPath('lab5-spinal-cord-workbook.html'),
    badge: 'Focused workbook',
    stats: ['spinal cord', 'tract logic', 'lesion review'],
    modules: ['spinal cord', 'ascending pathways', 'descending pathways'],
  },
];

export const workbookHubHref = `${import.meta.env.BASE_URL}workbooks/`;
export const primaryWorkbook = workbookRegistry.find(workbook => workbook.primary) ?? workbookRegistry[0];
