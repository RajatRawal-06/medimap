/**
 * PredictionEngine.js — Ensemble Next-Step Prediction
 * 
 * Combines 3 signals for prediction:
 *   1. Markov chain (transition matrix)          — weight: 0.40
 *   2. Journey cluster (historical similarity)   — weight: 0.35
 *   3. Context rules (doctor + appointment type) — weight: 0.25
 * 
 * Returns the best next step with confidence and alternatives.
 */

const { TRANSITION_MATRIX, APPOINTMENT_PATTERNS, DOCTOR_DEPARTMENT_MAP } = require('../journeyData');
const journeyCluster = require('./JourneyCluster');

class PredictionEngine {
    constructor() {
        this.weights = {
            markov: 0.40,
            cluster: 0.35,
            context: 0.25,
        };
    }

    /**
     * Predict the next navigation step for a user.
     * 
     * @param {string} currentLocation - Current department/node ID
     * @param {string} userRole - 'patient_new', 'patient_followup', 'visitor'
     * @param {object} context - { doctorType?, appointmentType?, journeySoFar?: string[] }
     * @returns {{ nextNode, confidence, reasoning, alternatives[], method }}
     */
    predictNextStep(currentLocation, userRole, context = {}) {
        const { doctorType, appointmentType, journeySoFar = [] } = context;

        // Normalize location → department type
        const locationType = this._normalizeLocation(currentLocation);

        // ── Signal 1: Markov Transition ──
        const markovResult = this._markovPredict(locationType, userRole);

        // ── Signal 2: Journey Cluster ──
        const clusterResult = this._clusterPredict(doctorType, appointmentType, journeySoFar, locationType);

        // ── Signal 3: Context Rules ──
        const contextResult = this._contextPredict(locationType, doctorType, appointmentType, userRole);

        // ── Ensemble Merge ──
        const merged = this._mergeSignals(markovResult, clusterResult, contextResult);

        return merged;
    }

    /**
     * Markov chain: P(next | current, role) from the transition matrix.
     */
    _markovPredict(locationType, userRole) {
        const probabilities = TRANSITION_MATRIX[locationType]?.[userRole];

        if (!probabilities) {
            return { predictions: {}, confidence: 0, source: 'markov' };
        }

        return {
            predictions: { ...probabilities },
            confidence: Math.max(...Object.values(probabilities)),
            source: 'markov',
        };
    }

    /**
     * Cluster-based: find the closest historical journey and predict
     * the next step in that sequence.
     */
    _clusterPredict(doctorType, appointmentType, journeySoFar, currentLocation) {
        const currentSequence = journeySoFar.length > 0 ? journeySoFar : [currentLocation];

        const clusterInfo = journeyCluster.classify(
            doctorType || null,
            appointmentType || 'new_consultation',
            currentSequence
        );

        const predictions = {};
        if (clusterInfo.predictedRemaining.length > 0) {
            const nextStep = clusterInfo.predictedRemaining[0];
            predictions[nextStep] = clusterInfo.similarity * 0.9;

            // Add subsequent steps with decaying probability
            for (let i = 1; i < Math.min(3, clusterInfo.predictedRemaining.length); i++) {
                predictions[clusterInfo.predictedRemaining[i]] =
                    clusterInfo.similarity * (0.3 / (i + 1));
            }
        }

        return {
            predictions,
            confidence: clusterInfo.similarity,
            source: 'cluster',
            clusterId: clusterInfo.clusterId,
        };
    }

    /**
     * Context-based: deterministic rules from doctor type and
     * appointment type patterns.
     */
    _contextPredict(locationType, doctorType, appointmentType, userRole) {
        const predictions = {};
        let confidence = 0.3; // Base confidence for rules

        // Rule 1: Appointment pattern — get the typical next step
        if (appointmentType && APPOINTMENT_PATTERNS[appointmentType]) {
            const pattern = APPOINTMENT_PATTERNS[appointmentType].typicalSequence;
            const currentIdx = pattern.indexOf(locationType);

            if (currentIdx >= 0 && currentIdx < pattern.length - 1) {
                const nextInPattern = pattern[currentIdx + 1];
                predictions[nextInPattern] = (predictions[nextInPattern] || 0) + 0.6;
                confidence = 0.6;
            }
        }

        // Rule 2: Doctor type → relevant departments
        if (doctorType && DOCTOR_DEPARTMENT_MAP[doctorType]) {
            const relevantDepts = DOCTOR_DEPARTMENT_MAP[doctorType];

            // If currently NOT in a relevant dept, suggest the first relevant one
            if (!relevantDepts.includes(locationType)) {
                for (const dept of relevantDepts) {
                    predictions[dept] = (predictions[dept] || 0) + 0.3;
                }
            }
        }

        // Rule 3: Common terminal patterns
        if (locationType === 'pharmacy') {
            predictions['billing'] = (predictions['billing'] || 0) + 0.4;
            predictions['exit'] = (predictions['exit'] || 0) + 0.3;
        }
        if (locationType === 'billing') {
            predictions['exit'] = (predictions['exit'] || 0) + 0.6;
        }

        return {
            predictions,
            confidence,
            source: 'context',
        };
    }

