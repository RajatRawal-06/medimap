/**
 * IntentClassifier.js — Multi-Intent Classification Engine
 * 
 * Weighted keyword matching with context boosting.
 * Returns ranked intents with confidence scores.
 * No ML dependencies — pure algorithmic approach.
 */

const { DOCTOR_DEPARTMENT_MAP } = require('../journeyData');

// ─── Intent Keywords with Weights ─────────────────────────────────
const INTENT_KEYWORDS = {
    EMERGENCY: {
        keywords: {
            'emergency': 3.0, 'pain': 2.5, 'blood': 2.5, 'bleeding': 2.8,
            'accident': 3.0, 'collapse': 3.0, 'fracture': 2.5, 'breathing': 2.5,
            'chest': 2.0, 'unconscious': 3.0, 'critical': 2.8, 'urgent': 2.5,
            'heart attack': 3.0, 'stroke': 3.0, 'seizure': 2.8, 'trauma': 2.5,
            'fall': 2.0, 'burn': 2.5, 'choking': 3.0, 'allergic': 2.0,
        },
        target: 'emergency',
        urgency: 'HIGH',
    },
    CONSULTATION: {
        keywords: {
            'checkup': 2.0, 'appointment': 2.5, 'meet': 1.5, 'doctor': 2.0,
            'consult': 2.5, 'consultation': 2.5, 'visit doctor': 2.0,
            'followup': 2.0, 'follow-up': 2.0, 'follow up': 2.0,
            'symptoms': 1.5, 'diagnosis': 2.0, 'treatment': 1.8,
            'specialist': 2.0, 'opinion': 1.5, 'referral': 2.0,
        },
        target: 'consultation',
        urgency: 'LOW',
    },
    DIAGNOSTICS: {
        keywords: {
            'xray': 3.0, 'x-ray': 3.0, 'scan': 2.5, 'mri': 3.0,
            'ct': 2.5, 'ultrasound': 2.5, 'ecg': 2.5, 'eeg': 2.5,
            'imaging': 2.0, 'radiology': 2.5, 'sonography': 2.5,
            'mammography': 2.5, 'pet scan': 3.0, 'diagnostic': 2.0,
        },
        target: 'radiology',
        urgency: 'MEDIUM',
    },
    LAB: {
        keywords: {
            'blood test': 3.0, 'lab': 2.5, 'laboratory': 2.5, 'test': 1.5,
            'pathology': 2.5, 'sample': 2.0, 'urine': 2.0, 'biopsy': 2.5,
            'culture': 2.0, 'report': 1.5, 'results': 1.5, 'hemoglobin': 2.5,
            'cholesterol': 2.0, 'sugar level': 2.0, 'glucose': 2.0,
        },
        target: 'lab',
        urgency: 'MEDIUM',
    },
    PHARMACY: {
        keywords: {
            'medicine': 2.5, 'pharmacy': 3.0, 'prescription': 2.5,
            'drug': 2.0, 'tablet': 2.0, 'medication': 2.5, 'refill': 2.5,
            'pill': 2.0, 'capsule': 2.0, 'ointment': 2.0, 'pickup': 2.0,
            'dosage': 1.5, 'syrup': 2.0, 'injection': 2.0,
        },
        target: 'pharmacy',
        urgency: 'LOW',
    },
    BILLING: {
        keywords: {
            'bill': 2.5, 'billing': 3.0, 'pay': 2.5, 'payment': 2.5,
            'cashier': 2.5, 'insurance': 2.0, 'receipt': 2.0, 'claim': 2.0,
            'cost': 1.5, 'charge': 1.5, 'fee': 1.5, 'invoice': 2.0,
        },
        target: 'billing',
        urgency: 'LOW',
    },
    VISITATION: {
        keywords: {
            'visit': 1.5, 'visitor': 2.5, 'friend': 2.0, 'family': 2.0,
            'ward': 1.5, 'patient room': 2.0, 'see someone': 2.0,
            'relative': 2.0, 'someone admitted': 2.5, 'visiting hours': 2.5,
            'icu visit': 2.5, 'companion': 2.0,
        },
        target: 'info-desk',
        urgency: 'LOW',
    },
    ADMISSION: {
        keywords: {
            'admit': 3.0, 'admission': 3.0, 'bed': 2.0, 'room': 1.5,
            'stay': 2.0, 'overnight': 2.5, 'hospitalize': 3.0,
            'inpatient': 2.5, 'ward admission': 3.0, 'surgery': 2.0,
            'operation': 2.5, 'procedure': 2.0,
        },
        target: 'reception',
        urgency: 'MEDIUM',
    },
};

