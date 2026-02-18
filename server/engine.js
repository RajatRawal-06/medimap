const { TRANSITION_PROBABILITIES } = require('./data');

class PredictionEngine {
    constructor() {
        this.history = []; // Keep track of queries for simple "clustering"
    }

    /**
     * Predicts the next logical step for a user
     * @param {string} currentLocation - Node ID or Type (e.g., 'entrance', 'room-101')
     * @param {string} userRole - 'patient_new', 'patient_followup', 'visitor'
     * @param {string} appointmentType - Optional context
     */
    predictNextStep(currentLocation, userRole, appointmentType) {
        // Normalize location to type if possible (mock logic)
        let locationType = currentLocation.includes('entrance') ? 'entrance'
            : currentLocation.includes('reception') ? 'reception'
                : currentLocation.includes('room') ? 'consultation'
                    : 'corridor';

        const probabilities = TRANSITION_PROBABILITIES[locationType]?.[userRole];

        if (!probabilities) {
            return {
                nextNode: 'reception', // Default fallback
                confidence: 0.2,
                reasoning: 'Insufficient historical data, defaulting to Reception.'
            };
        }

        // Weighted Random Choice or Max Probability
        // For suggestion, we just pick the highest probability
        const bestNext = Object.entries(probabilities).reduce((a, b) => a[1] > b[1] ? a : b);

        return {
            nextNode: bestNext[0],
            confidence: bestNext[1],
            reasoning: `Based on ${userRole} patterns at ${locationType}, ${bestNext[1] * 100}% go to ${bestNext[0]}.`
        };
    }

    /**
     * Classifies user intent from a search query or context
     * @param {string} query 
     */
    classifyIntent(query) {
        query = query.toLowerCase();
        if (query.includes('pain') || query.includes('blood') || query.includes('emergency') || query.includes('collapse')) {
            return { intent: 'EMERGENCY', urgency: 'HIGH', target: 'emergency-ward' };
        }
        if (query.includes('checkup') || query.includes('appointment') || query.includes('meet')) {
            return { intent: 'CONSULTATION', urgency: 'LOW', target: 'reception' };
        }
        if (query.includes('xray') || query.includes('scan') || query.includes('mri')) {
            return { intent: 'DIAGNOSTICS', urgency: 'MEDIUM', target: 'radiology' };
        }
        if (query.includes('visit') || query.includes('friend') || query.includes('family')) {
            return { intent: 'VISITATION', urgency: 'LOW', target: 'info-desk' };
        }

        return { intent: 'GENERAL_NAV', urgency: 'LOW', target: 'map-view' };
    }
}

module.exports = new PredictionEngine();
