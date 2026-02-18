import type { NavNode, Edge, NavigationPath, PathStep } from './types';
import { PriorityQueue } from './PriorityQueue';

export class Graph {
    private nodes: Map<string, NavNode> = new Map();
    private adjacencyList: Map<string, { node: string; weight: number; edgeId: string }[]> = new Map();

    addNode(node: NavNode) {
        this.nodes.set(node.id, node);
        if (!this.adjacencyList.has(node.id)) {
            this.adjacencyList.set(node.id, []);
        }
    }

    addEdge(edge: Edge) {
        // Undirected graph logic (add both ways)
        if (!this.adjacencyList.has(edge.from)) this.adjacencyList.set(edge.from, []);
        if (!this.adjacencyList.has(edge.to)) this.adjacencyList.set(edge.to, []);

        this.adjacencyList.get(edge.from)?.push({ node: edge.to, weight: edge.weight, edgeId: edge.id });
        this.adjacencyList.get(edge.to)?.push({ node: edge.from, weight: edge.weight, edgeId: edge.id });
    }

    getNode(id: string): NavNode | undefined {
        return this.nodes.get(id);
    }

    getNodes(): NavNode[] {
        return Array.from(this.nodes.values());
    }

    findShortestPath(startNodeId: string, endNodeId: string, crowdData: { nodeId: string, density: number }[] = []): NavigationPath | null {
        if (!this.nodes.has(startNodeId) || !this.nodes.has(endNodeId)) {
            return null;
        }

        const distances: Map<string, number> = new Map();
        const previous: Map<string, string | null> = new Map();
        const pq = new PriorityQueue<string>();

        // Initialize
        this.nodes.forEach((node) => {
            distances.set(node.id, Infinity);
            previous.set(node.id, null);
        });

        distances.set(startNodeId, 0);
        pq.enqueue(startNodeId, 0);

        while (!pq.isEmpty()) {
            const currentNodeId = pq.dequeue();

            // Early exit if we reached the end
            if (currentNodeId === endNodeId) break;

            if (!currentNodeId || distances.get(currentNodeId) === Infinity) continue;

            const neighbors = this.adjacencyList.get(currentNodeId) || [];
            for (const neighbor of neighbors) {
                let weight = neighbor.weight;

                // Dynamic Crowd Penalty
                const crowdInfo = crowdData.find(c => c.nodeId === neighbor.node);
                if (crowdInfo) {
                    weight *= (1 + crowdInfo.density * 5); // Increase weight by 500% if fully crowded
                }

                const alt = (distances.get(currentNodeId) || 0) + weight;
                if (alt < (distances.get(neighbor.node) || Infinity)) {
                    distances.set(neighbor.node, alt);
                    previous.set(neighbor.node, currentNodeId);
                    pq.enqueue(neighbor.node, alt);
                }
            }
        }

        // Reconstruct path
        const path: PathStep[] = [];
        let current: string | null = endNodeId;

        if (distances.get(endNodeId) === Infinity) return null; // No path found

        while (current) {
            const node = this.nodes.get(current);
            if (node) {
                path.unshift({
                    nodeId: node.id,
                    x: node.x,
                    y: node.y,
                    floorId: node.floorId
                });
            }
            current = previous.get(current) || null;
        }

        return {
            steps: path,
            totalDistance: distances.get(endNodeId) || 0,
            estimatedTime: (distances.get(endNodeId) || 0) * 1.2
        };
    }

    findAlternatePath(startNodeId: string, endNodeId: string, primaryPathNodes: string[], crowdData: { nodeId: string, density: number }[] = []): NavigationPath | null {
        // To find an alternate path, we apply a significant penalty to nodes already in the primary path
        const modifiedCrowdData = [...crowdData];

        primaryPathNodes.forEach(nodeId => {
            const existing = modifiedCrowdData.find(c => c.nodeId === nodeId);
            if (existing) {
                existing.density = Math.min(1.0, existing.density + 0.8);
            } else {
                modifiedCrowdData.push({ nodeId, density: 0.8 });
            }
        });

        return this.findShortestPath(startNodeId, endNodeId, modifiedCrowdData);
    }
}
