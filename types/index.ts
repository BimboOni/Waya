import type { Node, Edge } from 'reactflow';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  interests: string[];
  preferredSubject?: string;
  lastLocalDate?: string;
  xp: number;
  level: number;
  streak: number;
  lastActive?: string;
  createdAt: string;
}

export interface MockSession {
  id: string;
  userId: string;
  topic: string;
  subject: string;
  aiResponse: string;
  synthesisQuestion?: string;
  userAnswer?: string;
  xpEarned: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface MockBadge {
  id: string;
  userId: string;
  badgeType: string;
  imageUrl: string;
  earnedAt: string;
}

export interface MockKnowledgeNode {
  id: string;
  userId: string;
  sessionId: string;
  topic: string;
  subject: string;
  positionX: number;
  positionY: number;
  createdAt: string;
}

export interface MockKnowledgeEdge {
  id: string;
  userId: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface KnowledgeNodeData {
  topic: string;
  subject: string;
  color: string;
  containerColor: string;
  createdAt: string;
}

export type WayaNode = Node<KnowledgeNodeData>;
export type WayaEdge = Edge;

export interface SynthesisRequest {
  topic: string;
  interests: string[];
}

export interface SynthesisResponse {
  explanation: string;
  synthesisQuestion: string;
  sessionId: string;
  subject: string;
}

export interface ValidateAnswerRequest {
  sessionId: string;
  answer: string;
  localDate: string;
}

export interface ValidateAnswerResponse {
  valid: boolean;
  feedback: string;
  subject: string;
  xpAwarded: number;
  newXP: number;
  newLevel: number;
  didLevelUp: boolean;
  newStreak: number;
  isFirstSessionToday: boolean;
  milestone: null;
  newNode: MockKnowledgeNode | null;
  newEdge: MockKnowledgeEdge | null;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ToastType = 'default' | 'success' | 'error' | 'xp';
export type ThemeMode = 'light' | 'dark' | 'system';