    /**
     * Merge all three signals using weighted ensemble.
     */
    _mergeSignals(markov, cluster, context) {
        const allNodes = new Set([
            ...Object.keys(markov.predictions),
            ...Object.keys(cluster.predictions),
            ...Object.keys(context.predictions),
        ]);

        const combined = {};

        for (const node of allNodes) {
            combined[node] =
                (markov.predictions[node] || 0) * this.weights.markov +
                (cluster.predictions[node] || 0) * this.weights.cluster +
                (context.predictions[node] || 0) * this.weights.context;
        }

        // Sort by score
        const sorted = Object.entries(combined)
            .sort((a, b) => b[1] - a[1])
            .map(([node, score]) => ({
                node,
                score: parseFloat(score.toFixed(3)),
            }));

        if (sorted.length === 0) {
            return {
                nextNode: 'reception',
                confidence: 0.15,
                reasoning: 'No data available — defaulting to Reception.',
                alternatives: [],
                method: 'fallback',
            };
        }

        const best = sorted[0];
        const alternatives = sorted.slice(1, 4); // Top 3 alternatives

        // Compute ensemble confidence
        const totalSignals = [markov, cluster, context].filter(s =>
            Object.keys(s.predictions).length > 0
        ).length;
        const ensembleConfidence = parseFloat(
            Math.min(1, best.score * (1 + totalSignals * 0.1)).toFixed(2)
        );

        // Build reasoning
        const reasoning = this._buildReasoning(best, markov, cluster, context);

        return {
            nextNode: best.node,
            confidence: ensembleConfidence,
            reasoning,
            alternatives: alternatives.map(a => ({
                node: a.node,
                score: a.score,
            })),
            method: 'ensemble',
            signalCount: totalSignals,
        };
    }

    _buildReasoning(best, markov, cluster, context) {
        const parts = [];

        if (markov.predictions[best.node]) {
            parts.push(`Markov: ${(markov.predictions[best.node] * 100).toFixed(0)}% transition probability`);
        }
        if (cluster.predictions[best.node]) {
            parts.push(`Cluster match: ${cluster.clusterId || 'general'}`);
        }
        if (context.predictions[best.node]) {
            parts.push(`Context rules support this choice`);
        }

        return `Predicted "${best.node}" (ensemble score: ${best.score}). ${parts.join('. ')}.`;
    }

    /**
     * Normalize a location string / node ID to a known department type.
     */
    _normalizeLocation(location) {
        if (!location) return 'entrance';
        const loc = location.toLowerCase();

        // Direct match
        if (TRANSITION_MATRIX[loc]) return loc;

        // Fuzzy match
        const mappings = {
            'entrance': ['entrance', 'main', 'gate', 'door', 'lobby'],
            'reception': ['reception', 'front desk', 'check-in', 'checkin'],
            'triage': ['triage', 'assessment', 'nurse station'],
            'consultation': ['consultation', 'doctor', 'room', 'opd', 'clinic'],
            'radiology': ['radiology', 'xray', 'x-ray', 'mri', 'ct', 'scan', 'imaging'],
            'lab': ['lab', 'laboratory', 'pathology', 'blood'],
            'pharmacy': ['pharmacy', 'medical store', 'drug', 'chemist'],
            'billing': ['billing', 'cashier', 'payment', 'accounts'],
            'emergency': ['emergency', 'er', 'trauma', 'casualty'],
            'ward': ['ward', 'bed', 'room', 'inpatient'],
            'icu': ['icu', 'intensive', 'critical care'],
            'ot': ['ot', 'operation', 'surgery', 'theatre'],
            'cafeteria': ['cafeteria', 'canteen', 'food', 'cafe'],
            'info-desk': ['info', 'information', 'help desk', 'inquiry'],
            'exit': ['exit', 'leave', 'gate', 'out'],
        };

        for (const [dept, aliases] of Object.entries(mappings)) {
            if (aliases.some(alias => loc.includes(alias))) {
                return dept;
            }
        }

        return loc; // Return as-is if no match
    }
}

module.exports = new PredictionEngine();
