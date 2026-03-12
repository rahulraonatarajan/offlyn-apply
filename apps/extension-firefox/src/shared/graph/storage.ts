/**
 * Graph Memory Layer — Storage
 *
 * Loads and saves graph state to browser.storage.local using Record<id, T>
 * shapes (not arrays) for incremental updates and efficient defensive loading.
 *
 * Firefox-specific: never uses browser.storage.local.get(null) — always
 * passes explicit key arrays.
 */

import { GRAPH_STORAGE_KEYS } from './constants';
import { buildMeta, runMigrations } from './migrations';
import type {
  GraphEdge,
  GraphMeta,
  GraphNode,
  PersistedEmbeddingCache,
  PersistedEdges,
  PersistedNodes,
} from './types';

// ── Validators ────────────────────────────────────────────────────────────────

function isValidNode(value: unknown): value is GraphNode {
  if (!value || typeof value !== 'object') return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === 'string' &&
    typeof n.type === 'string' &&
    typeof n.createdAt === 'number' &&
    typeof n.updatedAt === 'number' &&
    n.payload !== null &&
    typeof n.payload === 'object'
  );
}

function isValidEdge(value: unknown): value is GraphEdge {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.from === 'string' &&
    typeof e.to === 'string' &&
    typeof e.type === 'string' &&
    typeof e.weight === 'number' &&
    typeof e.createdAt === 'number' &&
    typeof e.updatedAt === 'number'
  );
}

// ── Load ──────────────────────────────────────────────────────────────────────

export interface LoadedGraphState {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  meta: GraphMeta;
}

/**
 * Load the full graph state from browser.storage.local.
 *
 * Defensive behavior:
 * - Skips corrupt node/edge entries without throwing
 * - Reconstructs meta if missing or if counts disagree with actual data
 * - Treats missing schema version as v0 and runs migrations
 * - Returns an empty initialized graph if nothing is stored
 */
export async function loadGraphState(): Promise<LoadedGraphState> {
  let rawNodes: PersistedNodes = {};
  let rawEdges: PersistedEdges = {};
  let rawMeta: Partial<GraphMeta> | null = null;

  try {
    const stored = await browser.storage.local.get([
      GRAPH_STORAGE_KEYS.nodes,
      GRAPH_STORAGE_KEYS.edges,
      GRAPH_STORAGE_KEYS.meta,
    ]);

    if (stored[GRAPH_STORAGE_KEYS.nodes] && typeof stored[GRAPH_STORAGE_KEYS.nodes] === 'object') {
      rawNodes = stored[GRAPH_STORAGE_KEYS.nodes] as PersistedNodes;
    }
    if (stored[GRAPH_STORAGE_KEYS.edges] && typeof stored[GRAPH_STORAGE_KEYS.edges] === 'object') {
      rawEdges = stored[GRAPH_STORAGE_KEYS.edges] as PersistedEdges;
    }
    if (stored[GRAPH_STORAGE_KEYS.meta] && typeof stored[GRAPH_STORAGE_KEYS.meta] === 'object') {
      rawMeta = stored[GRAPH_STORAGE_KEYS.meta] as Partial<GraphMeta>;
    }
  } catch (err) {
    console.warn('[Graph] Storage read failed, initializing empty graph:', err);
    return buildEmptyState();
  }

  // Validate and sanitize each entry — skip corrupt records
  const validNodes: PersistedNodes = {};
  for (const [id, node] of Object.entries(rawNodes)) {
    if (isValidNode(node) && node.id === id) {
      validNodes[id] = node;
    } else {
      console.warn(`[Graph] Skipping corrupt node "${id}"`);
    }
  }

  const validEdges: PersistedEdges = {};
  for (const [id, edge] of Object.entries(rawEdges)) {
    if (isValidEdge(edge) && edge.id === id) {
      validEdges[id] = edge;
    } else {
      console.warn(`[Graph] Skipping corrupt edge "${id}"`);
    }
  }

  // Reconstruct meta if missing or if counts disagree with actual data
  let meta: GraphMeta;
  if (!rawMeta) {
    console.log('[Graph] graph_meta missing — reconstructing from data');
    meta = buildMeta(validNodes, validEdges, { schemaVersion: 0 });
  } else {
    const actualNodeCount = Object.keys(validNodes).length;
    const actualEdgeCount = Object.keys(validEdges).length;
    if (rawMeta.nodeCount !== actualNodeCount || rawMeta.edgeCount !== actualEdgeCount) {
      console.log('[Graph] Meta counts mismatch actual data — trusting actual data');
      meta = buildMeta(validNodes, validEdges, rawMeta);
    } else {
      meta = buildMeta(validNodes, validEdges, rawMeta);
    }
  }

  // Run migrations if needed
  const migrated = runMigrations({ nodes: validNodes, edges: validEdges, meta });

  // Build in-memory maps
  const nodes = new Map<string, GraphNode>(Object.entries(migrated.nodes));
  const edges = new Map<string, GraphEdge>(Object.entries(migrated.edges));

  console.log(`[Graph] Loaded ${nodes.size} nodes, ${edges.size} edges (schema v${migrated.meta.schemaVersion})`);

  return { nodes, edges, meta: migrated.meta };
}

