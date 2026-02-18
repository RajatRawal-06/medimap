import { Graph } from './Graph';
import type { NavNode, Edge, NavigationPath, PathStep } from './types';
import { generateInstructions, enhancePathWithInstructions } from './InstructionGenerator';

export class NavigationPathfinder {
    private graph: Graph;

    constructor() {
        this.graph = new Graph();
    }

    loadGraph(nodes: NavNode[], edges: Edge[]) {
        nodes.forEach(node => this.graph.addNode(node));
        edges.forEach(edge => this.graph.addEdge(edge));
    }

    findPath(startNodeId: string, endNodeId: string, crowdData: { nodeId: string, density: number }[] = []): NavigationPath | null {
        const rawPath = this.graph.findShortestPath(startNodeId, endNodeId, crowdData);

        if (!rawPath) return null;

        const stepsWithInstructions = enhancePathWithInstructions(rawPath.steps);

        return {
            ...rawPath,
            steps: stepsWithInstructions
        };
    }

    findAlternatePath(startNodeId: string, endNodeId: string, primaryPathNodes: string[], crowdData: { nodeId: string, density: number }[] = []): NavigationPath | null {
        const rawPath = this.graph.findAlternatePath(startNodeId, endNodeId, primaryPathNodes, crowdData);

        if (!rawPath) return null;

        const stepsWithInstructions = enhancePathWithInstructions(rawPath.steps);

        return {
            ...rawPath,
            steps: stepsWithInstructions
        };
    }

    getInstructions(path: PathStep[]): string[] {
        return generateInstructions(path);
    }
}

// Singleton instance
export const navigationEngine = new NavigationPathfinder();
