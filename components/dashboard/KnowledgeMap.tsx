'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, Award, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import ReactFlow, { Handle, Position, useNodesState, useReactFlow, ReactFlowProvider, type Node, type Edge, type OnNodesChange, type OnEdgesChange } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import type { MockSession } from '@/types';

const SUBJECT_COLORS: Record<string, string> = {
  ScienceTech: '#07B6D5', Mathematics: '#895AF6', HistoryCulture: '#D97959', CreativeArts: '#EC4699',
};

const SUBJECT_LABELS: Record<string, string> = {
  Mathematics: 'Mathematics', ScienceTech: 'Science & Tech', HistoryCulture: 'History & Culture', CreativeArts: 'Creative Arts',
};

interface MapNode {
  id: string;
  topic: string;
  subject: string;
  color: string;
  aiResponse?: string;
  question?: string;
  userAnswer?: string;
  completed: boolean;
  createdAt: string;
}

type SessionContract = MockSession;

interface KnowledgeMapProps {
  sessions: SessionContract[];
  onCta?: () => void;
  onStartSession?: (topic: string, subject?: string) => void;
  onResumeSession?: (session: SessionContract, keepExploringTopic?: string) => void;
}

interface KnowledgeMapProps {
  sessions: SessionContract[];
  onCta?: () => void;
  onStartSession?: (topic: string, subject?: string) => void;
  onResumeSession?: (session: SessionContract, keepExploringTopic?: string) => void;
}

function generateSuggestions(): string[] {
  return [
    'I want to dive deeper into some of the ideas we just covered',
    'Can you give me a practice scenario to test what I have learned?',
    'What are some common misconceptions people have about this topic?',
  ];
}

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100, marginx: 40, marginy: 40 });

  nodes.forEach((n) => g.setNode(n.id, { width: 220, height: 110 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - 110, y: pos.y - 40 } };
  });
}