class IntentClassifier {
    /**
     * Classify a free-text query into ranked intents.
     * 
     * @param {string} query - User's natural language input
     * @param {object} context - Optional context { doctorType?, appointmentType? }
     * @returns {{ intents: Array<{intent, score, target, urgency}>, primaryIntent, reasoning }}
     */
    classify(query, context = {}) {
        const normalizedQuery = query.toLowerCase().trim();
        const scores = {};

        // Phase 1: Keyword scoring
        for (const [intentName, intentConfig] of Object.entries(INTENT_KEYWORDS)) {
            let score = 0;
            let matchedKeywords = [];

            for (const [keyword, weight] of Object.entries(intentConfig.keywords)) {
                if (normalizedQuery.includes(keyword)) {
                    score += weight;
                    matchedKeywords.push(keyword);
                }
            }

            if (score > 0) {
                scores[intentName] = {
                    intent: intentName,
                    rawScore: score,
                    matchedKeywords,
                    target: intentConfig.target,
                    urgency: intentConfig.urgency,
                };
            }
        }

        // Phase 2: Context boosting
        if (context.doctorType) {
            const relevantDepts = DOCTOR_DEPARTMENT_MAP[context.doctorType] || [];
            for (const [intentName, scoreObj] of Object.entries(scores)) {
                const intentTarget = INTENT_KEYWORDS[intentName].target;
                if (relevantDepts.includes(intentTarget)) {
                    scoreObj.rawScore *= 1.3; // 30% boost for context match
                }
            }
        }

        if (context.appointmentType) {
            // Boost emergency intent if appointmentType is emergency
            if (context.appointmentType === 'emergency' && scores['EMERGENCY']) {
                scores['EMERGENCY'].rawScore *= 1.5;
            }
            if (context.appointmentType === 'diagnostic_test' && scores['DIAGNOSTICS']) {
                scores['DIAGNOSTICS'].rawScore *= 1.4;
            }
            if (context.appointmentType === 'lab_only' && scores['LAB']) {
                scores['LAB'].rawScore *= 1.4;
            }
        }

        // Phase 3: Normalize scores to confidence (0-1)
        const sortedIntents = Object.values(scores)
            .sort((a, b) => b.rawScore - a.rawScore);

        const maxScore = sortedIntents.length > 0 ? sortedIntents[0].rawScore : 1;
        const rankedIntents = sortedIntents.map(s => ({
            intent: s.intent,
            confidence: parseFloat(Math.min(1, s.rawScore / Math.max(maxScore, 3)).toFixed(2)),
            target: s.target,
            urgency: s.urgency,
            matchedKeywords: s.matchedKeywords,
        }));

        // Fallback if no intent matched
        if (rankedIntents.length === 0) {
            rankedIntents.push({
                intent: 'GENERAL_NAV',
                confidence: 0.3,
                target: 'info-desk',
                urgency: 'LOW',
                matchedKeywords: [],
            });
        }

        const primary = rankedIntents[0];

        return {
            intents: rankedIntents,
            primaryIntent: primary.intent,
            target: primary.target,
            urgency: primary.urgency,
            confidence: primary.confidence,
            reasoning: this._generateReasoning(primary, rankedIntents),
        };
    }

    _generateReasoning(primary, allIntents) {
        const parts = [`Detected "${primary.intent}" intent with ${(primary.confidence * 100).toFixed(0)}% confidence.`];

        if (primary.matchedKeywords.length > 0) {
            parts.push(`Keywords matched: ${primary.matchedKeywords.join(', ')}.`);
        }

        if (allIntents.length > 1) {
            const secondary = allIntents[1];
            parts.push(`Secondary possibility: "${secondary.intent}" (${(secondary.confidence * 100).toFixed(0)}%).`);
        }

        parts.push(`Suggested target: ${primary.target}.`);

        return parts.join(' ');
    }
}

module.exports = new IntentClassifier();
