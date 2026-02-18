import { create } from 'zustand';
import type { NavigationPath, Edge as NavEdge } from '../navigation/types';
import type { MapNode } from '../data/floorMapData';
// import { navigationEngine } from '../navigation/Pathfinder';
// import { supabase } from '../lib/supabase';

// const AI_BASE_URL = 'http://localhost:3001';

export interface PredictionResult {
    nextNode: string;
    confidence: number;
    reasoning: string;
    alternatives: { node: string; score: number }[];
    method: string;
}

export interface RerouteResult {
    shouldReroute: boolean;
    severity: string;
    original: string;
    alternative?: {
        node: string;
        name: string;
        reason: string;
        crowdLevel: number;
        loadLevel: number;
    };
    reason: string;
    waitTime?: number;
    crowdLevel: number;
    loadLevel: number;
}

interface IntentResult {
    intents: { intent: string; confidence: number; target: string; urgency: string }[];
    primaryIntent: string;
    target: string;
    urgency: string;
    confidence: number;
    reasoning: string;
}

interface JourneyClusterResult {
    clusterId: string;
    centroidJourney: string[] | null;
    similarity: number;
    predictedRemaining: string[];
    avgDuration: number;
    clusterSize?: number;
}

interface JourneyPathStep {
    department: string;
    name: string;
    floor: number;
    congested: boolean;
    crowdLevel: number;
    alternative: RerouteResult['alternative'] | null;
}

interface JourneySuggestResult {
    clusterId: string;
    predictedPath: JourneyPathStep[];
    totalSteps: number;
    avgDuration: number;
    similarity: number;
}

interface CrowdMetric {
    node_id: string;
    congestion_score: number;
    queue_count?: number;
    currentToken?: string;
    estimatedWait?: number; // in minutes
}

export interface Hospital {
    id: string;
    name: string;
    address: string;
    location_lat: number;
    location_lng: number;
    emergency_phone: string;
    image_url?: string;
}

interface NavigationState {
    currentLocation: string | null;
    destination: string | null;
    path: NavigationPath | null;
    instructions: string[];
    isNavigating: boolean;
    crowdMetrics: Record<string, CrowdMetric>;
    heatmapData: Record<string, number>;

    // Global UI State
    theme: 'light' | 'dark';
    language: 'EN' | 'HI' | 'ES';
    accessibilityMode: {
        wheelchair: boolean;
        highContrast: boolean;
        reducedMotion: boolean;
        screenReader: boolean;
        voiceAssist: boolean;
        largeText: boolean;
        simplifiedMode: boolean;
        avoidCrowds: boolean;
    };

    // Emergency State
    isEmergencyActive: boolean;
    emergencyHospital: Hospital | null;
    emergencyLocation: { lat: number; lng: number } | null;
    emergencyDistance: number | null;
    emergencyETA: number | null;

    // Navigation Engine State
    currentStepIndex: number;
    isVoiceEnabled: boolean;
    navigationActive: boolean;
    floorMapId: string | null;
    nodes: MapNode[];
    edges: NavEdge[];

    // AI Assistant State
    alternatePath: NavigationPath | null;
    hospitalMetrics: {
        totalDoctors: number;
        occupancy: number;
        avgWaitTime: number;
        status: 'Operational' | 'High Load' | 'Critical';
    } | null;

    // Actions
    setLocation: (nodeId: string) => void;
    setDestination: (nodeId: string) => void;
    calculatePath: () => void;
    startNavigation: () => void;
    stopNavigation: () => void;
    loadMapData: (hospitalId: string) => Promise<void>;
    nextStep: () => void;
    prevStep: () => void;
    setStep: (index: number) => void;
    toggleVoice: () => void;
    restartNavigation: () => void;

