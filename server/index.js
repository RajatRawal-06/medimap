const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
}

// AI Engines
const predictionEngine = require('./engines/PredictionEngine');
const intentClassifier = require('./engines/IntentClassifier');
const journeyCluster = require('./engines/JourneyCluster');
const crowdRouter = require('./engines/CrowdRouter');
const crowdMonitor = require('./engines/CrowdMonitor');

// Data
const { DEPARTMENTS } = require('./journeyData');

// Initialize Real-time Monitoring
(async () => {
    await crowdMonitor.startMonitoring();
})();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. PREDICT NEXT STEP (Enhanced — Now with Live Data)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/predict-next', async (req, res) => {
    const { currentLocation, userRole, appointmentType, doctorType, journeySoFar } = req.body;

    if (!currentLocation || !userRole) {
        return res.status(400).json({ error: 'Missing currentLocation or userRole' });
    }

    const prediction = predictionEngine.predictNextStep(currentLocation, userRole, {
        doctorType,
        appointmentType,
        journeySoFar: journeySoFar || [],
    });

    // Use Live Data if available, fallback to simulation
    const liveAlt = crowdMonitor.findLiveAlternative(prediction.nextNode);
    const rerouteCheck = crowdRouter.evaluate(currentLocation, prediction.nextNode, userRole, {
        appointmentType,
    });

    // Override alternative if live monitor found a better one
    if (liveAlt) {
        rerouteCheck.shouldReroute = true;
        rerouteCheck.alternative = {
            node: liveAlt.nodeId,
            name: liveAlt.name,
            reason: `Live data: ${liveAlt.name} has lower load (${Math.round(liveAlt.load * 100)}%).`,
            crowdLevel: liveAlt.load,
            loadLevel: liveAlt.load
        };
    }

    res.json({
        prediction,
        reroute: rerouteCheck,
        liveMetrics: (await crowdMonitor.getLiveSnapshot()).find(m => m.nodeId === prediction.nextNode) || null,
        timestamp: new Date().toISOString(),
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. INTENT CLASSIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/analyze-intent', (req, res) => {
    const { query, doctorType, appointmentType } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Missing query' });
    }

    const classification = intentClassifier.classify(query, {
        doctorType,
        appointmentType,
    });

    res.json({
        ...classification,
        timestamp: new Date().toISOString(),
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. ROUTE WEIGHTS — Live Real-Time Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/route-weights', async (req, res) => {
    const snapshot = await crowdMonitor.getLiveSnapshot();
    const heatmap = await crowdMonitor.getHeatmapIntensity();

    res.json({
        livedata: true,
        crowdedNodes: snapshot,
        heatmap: heatmap,
        congestedDepartments: snapshot.filter(s => s.density > 0.7),
        timestamp: new Date().toISOString(),
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. JOURNEY CLUSTER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/journey/cluster', (req, res) => {
    const { doctorType, appointmentType, journeySoFar } = req.body;

    if (!appointmentType) {
        return res.status(400).json({ error: 'Missing appointmentType' });
    }

    const clusterInfo = journeyCluster.classify(
        doctorType || null,
        appointmentType,
        journeySoFar || []
    );

    res.json({
        ...clusterInfo,
        timestamp: new Date().toISOString(),
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. JOURNEY SUGGEST — Full Journey Path Suggestion (NEW)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/journey/suggest-path', (req, res) => {
    const { doctorType, appointmentType, currentLocation, userRole } = req.body;

    if (!appointmentType || !currentLocation) {
        return res.status(400).json({ error: 'Missing appointmentType or currentLocation' });
    }

    // Get cluster-based journey prediction
    const clusterInfo = journeyCluster.classify(
        doctorType || null,
        appointmentType,
        [currentLocation]
    );

    // Check each upcoming step for crowd issues
    const pathWithCrowdCheck = clusterInfo.predictedRemaining.map(step => {
        const crowd = crowdRouter.evaluate(currentLocation, step, userRole || 'patient_new', {
            appointmentType,
        });
        return {
            department: step,
            name: DEPARTMENTS[step]?.name || step,
            floor: DEPARTMENTS[step]?.floor ?? 0,
            congested: crowd.shouldReroute,
            crowdLevel: crowd.crowdLevel,
            alternative: crowd.shouldReroute ? crowd.alternative : null,
        };
    });

    res.json({
        clusterId: clusterInfo.clusterId,
        predictedPath: pathWithCrowdCheck,
        totalSteps: pathWithCrowdCheck.length,
        avgDuration: clusterInfo.avgDuration,
        similarity: clusterInfo.similarity,
        timestamp: new Date().toISOString(),
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. REROUTE — Crowd-Aware Alternative Route (NEW)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/api/reroute', (req, res) => {
    const { currentNode, intendedNext, userRole, urgency, appointmentType } = req.body;

    if (!currentNode || !intendedNext) {
        return res.status(400).json({ error: 'Missing currentNode or intendedNext' });
    }

    const result = crowdRouter.evaluate(
        currentNode,
        intendedNext,
        userRole || 'patient_new',
        { urgency, appointmentType }
    );

    res.json({
        ...result,
        timestamp: new Date().toISOString(),
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Health Check
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'MediMap AI Navigation Intelligence',
        version: '2.0.0',
        engines: ['PredictionEngine', 'IntentClassifier', 'JourneyCluster', 'CrowdRouter'],
        endpoints: [
            'POST /api/predict-next',
            'POST /api/analyze-intent',
            'GET  /api/route-weights',
            'POST /api/journey/cluster',
            'POST /api/journey/suggest-path',
            'POST /api/reroute',
        ],
        timestamp: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`\n🤖 MediMap AI Navigation Intelligence v2.0`);
    console.log(`   Server running on http://localhost:${PORT}`);
    console.log(`   Engines loaded: PredictionEngine, IntentClassifier, JourneyCluster, CrowdRouter`);
    console.log(`   Endpoints: 6 active\n`);
});
