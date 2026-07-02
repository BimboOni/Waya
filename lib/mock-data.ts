import type {
  MockSession,
  MockBadge,
  MockKnowledgeNode,
  MockKnowledgeEdge,
  MockUser,
} from '@/types';

// Realistic streaming mock — formatted for drop-in DeepSeek replacement
export const MOCK_AI_RESPONSE_PHOTOSYNTHESIS = `[EXPLANATION]
Imagine your favorite game has a solar-powered base. Every hour of sunlight fills up an energy bar, letting you craft more items. That's photosynthesis — plants are basically the most efficient solar factories on Earth.

Here's how it works: inside every leaf are tiny green power cells called chloroplasts. They contain a pigment called chlorophyll (that's what makes leaves green). When sunlight hits, chlorophyll absorbs the light energy and uses it to split water molecules apart — like breaking down a resource pack into its raw materials.

The hydrogen from that water gets combined with carbon dioxide pulled straight from the air (plants literally eat air!) to build glucose — a sugar that's basically the plant's fuel currency. The leftover oxygen? That gets released as a byproduct. So every breath you take is partly thanks to a plant's "exhaust."

The full equation looks like this:
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂

In gaming terms: CO₂ and water are your raw mats, sunlight is your energy source, glucose is the crafted item, and oxygen is the crafting byproduct you drop on the floor.

[SYNTHESIS_QUESTION]
You just learned that plants convert light energy into chemical energy stored as glucose. Now think about a completely different system — how does a solar panel charging a phone battery work? What are the surprising similarities and key differences between what the plant does and what the solar panel does? Explain it as if you're teaching a friend who only understands gaming analogies.`;

export const MOCK_SYNTHESIS_QUESTION =
  'You just learned that plants convert light energy into chemical energy stored as glucose. Now think about a completely different system — how does a solar panel charging a phone battery work? What are the surprising similarities and key differences between what the plant does and what the solar panel does? Explain it as if you\'re teaching a friend who only understands gaming analogies.';

export const MOCK_USER: MockUser = {
  id: 'mock-user-001',
  email: 'alex@example.com',
  name: 'Alex Rivera',
  interests: ['gaming', 'music', 'science'],
  xp: 350,
  level: 1,
  streak: 4,
  lastActive: new Date().toISOString(),
  createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
};

export const MOCK_SESSIONS: MockSession[] = [
  {
    id: 'session-001',
    userId: MOCK_USER.id,
    topic: 'Photosynthesis',
    subject: 'ScienceTech',
    aiResponse: MOCK_AI_RESPONSE_PHOTOSYNTHESIS,
    userAnswer:
      'In Minecraft, plants only grow if they have enough light blocks nearby — just like real plants need sunlight to make food through photosynthesis. The game mechanic is basically simulating chlorophyll absorbing light energy!',
    xpEarned: 50,
    completed: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'session-002',
    userId: MOCK_USER.id,
    topic: 'Newton\'s Laws of Motion',
    subject: 'ScienceTech',
    aiResponse: '',
    userAnswer:
      'When a character in a game jumps and lands on another player, the force pushes them both — that\'s Newton\'s third law! And a rocket in Kerbal Space Program needs thrust to overcome inertia, which is the first law.',
    xpEarned: 50,
    completed: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'session-003',
    userId: MOCK_USER.id,
    topic: 'The French Revolution',
    subject: 'HistoryCulture',
    aiResponse: '',
    userAnswer:
      'It\'s like when a game meta shifts completely — the old "overpowered" ruling class got nerfed so hard by the peasant uprising that the whole server wiped and restarted with new rules.',
    xpEarned: 50,
    completed: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'session-004',
    userId: MOCK_USER.id,
    topic: 'Musical Scales & Harmony',
    subject: 'CreativeArts',
    aiResponse: '',
    userAnswer:
      'Scales are like chord progressions in a game\'s soundtrack — the key signature sets the "mood" just like a minor scale feels darker than a major one. Boss fights always use dissonance!',
    xpEarned: 50,
    completed: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'session-005',
    userId: MOCK_USER.id,
    topic: 'Prime Numbers',
    subject: 'Mathematics',
    aiResponse: '',
    userAnswer:
      'Prime numbers are like unique item IDs in a game — they can\'t be divided by anything except themselves, making them perfect for generating truly unique seeds in procedural generation!',
    xpEarned: 50,
    completed: true,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'session-006',
    userId: MOCK_USER.id,
    topic: 'DNA Replication',
    subject: 'ScienceTech',
    aiResponse: '',
    userAnswer: '',
    xpEarned: 0,
    completed: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
];

export const MOCK_BADGES: MockBadge[] = [
  {
    id: 'badge-001',
    userId: MOCK_USER.id,
    badgeType: '3-Day Streak',
    imageUrl: '',
    earnedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'badge-002',
    userId: MOCK_USER.id,
    badgeType: 'First Synthesis',
    imageUrl: '',
    earnedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'badge-003',
    userId: MOCK_USER.id,
    badgeType: '5 Nodes Mapped',
    imageUrl: '',
    earnedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const MOCK_KNOWLEDGE_NODES: MockKnowledgeNode[] = [
  {
    id: 'node-001',
    userId: MOCK_USER.id,
    sessionId: 'session-001',
    topic: 'Photosynthesis',
    subject: 'ScienceTech',
    positionX: 80,
    positionY: 80,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'node-002',
    userId: MOCK_USER.id,
    sessionId: 'session-002',
    topic: "Newton's Laws",
    subject: 'ScienceTech',
    positionX: 300,
    positionY: 95,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'node-003',
    userId: MOCK_USER.id,
    sessionId: 'session-003',
    topic: 'French Revolution',
    subject: 'HistoryCulture',
    positionX: 520,
    positionY: 72,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'node-004',
    userId: MOCK_USER.id,
    sessionId: 'session-004',
    topic: 'Musical Scales',
    subject: 'CreativeArts',
    positionX: 740,
    positionY: 88,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'node-005',
    userId: MOCK_USER.id,
    sessionId: 'session-005',
    topic: 'Prime Numbers',
    subject: 'Mathematics',
    positionX: 960,
    positionY: 80,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'node-006',
    userId: MOCK_USER.id,
    sessionId: 'session-001',
    topic: 'Cellular Respiration',
    subject: 'ScienceTech',
    positionX: 80,
    positionY: 260,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export const MOCK_KNOWLEDGE_EDGES: MockKnowledgeEdge[] = [
  { id: 'edge-001', userId: MOCK_USER.id, sourceNodeId: 'node-001', targetNodeId: 'node-002' },
  { id: 'edge-002', userId: MOCK_USER.id, sourceNodeId: 'node-002', targetNodeId: 'node-003' },
  { id: 'edge-003', userId: MOCK_USER.id, sourceNodeId: 'node-003', targetNodeId: 'node-004' },
  { id: 'edge-004', userId: MOCK_USER.id, sourceNodeId: 'node-004', targetNodeId: 'node-005' },
  { id: 'edge-005', userId: MOCK_USER.id, sourceNodeId: 'node-006', targetNodeId: 'node-001' },
];
