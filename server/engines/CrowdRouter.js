/**
 * CrowdRouter.js — Crowd-Aware Alternative Routing Engine
 * 
 * Detects congestion at intended destinations and suggests
 * alternative routes, time delays, or different-floor paths.
 */

const { DEPARTMENTS, getCurrentCrowdSnapshot, getDepartmentLoads, TRANSITION_MATRIX } = require('../journeyData');

class CrowdRouter {
    constructor() {
        this.CROWD_THRESHOLD = 0.70;    // Density above this = congested
        this.LOAD_THRESHOLD = 0.85;     // Department utilization above this = overloaded
    }

    /**
     * Check if a destination needs rerouting and suggest alternatives.
     * 
     * @param {string} currentNode - Where the user is right now
     * @param {string} intendedNext - Where the user wants to go
     * @param {string} userRole - 'patient_new', 'patient_followup', 'visitor'
     * @param {object} options - { appointmentType?, urgency? }
     * @returns {{ shouldReroute, severity, original, alternative?, reason, waitTime?, crowdLevel, loadLevel }}
     */
    evaluate(currentNode, intendedNext, userRole = 'patient_new', options = {}) {
        const crowdSnapshot = getCurrentCrowdSnapshot();
        const deptLoads = getDepartmentLoads();

        // Get crowd and load data for the intended destination
        const crowdEntry = crowdSnapshot.find(c => c.nodeId === intendedNext);
        const loadEntry = deptLoads[intendedNext];

        const crowdLevel = crowdEntry ? crowdEntry.density : 0;
        const loadLevel = loadEntry ? loadEntry.utilization : 0;

        const isCrowded = crowdLevel > this.CROWD_THRESHOLD;
        const isOverloaded = loadLevel > this.LOAD_THRESHOLD;

        // Emergency and high-urgency cases are NEVER rerouted
        if (options.urgency === 'HIGH' || intendedNext === 'emergency' || intendedNext === 'icu') {
            return {
                shouldReroute: false,
                severity: 'none',
                original: intendedNext,
                reason: 'High-urgency destination — no rerouting applied.',
                crowdLevel,
                loadLevel,
            };
        }

        // No congestion detected
        if (!isCrowded && !isOverloaded) {
            return {
                shouldReroute: false,
                severity: 'none',
                original: intendedNext,
                reason: `${intendedNext} is operating normally (crowd: ${(crowdLevel * 100).toFixed(0)}%, load: ${(loadLevel * 100).toFixed(0)}%).`,
                crowdLevel,
                loadLevel,
            };
        }

        // ── Congestion Detected — Find Alternatives ──
        const severity = (isCrowded && isOverloaded) ? 'high' : 'medium';
        const alternatives = this._findAlternatives(intendedNext, userRole, crowdSnapshot, deptLoads);
        const waitTime = this._estimateWaitTime(crowdLevel, loadLevel);

        if (alternatives.length > 0) {
            const best = alternatives[0];
            return {
                shouldReroute: true,
                severity,
                original: intendedNext,
                alternative: {
                    node: best.node,
                    name: best.name,
                    reason: best.reason,
                    crowdLevel: best.crowdLevel,
                    loadLevel: best.loadLevel,
                },
                allAlternatives: alternatives,
                reason: this._buildReason(intendedNext, crowdLevel, loadLevel, best),
                waitTime,
                crowdLevel,
                loadLevel,
            };
        }

        // No alternative found — suggest waiting
        return {
            shouldReroute: false,
            severity,
            original: intendedNext,
            reason: `${intendedNext} is congested but no viable alternatives found. Estimated wait: ${waitTime} minutes.`,
            waitTime,
            crowdLevel,
            loadLevel,
            suggestion: 'wait',
        };
    }

