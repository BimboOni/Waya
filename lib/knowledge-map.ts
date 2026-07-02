import { prisma } from './prisma';
import { SUBJECT_COLORS } from './constants';

const GRID_CELL_W = 200;
const GRID_CELL_H = 120;
const COLUMNS = 5;

export async function calculateNextNodePosition(userId: string): Promise<{ x: number; y: number }> {
  const count = await prisma.knowledgeNode.count({
    where: { userId },
  });
  const col = count % COLUMNS;
  const row = Math.floor(count / COLUMNS);

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
}): Promise<{ nodeId: string; position: { x: number; y: number }; edgeId: string | null; sourceNodeId: string | null }> {
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

  let edgeId: string | null = null;
  let sourceNodeId: string | null = null;

  const previousNode = await prisma.knowledgeNode.findFirst({
    where: { userId: params.userId, id: { not: node.id } },
    orderBy: { createdAt: 'desc' },
  });

  if (previousNode) {
    const edge = await prisma.knowledgeEdge.create({
      data: {
        userId: params.userId,
        sourceNodeId: previousNode.id,
        targetNodeId: node.id,
      },
    });
    edgeId = edge.id;
    sourceNodeId = previousNode.id;
  }

  return { nodeId: node.id, position, edgeId, sourceNodeId };
}
