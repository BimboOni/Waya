'use client';

import { create } from 'zustand';
import type { MockUser, MockSession, MockKnowledgeNode, MockKnowledgeEdge, MockBadge, ThemeMode } from '@/types';

interface WayaStore {
  user: MockUser | null;
  xp: number;
  level: number;
  streak: number;
  setUser: (user: MockUser | null) => void;
  syncGamification: (xp: number, level: number, streak: number) => void;

  currentSession: MockSession | null;
  setCurrentSession: (session: MockSession | null) => void;

  knowledgeNodes: MockKnowledgeNode[];
  knowledgeEdges: MockKnowledgeEdge[];
  setCanvasElements: (nodes: MockKnowledgeNode[], edges: MockKnowledgeEdge[]) => void;
  addSpatialNode: (node: MockKnowledgeNode) => void;
  addSpatialEdge: (edge: MockKnowledgeEdge) => void;

  badges: MockBadge[];
  hydrateBadges: (badges: MockBadge[]) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  showLevelUpModal: boolean;
  newLevelReached: number;
  triggerLevelUp: (level: number) => void;
  dismissLevelUp: () => void;

  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useWayaStore = create<WayaStore>()((set) => ({
  user: null,
  xp: 0,
  level: 1,
  streak: 0,
  setUser: (user) => set({ user, xp: user?.xp ?? 0, level: user?.level ?? 1, streak: user?.streak ?? 0 }),
  syncGamification: (xp, level, streak) => set({ xp, level, streak }),

  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  knowledgeNodes: [],
  knowledgeEdges: [],
  setCanvasElements: (nodes, edges) => set({ knowledgeNodes: nodes, knowledgeEdges: edges }),
  addSpatialNode: (node) => set((state) => ({ knowledgeNodes: [...state.knowledgeNodes, node] })),
  addSpatialEdge: (edge) => set((state) => ({ knowledgeEdges: [...state.knowledgeEdges, edge] })),

  badges: [],
  hydrateBadges: (badges) => set({ badges }),

  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  toastMessage: null,
  setToastMessage: (toastMessage) => set({ toastMessage }),
  showLevelUpModal: false,
  newLevelReached: 1,
  triggerLevelUp: (level) => set({ showLevelUpModal: true, newLevelReached: level }),
  dismissLevelUp: () => set({ showLevelUpModal: false }),

  theme: 'light',
  setTheme: (theme) => set({ theme }),
  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
}));
