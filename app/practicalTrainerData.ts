export type PracticalQuestion = {
  prompt: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export type PracticalStation = {
  id: string;
  module: string;
  title: string;
  source: string;
  prompt: string;
  targets: string[];
  notes: string[];
  rapid: PracticalQuestion[];
};

export type PracticalPathway = {
  name: string;
  modality: string;
  chain: string;
  cross: string;
  logic: string;
  steps: string[];
  quiz: PracticalQuestion[];
};

export type PracticalCranialNerve = {
  number: string;
  name: string;
  type: string;
  function: string;
  nucleiOrPath: string;
  anchor: string;
};

export const practicalStations: PracticalStation[] = [
  {
    id: 'medial-brain',
    module: 'Midsagittal brain & brainstem',
    title: 'Medial surface of the brain',
    source: 'Lab 3 page 21',
    prompt: 'Identify the major midsagittal structures and explain their spatial relationships.',
    targets: ['Cingulate gyrus', 'Corpus callosum', 'Septum pellucidum', 'Fornix', 'Anterior commissure', 'Thalamus', 'Interthalamic adhesion', 'Hypothalamus', 'Pituitary gland expected location', 'Midbrain', 'Pons', 'Medulla', 'Mammillary body', 'Pineal gland', 'Superior colliculus', 'Inferior colliculus', 'Cerebellum'],
    notes: ['Pituitary gland is often absent from cadaveric specimens because it remains in the sella turcica or is avulsed during removal.', 'Septum pellucidum is the thin membrane between corpus callosum and fornix.'],
    rapid: [
      { prompt: 'Which thin membrane lies between the corpus callosum and the fornix?', options: ['Cingulate gyrus', 'Septum pellucidum', 'Interthalamic adhesion', 'Pineal gland'], answer: 'Septum pellucidum', explanation: 'It separates the lateral ventricles and sits between corpus callosum and fornix.' },
      { prompt: 'The pituitary gland is commonly missing from a cadaveric midsagittal specimen because it usually...', options: ['lies inside the third ventricle', 'remains in the sella turcica or is avulsed during removal', 'degenerates after fixation', 'is part of the cerebellum'], answer: 'remains in the sella turcica or is avulsed during removal', explanation: 'That is the practical reason it is commonly absent.' },
      { prompt: 'Which paired bumps on the dorsal midbrain should you identify?', options: ['Mammillary bodies', 'Superior and inferior colliculi', 'Olives', 'Gracile tubercles'], answer: 'Superior and inferior colliculi', explanation: 'They are classic dorsal midbrain landmarks.' },
    ],
  },
  {
    id: 'brainstem-views',
    module: 'Midsagittal brain & brainstem',
    title: 'Brainstem: dorsal vs ventral external features',
    source: 'Lab 3 page 24',
    prompt: 'Orient the brainstem by dorsal and ventral landmarks before naming structures.',
    targets: ['Crus cerebri', 'Mammillary body', 'Pineal gland', 'Superior colliculus', 'Inferior colliculus', 'Superior cerebellar peduncle', 'Middle cerebellar peduncle', 'Inferior cerebellar peduncle', 'Floor of the fourth ventricle', 'Lateral recess of fourth ventricle', 'Gracile tubercle', 'Cuneate tubercle', 'Gracile fasciculus', 'Cuneate fasciculus', 'Olive', 'Pyramid', 'Pyramidal decussation'],
    notes: ['Ventral view shows broad pons, crus cerebri, pyramids, olives, and pyramidal decussation.', 'Dorsal view shows colliculi, floor of the fourth ventricle, gracile/cuneate tubercles, and fasciculi.'],
    rapid: [
      { prompt: 'Which landmark strongly indicates ventral medulla?', options: ['Floor of fourth ventricle', 'Pyramid', 'Superior colliculus', 'Cuneate fasciculus'], answer: 'Pyramid', explanation: 'Pyramids and olives are ventral medullary hallmarks.' },
      { prompt: 'Which feature helps classify an image as dorsal rather than ventral?', options: ['Crus cerebri', 'Floor of the fourth ventricle', 'Pyramidal decussation', 'Olive'], answer: 'Floor of the fourth ventricle', explanation: 'The fourth ventricle floor is a dorsal surface clue.' },
      { prompt: 'Gracile and cuneate tubercles belong to which brainstem region?', options: ['Midbrain', 'Pons', 'Medulla', 'Hypothalamus'], answer: 'Medulla', explanation: 'They are dorsal medullary landmarks.' },
    ],
  },
  {
    id: 'brainstem-cross-sections',
    module: 'Midsagittal brain & brainstem',
    title: 'Brainstem cross-sections',
    source: 'Lab 3 page 26',
    prompt: 'Classify sections as midbrain, pons, open medulla, or closed medulla using landmark logic.',
    targets: ['Floor of 4th ventricle', 'Central canal', 'Cerebral aqueduct', 'Colliculus', 'Pyramid', 'Olive', 'Ventral median fissure', 'Interpeduncular fossa', 'Cerebral peduncle', 'Cerebellar peduncle cut', 'Corticospinal fibres'],
    notes: ['Midbrain has cerebral aqueduct, colliculus, and cerebral peduncle.', 'Pons has floor of fourth ventricle, cerebellar peduncles, pontocerebellar fibres, and pontine nuclei.', 'Open medulla has fourth ventricle; closed medulla has central canal.'],
    rapid: [
      { prompt: 'If the central canal is present, which level are you probably looking at?', options: ['Midbrain', 'Pons', 'Rostral/open medulla', 'Caudal/closed medulla'], answer: 'Caudal/closed medulla', explanation: 'Closed medulla means the fourth ventricle is gone and the central canal remains.' },
      { prompt: 'Cerebral aqueduct plus cerebral peduncle points to which level?', options: ['Midbrain', 'Pons', 'Rostral/open medulla', 'Sacral cord'], answer: 'Midbrain', explanation: 'That combination is the fast midbrain giveaway.' },
      { prompt: 'An olive and floor of the fourth ventricle together suggest which level?', options: ['Rostral/open medulla', 'Caudal/closed medulla', 'Thoracic cord', 'Cortex'], answer: 'Rostral/open medulla', explanation: 'Open medulla keeps the fourth ventricle visible.' },
    ],
  },
  {
    id: 'spinal-meninges',
    module: 'Spinal cord',
    title: 'Transverse view: vertebrae, meninges, roots and rami',
    source: 'Lab 5 page 8',
    prompt: 'Identify coverings, spaces, roots, ganglion, spinal nerve, and rami.',
    targets: ['Vertebral body', 'Spinous process', 'Transverse process', 'Dural sheath dura mater', 'Arachnoid mater', 'Pia mater', 'Denticulate ligament', 'Epidural space', 'Subarachnoid space', 'Dorsal root', 'Ventral root', 'Dorsal root ganglion', 'Spinal nerve', 'Dorsal ramus', 'Ventral ramus'],
    notes: ['Spinal segment is the cord region giving rise to one pair of spinal nerves.', 'Vertebral segment is the bony vertebral level; adult cord and vertebral levels do not align one-to-one.'],
    rapid: [
      { prompt: 'Cell bodies of primary sensory neurons sit in the...', options: ['Ventral horn', 'Dorsal root ganglion', 'Lateral horn', 'Denticulate ligament'], answer: 'Dorsal root ganglion', explanation: 'That is classic spinal nerve anatomy.' },
      { prompt: 'Which space contains CSF around the cord?', options: ['Epidural space', 'Subdural space', 'Subarachnoid space', 'Dural sheath'], answer: 'Subarachnoid space', explanation: 'The subarachnoid space is CSF-filled.' },
      { prompt: 'After dorsal and ventral roots join, the result is a...', options: ['Dorsal ramus', 'Ventral ramus', 'Mixed spinal nerve', 'Sympathetic chain'], answer: 'Mixed spinal nerve', explanation: 'It carries both sensory and motor fibres.' },
    ],
  },
  {
    id: 'spinal-dorsal-view',
    module: 'Spinal cord',
    title: 'Dorsal view of the cord in the vertebral canal',
    source: 'Lab 5 page 11',
    prompt: 'Identify dorsal roots, ganglia, dural sheath, conus, cauda equina, and filum terminale.',
    targets: ['Dorsal nerve root', 'Dorsal root ganglion', 'Intervertebral foramen', 'Dural sheath', 'Denticulate ligament', 'Conus medullaris', 'Cauda equina', 'Filum terminale'],
    notes: ['Cauda equina is made of lumbar and sacral nerve roots descending below the conus medullaris.', 'Filum terminale is a pia-derived fibrous extension anchoring the cord inferiorly.'],
    rapid: [
      { prompt: 'What is the cauda equina mostly made of?', options: ['Dorsal columns', 'Lumbar and sacral spinal nerve roots', 'Sympathetic chain ganglia', 'Cerebellar peduncles'], answer: 'Lumbar and sacral spinal nerve roots', explanation: 'They descend because the vertebral column outgrows the cord.' },
      { prompt: 'The conus medullaris in adults usually ends around...', options: ['T6', 'T12', 'L1/L2', 'S2'], answer: 'L1/L2', explanation: 'That is the standard adult termination level.' },
      { prompt: 'The filum terminale is best described as a...', options: ['Ventral motor root', 'Pia-derived fibrous anchor', 'Venous sinus', 'Dural fold'], answer: 'Pia-derived fibrous anchor', explanation: 'It anchors the cord inferiorly.' },
    ],
  },
  {
    id: 'spinal-ventral-vs-dorsal',
    module: 'Spinal cord',
    title: 'Unidentified views of the spinal cord',
    source: 'Lab 5 page 15',
    prompt: 'Use roots, sulci, fissures, arteries, and ganglia to determine orientation.',
    targets: ['Ventral nerve root', 'Dorsal nerve root', 'Dorsal root ganglion', 'Ventral median fissure', 'Dorsolateral sulcus', 'Ventral spinal artery', 'Dorsal spinal artery', 'Dural sheath', 'Denticulate ligament'],
    notes: ['Ventral rootlets emerge more broadly from the ventrolateral sulcus.', 'Dorsal rootlets enter in a more orderly line along the dorsolateral sulcus and associate with the dorsal root ganglion.'],
    rapid: [
      { prompt: 'Which groove on the cord ventral surface is the easiest orientation clue?', options: ['Dorsal median sulcus', 'Ventral median fissure', 'Central canal', 'Lateral recess'], answer: 'Ventral median fissure', explanation: 'That deep midline groove is the fast ventral clue.' },
      { prompt: 'A dorsal root ganglion belongs with which functional stream?', options: ['Motor only', 'Sensory only', 'Parasympathetic only', 'Sympathetic chain only'], answer: 'Sensory only', explanation: 'It houses primary sensory neuron cell bodies.' },
      { prompt: 'Rootlets entering along the dorsolateral sulcus are...', options: ['Ventral motor rootlets', 'Dorsal sensory rootlets', 'Pontocerebellar fibres', 'Corticospinal fibres'], answer: 'Dorsal sensory rootlets', explanation: 'That is the dorsal entry zone.' },
    ],
  },
  {
    id: 'thoracic-cross-section',
    module: 'Spinal cord',
    title: 'Thoracic cord cross-section',
    source: 'Lab 5 page 18',
    prompt: 'Label columns, horns, roots, rami, and the thoracic lateral horn.',
    targets: ['Dorsal median sulcus', 'Dorsolateral sulcus', 'Ventral median fissure', 'Ventrolateral sulcus', 'Dorsal column', 'Lateral column', 'Ventral column', 'Dorsal horn', 'Lateral horn', 'Ventral horn', 'Central canal', 'Ventral white commissure', 'Grey commissure', 'Dorsal nerve root', 'Dorsal root ganglion', 'Ventral nerve root', 'Mixed spinal nerve', 'Dorsal ramus', 'Ventral ramus'],
    notes: ['Dorsal roots carry sensory input and have cell bodies in the dorsal root ganglia.', 'Ventral roots carry motor output from neurons in the ventral horn.', 'Lateral horn is characteristic at thoracic levels because of sympathetic preganglionic neurons.'],
    rapid: [
      { prompt: 'Which horn is the thoracic clue for sympathetic outflow?', options: ['Dorsal horn', 'Lateral horn', 'Ventral horn', 'Grey commissure'], answer: 'Lateral horn', explanation: 'Thoracic cord shows the lateral horn with sympathetic preganglionics.' },
      { prompt: 'Where are lower motor neuron cell bodies for spinal nerves found?', options: ['Dorsal root ganglion', 'Ventral horn', 'Dorsal horn', 'Posterior column'], answer: 'Ventral horn', explanation: 'Motor neurons live in the ventral horn.' },
      { prompt: 'Dorsal rami mainly innervate which body region?', options: ['Only the limbs', 'Dorsal back region', 'Thoracic viscera', 'The retina'], answer: 'Dorsal back region', explanation: 'Ventral rami handle ventral/lateral body wall and limbs.' },
    ],
  },
  {
    id: 'segment-comparison',
    module: 'Spinal cord',
    title: 'Cross-sections of spinal cord segments',
    source: 'Lab 5 page 23',
    prompt: 'Compare cervical, thoracic, lumbar, and sacral cord using horn shape and white/grey matter ratio.',
    targets: ['Cervical segment', 'Thoracic segment', 'Lumbar segment', 'Sacral segment', 'Dorsal horn', 'Lateral horn', 'Ventral horn', 'White matter vs grey matter ratio'],
    notes: ['White matter generally decreases as you move caudally.', 'Thoracic cord has a lateral horn.', 'Lumbar and sacral levels have proportionally more grey matter; cervical levels have the most white matter.'],
    rapid: [
      { prompt: 'Which segment has the most white matter relative to grey matter?', options: ['Cervical', 'Thoracic', 'Lumbar', 'Sacral'], answer: 'Cervical', explanation: 'Ascending tracts accumulate rostrally, so cervical levels carry the most white matter.' },
      { prompt: 'Which segment is most strongly associated with a clear lateral horn?', options: ['Cervical', 'Thoracic', 'Lumbar', 'Sacral'], answer: 'Thoracic', explanation: 'Thoracic levels house sympathetic preganglionic neurons.' },
      { prompt: 'Which region has the least white matter overall?', options: ['Cervical', 'Thoracic', 'Lumbar', 'Sacral'], answer: 'Sacral', explanation: 'By sacral cord, white matter is thinnest.' },
    ],
  },
];

export const practicalCranialNerves: PracticalCranialNerve[] = [
  { number: 'I', name: 'Olfactory', type: 'Special sensory', function: 'Smell', nucleiOrPath: 'Olfactory epithelium via olfactory bulb/tract', anchor: 'Not a brainstem nerve' },
  { number: 'II', name: 'Optic', type: 'Special sensory', function: 'Vision', nucleiOrPath: 'Retina to optic nerve to chiasm to tract', anchor: 'Forebrain attachment' },
  { number: 'III', name: 'Oculomotor', type: 'Motor + parasympathetic', function: 'Most extraocular movements, eyelid elevation, pupil constriction, accommodation', nucleiOrPath: 'Oculomotor + Edinger-Westphal nuclei', anchor: 'Midbrain' },
  { number: 'IV', name: 'Trochlear', type: 'Motor', function: 'Superior oblique', nucleiOrPath: 'Trochlear nucleus', anchor: 'Only cranial nerve to exit dorsally' },
  { number: 'V', name: 'Trigeminal', type: 'Mixed', function: 'Facial sensation + mastication', nucleiOrPath: 'Chief sensory, spinal trigeminal, mesencephalic, motor nuclei', anchor: 'V1/V2/V3 divisions' },
  { number: 'VI', name: 'Abducens', type: 'Motor', function: 'Lateral rectus', nucleiOrPath: 'Abducens nucleus', anchor: 'Pons' },
  { number: 'VII', name: 'Facial', type: 'Mixed + parasympathetic', function: 'Facial expression, taste anterior 2/3, lacrimal and salivary glands', nucleiOrPath: 'Facial motor, superior salivatory, solitary tract', anchor: 'Pons' },
  { number: 'VIII', name: 'Vestibulocochlear', type: 'Special sensory', function: 'Hearing and balance', nucleiOrPath: 'Cochlear and vestibular nuclei', anchor: 'Pontomedullary junction' },
  { number: 'IX', name: 'Glossopharyngeal', type: 'Mixed + parasympathetic', function: 'Taste posterior 1/3, stylopharyngeus, parotid, carotid sinus reflex', nucleiOrPath: 'Nucleus ambiguus, inferior salivatory, solitary tract, spinal trigeminal', anchor: 'Medulla' },
  { number: 'X', name: 'Vagus', type: 'Mixed + parasympathetic', function: 'Pharynx/larynx, thoracoabdominal viscera, taste from epiglottis', nucleiOrPath: 'Dorsal motor nucleus, nucleus ambiguus, solitary tract, spinal trigeminal', anchor: 'Medulla' },
  { number: 'XI', name: 'Accessory', type: 'Motor', function: 'SCM and trapezius', nucleiOrPath: 'Spinal accessory nucleus', anchor: 'Spinal root component' },
  { number: 'XII', name: 'Hypoglossal', type: 'Motor', function: 'Tongue muscles', nucleiOrPath: 'Hypoglossal nucleus', anchor: 'Medulla' },
];

export const practicalPathways: PracticalPathway[] = [
  {
    name: 'Dorsal column medial lemniscus DCML',
    modality: 'Fine touch, vibration, proprioception, two-point discrimination',
    chain: '3-neuron ascending pathway',
    cross: 'Caudal medulla via internal arcuate fibres',
    logic: 'Below decussation lesions cause ipsilateral loss; above decussation lesions cause contralateral loss.',
    steps: ['1st order neuron: dorsal root ganglion to fasciculus gracilis/cuneatus with ipsilateral ascent', 'Synapse in nucleus gracilis/cuneatus in caudal medulla', '2nd order neuron decussates as internal arcuate fibres and ascends as medial lemniscus', 'Synapse in VPL thalamus', '3rd order neuron projects to primary somatosensory cortex'],
    quiz: [
      { prompt: 'Where does DCML decussate?', options: ['Spinal cord anterior commissure', 'Caudal medulla internal arcuate fibres', 'Midbrain tegmentum', 'Corpus callosum'], answer: 'Caudal medulla internal arcuate fibres' },
      { prompt: 'A right spinal cord lesion below the DCML decussation causes loss of vibration on which side?', options: ['Left', 'Right', 'Bilateral', 'Neither'], answer: 'Right' },
    ],
  },
  {
    name: 'Spinothalamic / anterolateral tract',
    modality: 'Pain, temperature, crude touch, pressure',
    chain: '3-neuron ascending pathway',
    cross: 'Anterior white commissure about 1-2 levels above entry',
    logic: 'Contralateral loss begins about 1-2 levels below a lesion after fibres have crossed.',
    steps: ['1st order neuron: dorsal root ganglion to dorsal horn', '2nd order neuron crosses in anterior white commissure', 'Ascends contralaterally in anterolateral system', 'Synapse in thalamus mainly VPL', '3rd order neuron projects to somatosensory cortex'],
    quiz: [
      { prompt: 'Where do spinothalamic fibres cross?', options: ['Corpus callosum', 'Anterior white commissure in spinal cord', 'Caudal medulla', 'Internal capsule'], answer: 'Anterior white commissure in spinal cord' },
      { prompt: 'A left anterolateral tract lesion usually causes pain and temperature loss on the...', options: ['Left side below lesion', 'Right side below lesion', 'Left face only', 'Both sides equally'], answer: 'Right side below lesion' },
    ],
  },
  {
    name: 'Lateral corticospinal tract',
    modality: 'Voluntary movement',
    chain: '2-neuron descending pathway',
    cross: 'Pyramidal decussation in caudal medulla',
    logic: 'Above the decussation equals contralateral UMN weakness; below equals ipsilateral weakness below lesion.',
    steps: ['Upper motor neuron begins in primary motor cortex', 'Descends through internal capsule, cerebral peduncle, pons, medullary pyramid', 'Most fibres decussate in the pyramidal decussation', 'Descend in lateral corticospinal tract', 'Synapse on lower motor neurons in ventral horn'],
    quiz: [
      { prompt: 'Most corticospinal fibres cross at the...', options: ['Optic chiasm', 'Pyramidal decussation', 'Anterior white commissure', 'Superior colliculus'], answer: 'Pyramidal decussation' },
      { prompt: 'A lesion above the corticospinal decussation produces UMN signs on the...', options: ['Ipsilateral body', 'Contralateral body', 'Both equally', 'Tongue only'], answer: 'Contralateral body' },
    ],
  },
  {
    name: 'Pain withdrawal reflex',
    modality: 'Protective reflex',
    chain: 'Polysynaptic',
    cross: 'Not defined by a single classic decussation step',
    logic: 'Interneurons permit rapid flexor activation and reciprocal inhibition of extensors.',
    steps: ['Nociceptor afferent enters dorsal horn', 'Interneurons activate ipsilateral flexors', 'Interneurons inhibit ipsilateral extensors', 'Postural adjustments can recruit crossed-extensor circuitry on the opposite side'],
    quiz: [
      { prompt: 'Why is the pain withdrawal reflex polysynaptic?', options: ['It uses multiple interneurons between afferent and efferent limbs', 'It bypasses the spinal cord', 'It never uses motor neurons', 'It crosses only in the medulla'], answer: 'It uses multiple interneurons between afferent and efferent limbs' },
      { prompt: 'Which classic reflex is monosynaptic?', options: ['Withdrawal reflex', 'Patellar stretch reflex', 'Crossed extensor reflex', 'Pupillary light reflex'], answer: 'Patellar stretch reflex' },
    ],
  },
];

export const extraPracticalQuestions: PracticalQuestion[] = [
  { prompt: 'Motor cranial nerve nuclei are generally arranged where in the brainstem?', options: ['Posterolateral', 'Anteromedial', 'Inside the ventricles', 'Only in the cerebellum'], answer: 'Anteromedial', explanation: 'Course logic contrasts motor anteromedial with sensory posterolateral.' },
  { prompt: 'All cranial nerves except CN I and CN II attach to the...', options: ['Cerebral cortex', 'Brainstem', 'Basal ganglia', 'Spinal cord only'], answer: 'Brainstem', explanation: 'CN III-XII attach to the brainstem.' },
  { prompt: 'Which artery territory classically causes contralateral leg weakness when infarcted?', options: ['ACA', 'MCA', 'PCA', 'PICA'], answer: 'ACA', explanation: 'ACA supplies medial frontal/parietal cortex.' },
  { prompt: 'Dominant MCA stroke classically risks...', options: ['Pure leg weakness only', 'Aphasia with face/arm weakness', 'Contralateral hemianopia only', 'Loss of smell'], answer: 'Aphasia with face/arm weakness', explanation: 'That is the classic dominant MCA pattern.' },
  { prompt: 'PCA territory injury most classically causes...', options: ['Contralateral hemianopia', 'Global aphasia', 'Ipsilateral facial paralysis', 'Bilateral leg weakness'], answer: 'Contralateral hemianopia', explanation: 'Occipital cortex is the major target.' },
];

export const practicalQuestionBank: PracticalQuestion[] = [
  ...practicalStations.flatMap(station => station.rapid),
  ...practicalPathways.flatMap(pathway => pathway.quiz),
  ...extraPracticalQuestions,
];
