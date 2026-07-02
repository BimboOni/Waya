# skills/react-flow-builder/SKILL.md
React Flow — Spatial Knowledge Map

## Purpose
Builds and maintains the interactive Knowledge Map canvas. Every completed synthesis spawns a color-coded node. Nodes must never overlap. Edges connect sequential session nodes for the same user.

---

## 1. Installation
```bash
npm install reactflow
2. Type Definitions
File: types/index.ts (additions)

TypeScript
import type { Node, Edge } from 'reactflow';

export interface KnowledgeNodeData {
  topic: string;
  subject: string;
  color: string;
  createdAt: string;
}

export type WayaNode = Node<KnowledgeNodeData>;
export type WayaEdge = Edge;
3. Grid-Snapping Layout Algorithm
New nodes must be placed on a 200×120px grid to prevent overlap. Position is calculated server-side when the node is created.
File: lib/knowledge-map.ts

TypeScript
import { prisma } from './prisma';
import { SUBJECT_COLORS } from './constants';

const GRID_CELL_W = 200;
const GRID_CELL_H = 120;
const COLUMNS = 5; // Max nodes per row before wrapping

export async function calculateNextNodePosition(userId: string): Promise<{ x: number; y: number }> {
  const existingNodes = await prisma.knowledgeNode.findMany({
    where: { userId },
    select: { positionX: true, positionY: true },
    orderBy: { createdAt: 'asc' },
  });

  const count = existingNodes.length;
  const col = count % COLUMNS;
  const row = Math.floor(count / COLUMNS);

  // Add jitter offset to prevent perfect grid monotony (±20px)
  const jitterX = (Math.random() - 0.5) * 40;
  const jitterY = (Math.random() - 0.5) * 40;

  return {
    x: col * GRID_CELL_W + 60 + jitterX,
    y: row * GRID_CELL_H + 60 + jitterY,
  };
}

export function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? 'var(--color-brand-primary)';
}

export async function createKnowledgeNode(params: {
  userId: string;
  sessionId: string;
  topic: string;
  subject: string;
}): Promise<{ nodeId: string; position: { x: number; y: number } }> {
  const position = await calculateNextNodePosition(params.userId);

  const node = await prisma.knowledgeNode.create({
    data: {
      userId: params.userId,
      sessionId: params.sessionId,
      topic: params.topic,
      subject: params.subject,
      positionX: position.x,
      positionY: position.y,
    },
  });

  // Auto-link to the most recent previous node
  const previousNode = await prisma.knowledgeNode.findFirst({
    where: { userId: params.userId, id: { not: node.id } },
    orderBy: { createdAt: 'desc' },
  });

  if (previousNode) {
    await prisma.knowledgeEdge.create({
      data: {
        userId: params.userId,
        sourceNodeId: previousNode.id,
        targetNodeId: node.id,
      },
    });
  }

  return { nodeId: node.id, position };
}
4. Knowledge Map Component
File: components/knowledge-map/KnowledgeMap.tsx

TypeScript
'use client';

import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWayaStore } from '@/store/useWayaStore';
import { KnowledgeMapNode } from './KnowledgeMapNode';
import type { WayaNode, WayaEdge } from '@/types';
import { getSubjectColor } from '@/lib/knowledge-map';

const nodeTypes = { wayaNode: KnowledgeMapNode };

interface Props {
  initialNodes: WayaNode[];
  initialEdges: WayaEdge[];
}

export function KnowledgeMap({ initialNodes, initialEdges }: Props) {
  const { knowledgeNodes, knowledgeEdges } = useWayaStore();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync Zustand store additions to React Flow state
  useEffect(() => {
    setNodes(
      knowledgeNodes.map(n => ({
        id: n.id,
        type: 'wayaNode',
        position: { x: n.positionX, y: n.positionY },
        data: {
          topic: n.topic,
          subject: n.subject,
          color: getSubjectColor(n.subject),
          createdAt: n.createdAt.toString(),
        },
      }))
    );
  }, [knowledgeNodes, setNodes]);

  useEffect(() => {
    setEdges(
      knowledgeEdges.map(e => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        type: 'smoothstep',
        style: { stroke: 'var(--color-border-strong)', strokeWidth: 2 },
        animated: false,
      }))
    );
  }, [knowledgeEdges, setEdges]);

  return (
    <div style={{ width: '100%', height: '600px' }} className="rounded-lg border border-border-default overflow-hidden bg-bg-workspace">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        deleteKeyCode={null} // Prevent accidental deletion
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />
        <Controls
          showInteractive={false}
          className="bg-bg-card border border-border-default text-text-primary rounded-md shadow-none"
          style={{ bottom: 16, right: 16, left: 'auto' }}
        />
        <MiniMap
          nodeColor={(node) => (node.data as any)?.color ?? 'var(--color-text-muted)'}
          style={{ bottom: 16, left: 16 }}
          className="border border-border-default bg-bg-card rounded-md"
        />
      </ReactFlow>
    </div>
  );
}
5. Custom Node Component
File: components/knowledge-map/KnowledgeMapNode.tsx

TypeScript
'use client';

import { Handle, Position, type NodeProps } from 'reactflow';
import type { KnowledgeNodeData } from '@/types';

export function KnowledgeMapNode({ data, selected }: NodeProps<KnowledgeNodeData>) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div
        style={{
          borderColor: data.color,
          boxShadow: selected ? `0 0 0 2px ${data.color}` : 'none',
        }}
        className="
          bg-bg-card border-2 rounded-lg p-4
          min-w-[140px] max-w-[180px]
          cursor-pointer transition-all duration-default ease-waya
        "
      >
        <div
          style={{ backgroundColor: data.color }}
          className="text-text-inverse text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full inline-block mb-1.5"
        >
          {data.subject}
        </div>
        <p className="text-text-primary font-body text-sm font-medium leading-tight line-clamp-2">
          {data.topic}
        </p>
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </>
  );
}
6. Session API Integration
After a successful synthesis validation, the session API route calls createKnowledgeNode() and returns the new node data. The client then calls useWayaStore().addKnowledgeNode() to update the map in real time without a page reload.

TypeScript
// Inside validate-answer route — after session completion:
const { nodeId, position } = await createKnowledgeNode({
  userId: user.id,
  sessionId,
  topic: session.topic,
  subject: validatedSubject,
});

// Return in response so client can update store:
return NextResponse.json({
  // ... other fields
  newNode: {
    id: nodeId,
    userId: user.id,
    sessionId,
    topic: session.topic,
    subject: validatedSubject,
    positionX: position.x,
    positionY: position.y,
    createdAt: new Date().toISOString(),
  },
  newEdge: edgeRecord ?? null,
});
7. Performance Notes
React Flow renders are bounded to the viewport — no performance concern for MVP node counts (<500 nodes).

snapToGrid={true} with snapGrid={[20, 20]} ensures clean alignment on manual drag.

deleteKeyCode={null} disables keyboard deletion to prevent accidental data loss.

fitView on load ensures the full map is always visible on first render.