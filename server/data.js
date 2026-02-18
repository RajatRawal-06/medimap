// Mock Data for Training / Logic
// In a real system, this would come from a DB or specific training set

// Transition Matrix: Map<CurrentNodeType, Map<Role, NextNodeType>>
// Probability of going from A to B based on Role
const TRANSITION_PROBABILITIES = {
    'entrance': {
        'patient_new': { 'reception': 0.8, 'emergency': 0.1, 'triage': 0.1 },
        'patient_followup': { 'radiology': 0.4, 'consultation': 0.4, 'pharmacy': 0.2 },
        'visitor': { 'ward': 0.7, 'cafeteria': 0.3 }
    },
    'reception': {
        'patient_new': { 'triage': 0.6, 'consultation': 0.4 },
        'patient_followup': { 'consultation': 0.9, 'billing': 0.1 }
    },
    'consultation': {
        'patient_new': { 'pharmacy': 0.5, 'lab': 0.3, 'billing': 0.2 },
        'patient_followup': { 'pharmacy': 0.7, 'exit': 0.3 }
    }
};

const CROWD_ZONES = [
    // Mock real-time crowd data
    { nodeId: 'corridor-1', density: 0.8 }, // 80% crowded
    { nodeId: 'waiting-room-a', density: 0.4 }
];

module.exports = {
    TRANSITION_PROBABILITIES,
    CROWD_ZONES
};
