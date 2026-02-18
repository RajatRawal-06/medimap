/**
 * JourneyCluster.js — Patient Journey Clustering Engine
 * 
 * Clusters historical patient journeys using sequence similarity,
 * then matches new patients to the closest cluster for prediction.
 * 
 * Uses Levenshtein-style distance on department sequences —
 * no ML libraries needed.
 */

const { JOURNEY_TEMPLATES } = require('../journeyData');

class JourneyCluster {
    constructor() {
        this.clusters = new Map(); // clusterKey → journeys[]
        this._buildClusters();
    }

    /**
     * Build clusters by grouping journeys by (doctorType, appointmentType)
     * Then compute centroid (most common sequence) for each group.
     */
    _buildClusters() {
        for (const journey of JOURNEY_TEMPLATES) {
            const key = `${journey.doctorType || 'none'}::${journey.appointmentType}`;

            if (!this.clusters.has(key)) {
                this.clusters.set(key, []);
            }
            this.clusters.get(key).push(journey);
        }
    }

    /**
     * Compute sequence edit distance between two department arrays.
     * Simplified Levenshtein distance normalized to [0, 1].
     */
    _sequenceDistance(seqA, seqB) {
        const m = seqA.length;
        const n = seqB.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = seqA[i - 1] === seqB[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,       // deletion
                    dp[i][j - 1] + 1,       // insertion
                    dp[i - 1][j - 1] + cost  // substitution
                );
            }
        }

        const maxLen = Math.max(m, n);
        return maxLen === 0 ? 0 : dp[m][n] / maxLen;
    }

    /**
     * Find the centroid journey for a cluster — the one with minimum total
     * distance to all others in the group.
     */
    _findCentroid(journeys) {
        if (journeys.length === 1) return journeys[0];

        let bestJourney = journeys[0];
        let bestTotalDist = Infinity;

        for (const candidate of journeys) {
            let totalDist = 0;
            for (const other of journeys) {
                totalDist += this._sequenceDistance(candidate.sequence, other.sequence);
            }
            if (totalDist < bestTotalDist) {
                bestTotalDist = totalDist;
                bestJourney = candidate;
            }
        }

        return bestJourney;
    }

    /**
     * Classify a new patient into the best-matching journey cluster.
     * 
     * @param {string|null} doctorType - e.g., 'cardiologist', 'general'
     * @param {string} appointmentType - e.g., 'new_consultation', 'followup'
     * @param {string[]} currentSequence - steps taken so far (optional)
     * @returns {{ clusterId, centroidJourney, similarity, predictedRemaining, avgDuration }}
     */
    classify(doctorType, appointmentType, currentSequence = []) {
        const exactKey = `${doctorType || 'none'}::${appointmentType}`;

        // Try exact match first
        let matchedJourneys = this.clusters.get(exactKey);

        // Fallback: try matching by appointment type only
        if (!matchedJourneys || matchedJourneys.length === 0) {
            for (const [key, journeys] of this.clusters) {
                if (key.endsWith(`::${appointmentType}`)) {
                    matchedJourneys = journeys;
                    break;
                }
            }
        }

        // Ultimate fallback: general new consultation
        if (!matchedJourneys || matchedJourneys.length === 0) {
            matchedJourneys = this.clusters.get('general::new_consultation') || [];
        }

        if (matchedJourneys.length === 0) {
            return {
                clusterId: 'unknown',
                centroidJourney: null,
                similarity: 0,
                predictedRemaining: ['reception', 'consultation', 'pharmacy', 'exit'],
                avgDuration: 60,
            };
        }

        const centroid = this._findCentroid(matchedJourneys);

        // Calculate similarity to centroid based on current progress
        let similarity = 1.0;
        if (currentSequence.length > 0) {
            const distance = this._sequenceDistance(
                currentSequence,
                centroid.sequence.slice(0, currentSequence.length)
            );
            similarity = parseFloat((1 - distance).toFixed(2));
        }

        // Predict remaining steps
        let predictedRemaining = [];
        if (currentSequence.length > 0) {
            // Find where in the centroid sequence the patient currently is
            const lastStep = currentSequence[currentSequence.length - 1];
            const lastIdx = centroid.sequence.lastIndexOf(lastStep);
            if (lastIdx >= 0 && lastIdx < centroid.sequence.length - 1) {
                predictedRemaining = centroid.sequence.slice(lastIdx + 1);
            } else {
                // Can't map, return tail of centroid
                predictedRemaining = centroid.sequence.slice(Math.floor(centroid.sequence.length / 2));
            }
        } else {
            predictedRemaining = [...centroid.sequence];
        }

        // Average duration from cluster
        const avgDuration = Math.round(
            matchedJourneys.reduce((sum, j) => sum + j.duration, 0) / matchedJourneys.length
        );

        return {
            clusterId: exactKey,
            centroidJourney: centroid.sequence,
            similarity,
            predictedRemaining,
            avgDuration,
            clusterSize: matchedJourneys.length,
        };
    }

    /**
     * Given a current sequence, find the single best-matching journey 
     * across ALL clusters (for when we don't know doctorType/appointmentType).
     */
    findBestMatch(currentSequence) {
        let bestMatch = null;
        let bestSimilarity = -1;

        for (const [key, journeys] of this.clusters) {
            for (const journey of journeys) {
                const subSeq = journey.sequence.slice(0, currentSequence.length);
                const distance = this._sequenceDistance(currentSequence, subSeq);
                const sim = 1 - distance;

                if (sim > bestSimilarity) {
                    bestSimilarity = sim;
                    bestMatch = journey;
                }
            }
        }

        return bestMatch
            ? { journey: bestMatch, similarity: parseFloat(bestSimilarity.toFixed(2)) }
            : null;
    }
}

module.exports = new JourneyCluster();