function TopicNode({ data }: { data: { label: string; color: string; completed: boolean; subject: string } }) {
  return (
    <div className="bg-bg-card rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-sm"
      style={{ border: '1.5px solid var(--color-border-default)' }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !rounded-full !border-2" style={{ borderColor: data.color, backgroundColor: 'var(--color-bg-card)' }} />

      <div className="px-4 py-3.5 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
            <span className="text-[0.5rem] font-semibold" style={{ color: data.color }}>
              {data.subject === 'ScienceTech' ? 'Science & Tech' : data.subject}
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2">{data.label}</p>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className={`text-[0.5rem] font-medium ${data.completed ? 'text-success' : 'text-text-muted'}`}>
              {data.completed ? 'Completed' : 'In progress'}
            </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !rounded-full !border-2" style={{ borderColor: data.color, backgroundColor: 'var(--color-bg-card)' }} />
    </div>
  );
}

const nodeTypes = { topicNode: TopicNode };

function MapCanvas({ nodes, edges, onNodeClick, mapNodes, onStartSession, onNodesChange, onEdgesChange }: {
  nodes: Node[]; edges: Edge[]; onNodeClick: (_: any, node: any) => void;
  mapNodes: MapNode[]; onStartSession?: (topic: string, subject?: string) => void;
  onNodesChange: OnNodesChange; onEdgesChange: OnEdgesChange;
}) {
  const reactFlowInstance = useReactFlow();

  return (
    <div className="rounded-2xl border border-border-default overflow-hidden bg-bg-primary" style={{ height: 540 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        style={{ background: 'transparent' }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={3}
        panOnScroll
        zoomOnScroll
        nodesDraggable={true}
        nodesConnectable={false}
          elementsSelectable={true}
        deleteKeyCode={null}
      >
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
          <div className="relative group">
            <button onClick={() => reactFlowInstance.zoomIn()}
              className="w-9 h-9 rounded-full bg-bg-card border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors">
              <ZoomIn size={16} />
            </button>
            <span className="absolute bottom-1/2 right-full mr-3 px-3 py-1.5 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-right scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">Zoom in</span>
          </div>
          <div className="relative group">
            <button onClick={() => reactFlowInstance.zoomOut()}
              className="w-9 h-9 rounded-full bg-bg-card border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors">
              <ZoomOut size={16} />
            </button>
            <span className="absolute bottom-1/2 right-full mr-3 px-3 py-1.5 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-right scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">Zoom out</span>
          </div>
          <div className="relative group">
            <button onClick={() => reactFlowInstance.fitView({ padding: 0.3 })}
              className="w-9 h-9 rounded-full bg-bg-card border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors">
              <Maximize2 size={16} />
            </button>
            <span className="absolute bottom-1/2 right-full mr-3 px-3 py-1.5 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-right scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">Fit view</span>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
}

export function KnowledgeMap({ sessions, onCta, onStartSession, onResumeSession }: KnowledgeMapProps) {
  const [drawerNode, setDrawerNode] = useState<MapNode | null>(null);

  const mapNodes: MapNode[] = useMemo(() =>
    sessions.slice(0, 30).map((s) => {
      const question = s.synthesisQuestion || (s as any).question;
      return {
        id: s.id, topic: s.topic || 'Untitled', subject: s.subject || 'Other',
        color: SUBJECT_COLORS[s.subject] || '#0EA4A4',
        aiResponse: s.aiResponse, question, userAnswer: s.userAnswer,
        completed: s.completed, createdAt: s.createdAt,
      };
    }),
  [sessions]);

  const { nodes: layoutedNodes, edges } = useMemo(() => {
    const sorted = [...mapNodes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const flowNodes: Node[] = sorted.map((n, i) => ({
      id: n.id,
      type: 'topicNode',
      data: { label: n.topic, color: n.color, completed: n.completed, subject: n.subject },
      position: { x: 0, y: 0 },
    }));
    const flowEdges: Edge[] = [];
    for (let i = 1; i < flowNodes.length; i++) {
      flowEdges.push({
        id: `e-${i}`,
        source: flowNodes[i - 1].id,
        target: flowNodes[i].id,
        style: { stroke: '#94A3B8', strokeWidth: 1.5 },
        type: 'smoothstep',
      });
    }
    return { nodes: getLayoutedElements(flowNodes, flowEdges), edges: flowEdges };
  }, [mapNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [rfEdges, setEdges] = useState(edges);
  const onEdgesChange: OnEdgesChange = useCallback(() => {}, []);

  const layoutKeyRef = useRef(mapNodes.length);
  if (layoutKeyRef.current !== mapNodes.length) {
    layoutKeyRef.current = mapNodes.length;
    setNodes(layoutedNodes);
    setEdges(edges);
  }

  const onNodeClick = useCallback((_event: any, node: any) => {
    const n = mapNodes.find((m) => m.id === node.id);
    if (n) setDrawerNode((prev) => prev?.id === n.id ? null : n);
  }, [mapNodes]);

  if (mapNodes.length === 0) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center overflow-hidden">
        <PremiumEmptyState
          headline="Your Map is Waiting"
          body="Every time you complete a synthesis in the Study Hub"
          ctaLabel="Start Your First Lesson"
          onCta={onCta}
        />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[clamp(1.25rem,0.75rem+2vw,1.5rem)] font-medium text-text-primary tracking-tight">Knowledge Map</h2>
          <p className="text-body-md text-text-muted mt-1">Explore your knowledge journey. Click a topic to review your lessons.</p>
        </div>
        <span className="flex items-center gap-1.5 text-label-sm text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
          {mapNodes.length} topics
        </span>
      </div>

      <MapCanvas nodes={nodes} edges={rfEdges} onNodeClick={onNodeClick} mapNodes={mapNodes} onStartSession={onStartSession} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />

      <AnimatePresence>
        {drawerNode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[50] bg-black/20" onClick={() => setDrawerNode(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerNode && (
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[560px] sm:max-w-[560px] bg-bg-card z-[51] overflow-y-auto">
            <div className="p-8 flex flex-col min-h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${drawerNode.color}20`, borderBottom: `3px solid ${drawerNode.color}60` }}>
                    <BookOpen size={18} style={{ color: drawerNode.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-title-lg text-text-primary font-semibold leading-tight truncate max-w-[360px]">{drawerNode.topic}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: drawerNode.color }} />
                      <span className="text-label-md text-text-muted">{SUBJECT_LABELS[drawerNode.subject] ?? drawerNode.subject}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setDrawerNode(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors shrink-0 mt-0.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">
                  <X size={16} />
                </button>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 mb-7 pb-5 border-b border-border-default">
                <div className="flex items-center gap-1.5 text-label-md text-text-muted">
                  <Clock size={14} />
                  <span>{new Date(drawerNode.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <span className={`text-label-md font-semibold px-2.5 py-0.5 rounded-full ${drawerNode.completed ? 'text-success bg-success-container/30' : 'text-warning bg-warning-container/30'}`}>
                  {drawerNode.completed ? 'Completed' : 'Skipped'}
                </span>
                <span className="text-label-md text-text-muted ml-auto flex items-center gap-1">
                  <Award size={12} /> {drawerNode.completed ? '+10 XP' : '0 XP'}
                </span>
              </div>

              {drawerNode.aiResponse && (
                <div className="mb-7">
                  <p className="text-label-md font-semibold text-text-muted mb-2">Lesson Summary</p>
                  <p className="text-body-md text-text-secondary leading-relaxed bg-bg-secondary rounded-xl p-4">
                    {drawerNode.aiResponse.slice(0, 250)}
                    {drawerNode.aiResponse.length > 250 && <span className="text-text-muted">...</span>}
                  </p>
                </div>
              )}

              {drawerNode.question && (
                <div className="mb-7 p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] dark:border dark:border-slate-800">
                  <p className="text-label-sm font-bold uppercase tracking-wider mb-1.5" style={{ color: drawerNode.color }}>Synthesis Challenge</p>
                  <p className="text-body-md text-text-primary">{drawerNode.question}</p>
                </div>
              )}

              <div className="flex-1" />

              {/* Keep Exploring */}
              <div className="pt-6 border-t border-border-default">
                <p className="text-label-md font-semibold text-text-muted mb-3">Keep Exploring</p>
                <div className="flex flex-col gap-2">
                  {generateSuggestions().map((suggestion) => (
                    <button key={suggestion}
                      onClick={() => { if (onResumeSession && drawerNode) { const s = sessions.find((s: any) => s.id === drawerNode.id); if (s) onResumeSession(s, suggestion); } setDrawerNode(null); }}
                      className="w-full text-left px-4 py-3 rounded-xl text-body-md font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-[1px] outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                      style={{
                        backgroundColor: `${drawerNode.color}10`,
                        color: drawerNode.color,
                        borderBottom: `3px solid ${drawerNode.color}40`,
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ReactFlowProvider>
  );
}