    setLanguage: (lang: 'EN' | 'HI' | 'ES') => void;
    toggleTheme: () => void;
    toggleAccessibility: (feature: 'highContrast' | 'reducedMotion' | 'largeText' | 'simplifiedMode' | 'wheelchair' | 'screenReader' | 'voiceAssist' | 'avoidCrowds') => void;
    toggleTTS: () => void;
    triggerEmergency: () => void;
    setEmergencyActive: (active: boolean) => void;
    logEmergency: (hospitalId: string, lat: number, lng: number) => Promise<void>;
    findNearestHospital: (lat: number, lng: number) => Promise<Hospital | null>;

    // AI Actions
    subscribeToCrowdData: () => () => void;
    predictNextStep: (currentLocation: string, userRole: string, context?: Record<string, unknown>) => Promise<PredictionResult | null>;
    analyzeIntent: (query: string, context?: Record<string, unknown>) => Promise<IntentResult | null>;
    classifyJourney: (doctorType: string | null, appointmentType: string, journeySoFar?: string[]) => Promise<JourneyClusterResult | null>;
    suggestFullPath: (params: Record<string, unknown>) => Promise<JourneySuggestResult | null>;
    checkReroute: (currentNode: string, intendedNext: string, userRole?: string, options?: Record<string, unknown>) => Promise<RerouteResult | null>;
    fetchCrowdData: () => Promise<{ nodeId: string; density: number }[]>;
    fetchHospitalMetrics: (hospitalId: string) => Promise<void>;
    setAlternatePath: (path: NavigationPath | null) => void;
    applyAlternatePath: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
    currentLocation: null,
    destination: null,
    path: null,
    instructions: [],
    isNavigating: false,
    crowdMetrics: {},
    heatmapData: {},

    theme: 'dark',
    language: 'EN',
    accessibilityMode: {
        wheelchair: false,
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        voiceAssist: false,
        largeText: false,
        simplifiedMode: false,
        avoidCrowds: false,
    },

    isEmergencyActive: false,
    emergencyHospital: null,
    emergencyLocation: null,
    emergencyDistance: null,
    emergencyETA: null,

    currentStepIndex: 0,
    isVoiceEnabled: false,
    navigationActive: false,
    floorMapId: null,
    nodes: [],
    edges: [],

    alternatePath: null,
    hospitalMetrics: null,

    // Actions
    setLocation: (nodeId) => set({ currentLocation: nodeId }),
    setDestination: (nodeId) => set({ destination: nodeId }),
    calculatePath: () => {
        // Mock path calculation for now
        set({ path: { steps: [], totalDistance: 0, estimatedTime: 0 } });
    },
    startNavigation: () => set({ isNavigating: true, navigationActive: true }),
    stopNavigation: () => set({ isNavigating: false, navigationActive: false, path: null, instructions: [] }),

    loadMapData: async () => {
        // Mock load
        set({ nodes: [] });
    },

    nextStep: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),
    prevStep: () => set((state) => ({ currentStepIndex: Math.max(0, state.currentStepIndex - 1) })),
    setStep: (index) => set({ currentStepIndex: index }),

    toggleVoice: () => set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled })),
    restartNavigation: () => set({ currentStepIndex: 0 }),

    setLanguage: (lang) => set({ language: lang }),
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    toggleAccessibility: (feature) => set((state) => ({
        accessibilityMode: {
            ...state.accessibilityMode,
            [feature]: !state.accessibilityMode[feature]
        }
    })),
    toggleTTS: () => set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled })),

    triggerEmergency: () => set({ isEmergencyActive: true }),
    setEmergencyActive: (active) => set({ isEmergencyActive: active }),

    logEmergency: async () => { },
    findNearestHospital: async () => null,

    subscribeToCrowdData: () => () => { },
    predictNextStep: async () => null,
    analyzeIntent: async () => null,
    classifyJourney: async () => null,
    suggestFullPath: async () => null,
    checkReroute: async () => null,
    fetchCrowdData: async () => [],
    fetchHospitalMetrics: async () => { },

    setAlternatePath: (path) => set({ alternatePath: path }),
    applyAlternatePath: () => {
        const { alternatePath } = get();
        if (alternatePath) {
            set({ path: alternatePath, alternatePath: null });
        }
    }
}));
