/**
 * test-engines.js — Unit tests for all 4 AI engines
 * Run: node test-engines.js
 */

const predictionEngine = require('./engines/PredictionEngine');
const intentClassifier = require('./engines/IntentClassifier');
const journeyCluster = require('./engines/JourneyCluster');
const crowdRouter = require('./engines/CrowdRouter');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✅ ${testName}`);
        passed++;
    } else {
        console.log(`  ❌ ${testName}`);
        failed++;
    }
}

// ── PredictionEngine Tests ──
console.log('\n🔮 PredictionEngine');

const pred1 = predictionEngine.predictNextStep('entrance', 'patient_new', {
    doctorType: 'general',
    appointmentType: 'new_consultation',
});
assert(pred1.nextNode !== undefined, 'Returns a nextNode');
assert(pred1.confidence > 0 && pred1.confidence <= 1, `Confidence in valid range: ${pred1.confidence}`);
assert(pred1.alternatives.length >= 0, `Has alternatives array (${pred1.alternatives.length} items)`);
assert(pred1.reasoning.length > 0, 'Has reasoning string');
assert(pred1.method === 'ensemble', 'Uses ensemble method');

const pred2 = predictionEngine.predictNextStep('consultation', 'patient_followup', {
    doctorType: 'cardiologist',
    appointmentType: 'followup',
    journeySoFar: ['entrance', 'reception', 'consultation'],
});
assert(pred2.nextNode !== undefined, `Follow-up prediction: ${pred2.nextNode}`);

// ── IntentClassifier Tests ──
console.log('\n🧠 IntentClassifier');

const intent1 = intentClassifier.classify('I need to see a doctor for chest pain');
assert(intent1.primaryIntent === 'EMERGENCY', `Emergency detection: ${intent1.primaryIntent}`);
assert(intent1.urgency === 'HIGH', `Urgency is HIGH`);
assert(intent1.confidence > 0.5, `High confidence: ${intent1.confidence}`);

const intent2 = intentClassifier.classify('Where can I pick up my prescription medicine?');
assert(intent2.primaryIntent === 'PHARMACY', `Pharmacy detection: ${intent2.primaryIntent}`);
assert(intent2.target === 'pharmacy', `Target is pharmacy`);

const intent3 = intentClassifier.classify('I want to visit my friend in the ward');
assert(intent3.primaryIntent === 'VISITATION', `Visitation detection: ${intent3.primaryIntent}`);

const intent4 = intentClassifier.classify('I need a blood test and an x-ray');
assert(intent4.intents.length >= 2, `Multi-intent detected (${intent4.intents.length} intents)`);

const intent5 = intentClassifier.classify('hello');
assert(intent5.primaryIntent === 'GENERAL_NAV', `Fallback to GENERAL_NAV: ${intent5.primaryIntent}`);

// ── JourneyCluster Tests ──
console.log('\n📊 JourneyCluster');

const cluster1 = journeyCluster.classify('general', 'new_consultation', []);
assert(cluster1.clusterId === 'general::new_consultation', `Correct cluster ID: ${cluster1.clusterId}`);
assert(cluster1.centroidJourney !== null, 'Has centroid journey');
assert(cluster1.predictedRemaining.length > 0, `Predicted remaining steps: ${cluster1.predictedRemaining.length}`);

const cluster2 = journeyCluster.classify('cardiologist', 'new_consultation', ['entrance', 'reception']);
assert(cluster2.similarity > 0, `Similarity score: ${cluster2.similarity}`);
assert(cluster2.avgDuration > 0, `Average duration: ${cluster2.avgDuration} min`);

const match = journeyCluster.findBestMatch(['entrance', 'emergency', 'radiology']);
assert(match !== null, `Best match found`);
assert(match.similarity > 0, `Match similarity: ${match.similarity}`);

// ── CrowdRouter Tests ──
console.log('\n🚦 CrowdRouter');

const route1 = crowdRouter.evaluate('entrance', 'reception', 'patient_new');
assert(route1.original === 'reception', 'Correct original destination');
assert(typeof route1.shouldReroute === 'boolean', 'Returns shouldReroute boolean');
assert(route1.crowdLevel >= 0 && route1.crowdLevel <= 1, `Crowd level valid: ${route1.crowdLevel}`);

// Emergency should NEVER be rerouted
const route2 = crowdRouter.evaluate('entrance', 'emergency', 'patient_new', { urgency: 'HIGH' });
assert(route2.shouldReroute === false, 'Emergency is never rerouted');

const route3 = crowdRouter.evaluate('entrance', 'icu', 'patient_new');
assert(route3.shouldReroute === false, 'ICU is never rerouted');

const congested = crowdRouter.getCongestedDepartments();
assert(Array.isArray(congested), `Congested list is array (${congested.length} depts)`);

// ── Summary ──
console.log(`\n${'━'.repeat(50)}`);
console.log(`  Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
console.log(`${'━'.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