    /**
     * Find alternative departments that can serve the same function
     * but are less congested.
     */
    _findAlternatives(intendedNode, userRole, crowdSnapshot, deptLoads) {
        const intendedDept = DEPARTMENTS[intendedNode];
        if (!intendedDept) return [];

        const alternatives = [];

        // Strategy 1: Same-category department on different floor
        for (const [deptId, dept] of Object.entries(DEPARTMENTS)) {
            if (deptId === intendedNode) continue;
            if (dept.category !== intendedDept.category) continue;

            const crowd = crowdSnapshot.find(c => c.nodeId === deptId);
            const load = deptLoads[deptId];
            const crowdLevel = crowd ? crowd.density : 0;
            const loadLevel = load ? load.utilization : 0;

            if (crowdLevel < this.CROWD_THRESHOLD && loadLevel < this.LOAD_THRESHOLD) {
                alternatives.push({
                    node: deptId,
                    name: dept.name,
                    floor: dept.floor,
                    crowdLevel,
                    loadLevel,
                    reason: `Same category (${dept.category}) on floor ${dept.floor}, less congested.`,
                    score: (1 - crowdLevel) * 0.6 + (1 - loadLevel) * 0.4,
                });
            }
        }

        // Strategy 2: Next logical step in user's journey (skip current)
        const transitions = TRANSITION_MATRIX[intendedNode]?.[userRole];
        if (transitions) {
            for (const [nextNode, prob] of Object.entries(transitions)) {
                if (nextNode === intendedNode) continue;

                const crowd = crowdSnapshot.find(c => c.nodeId === nextNode);
                const load = deptLoads[nextNode];
                const crowdLevel = crowd ? crowd.density : 0;
                const loadLevel = load ? load.utilization : 0;

                if (crowdLevel < this.CROWD_THRESHOLD) {
                    alternatives.push({
                        node: nextNode,
                        name: DEPARTMENTS[nextNode]?.name || nextNode,
                        crowdLevel,
                        loadLevel,
                        reason: `Skip ahead to ${nextNode} (${(prob * 100).toFixed(0)}% typically visit next).`,
                        score: prob * (1 - crowdLevel),
                    });
                }
            }
        }

        // Sort by score (best first)
        alternatives.sort((a, b) => b.score - a.score);

        return alternatives.slice(0, 3); // Top 3
    }

    /**
     * Estimate wait time in minutes based on congestion levels.
     */
    _estimateWaitTime(crowdLevel, loadLevel) {
        const congestionFactor = Math.max(crowdLevel, loadLevel);

        if (congestionFactor > 0.9) return Math.round(25 + Math.random() * 15);
        if (congestionFactor > 0.8) return Math.round(15 + Math.random() * 10);
        if (congestionFactor > 0.7) return Math.round(8 + Math.random() * 7);
        return Math.round(3 + Math.random() * 5);
    }

    /**
     * Build a human-readable rerouting reason.
     */
    _buildReason(intended, crowdLevel, loadLevel, alternative) {
        const parts = [];
        parts.push(`"${intended}" is congested (crowd: ${(crowdLevel * 100).toFixed(0)}%, load: ${(loadLevel * 100).toFixed(0)}%).`);
        parts.push(`Suggesting "${alternative.node}" instead: ${alternative.reason}`);
        return parts.join(' ');
    }

    /**
     * Get full congestion report for all departments.
     */
    getCongestedDepartments() {
        const crowdSnapshot = getCurrentCrowdSnapshot();
        const deptLoads = getDepartmentLoads();

        return crowdSnapshot
            .filter(c => c.density > this.CROWD_THRESHOLD || (deptLoads[c.nodeId]?.utilization || 0) > this.LOAD_THRESHOLD)
            .map(c => ({
                nodeId: c.nodeId,
                name: DEPARTMENTS[c.nodeId]?.name || c.nodeId,
                crowdDensity: c.density,
                utilization: deptLoads[c.nodeId]?.utilization || 0,
                isOverloaded: deptLoads[c.nodeId]?.isOverloaded || false,
            }));
    }
}

module.exports = new CrowdRouter();
