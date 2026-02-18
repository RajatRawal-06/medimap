export type NodeType = 'room' | 'corridor' | 'elevator' | 'stairs' | 'restroom' | 'exit' | 'emergency' | 'waiting_area' | 'clinic' | 'pharmacy';

export interface NavNode {
    id: string;
    x: number;
    y: number;
    floorId: number;
    type: NodeType;
    label?: string;
    metadata?: Record<string, unknown>; // For additional searchable info
    isAccessible?: boolean;
}

export interface Edge {
    id: string;
    from: string; // Node ID
    to: string; // Node ID
    weight: number; // Distance or cost
    floorId?: number; // Usually same as nodes, but for logic
    type?: 'walk' | 'elevator' | 'stairs';
}

export interface PathStep {
    nodeId: string;
    x: number;
    y: number;
    floorId: number;
    instruction?: string;
}

export interface NavigationPath {
    steps: PathStep[];
    totalDistance: number;
    estimatedTime: number; // in seconds
}