function buildEmptyState(): LoadedGraphState {
  return {
    nodes: new Map(),
    edges: new Map(),
    meta: buildMeta({}, {}),
  };
}

// ── Save ──────────────────────────────────────────────────────────────────────

/**
 * Persist the full graph state to browser.storage.local.
 * Converts in-memory Maps back to Record shapes before writing.
 */
export async function saveGraphState(
  nodes: Map<string, GraphNode>,
  edges: Map<string, GraphEdge>
): Promise<void> {
  const persistedNodes: PersistedNodes = Object.fromEntries(nodes);
  const persistedEdges: PersistedEdges = Object.fromEntries(edges);
  const meta: GraphMeta = buildMeta(persistedNodes, persistedEdges, {
    schemaVersion: 1,
    lastUpdated: Date.now(),
  });

  try {
    await browser.storage.local.set({
      [GRAPH_STORAGE_KEYS.nodes]: persistedNodes,
      [GRAPH_STORAGE_KEYS.edges]: persistedEdges,
      [GRAPH_STORAGE_KEYS.meta]: meta,
    });
  } catch (err) {
    console.error('[Graph] Save failed:', err);
  }
}

// ── Embedding cache ───────────────────────────────────────────────────────────

/**
 * Load the embedding cache from browser.storage.local.
 * Returns an empty Map if nothing is stored.
 */
export async function loadEmbeddingCache(): Promise<Map<string, number[]>> {
  try {
    const stored = await browser.storage.local.get([GRAPH_STORAGE_KEYS.embeddingCache]);
    const raw = stored[GRAPH_STORAGE_KEYS.embeddingCache];

    if (raw && typeof raw === 'object') {
      const cache = new Map<string, number[]>();
      for (const [id, vec] of Object.entries(raw as PersistedEmbeddingCache)) {
        if (Array.isArray(vec)) {
          cache.set(id, vec as number[]);
        }
      }
      console.log(`[Graph] Loaded ${cache.size} cached embeddings`);
      return cache;
    }
  } catch (err) {
    console.warn('[Graph] Failed to load embedding cache:', err);
  }
  return new Map();
}

/**
 * Persist the embedding cache to browser.storage.local.
 */
export async function saveEmbeddingCache(cache: Map<string, number[]>): Promise<void> {
  try {
    const persisted: PersistedEmbeddingCache = Object.fromEntries(cache);
    await browser.storage.local.set({
      [GRAPH_STORAGE_KEYS.embeddingCache]: persisted,
    });
  } catch (err) {
    console.error('[Graph] Embedding cache save failed:', err);
  }
}
