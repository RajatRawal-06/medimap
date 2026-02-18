/**
 * journeyData.js — Rich data layer for MediMap AI Navigation
 * 
 * Contains:
 *   - Department definitions with capacity + floor info
 *   - Historical patient journey templates (training data)
 *   - Expanded Markov transition matrix (current → next by role)
 *   - Time-of-day crowd density model
 *   - Department load simulation
 */

// ─── Department Definitions ──────────────────────────────────────
const DEPARTMENTS = {
    'entrance': { id: 'entrance', name: 'Main Entrance', floor: 0, capacity: 200, category: 'access' },
    'reception': { id: 'reception', name: 'Reception', floor: 0, capacity: 30, category: 'admin' },
    'triage': { id: 'triage', name: 'Triage', floor: 0, capacity: 15, category: 'clinical' },
    'emergency': { id: 'emergency', name: 'Emergency Ward', floor: 0, capacity: 40, category: 'clinical' },
    'consultation': { id: 'consultation', name: 'Consultation Rooms', floor: 1, capacity: 20, category: 'clinical' },
    'radiology': { id: 'radiology', name: 'Radiology (X-Ray/MRI)', floor: 1, capacity: 10, category: 'diagnostics' },
    'lab': { id: 'lab', name: 'Pathology Lab', floor: 1, capacity: 12, category: 'diagnostics' },
    'pharmacy': { id: 'pharmacy', name: 'Pharmacy', floor: 0, capacity: 25, category: 'services' },
    'billing': { id: 'billing', name: 'Billing & Cashier', floor: 0, capacity: 15, category: 'admin' },
    'ward': { id: 'ward', name: 'Patient Wards', floor: 2, capacity: 60, category: 'clinical' },
    'icu': { id: 'icu', name: 'ICU', floor: 2, capacity: 12, category: 'clinical' },
    'ot': { id: 'ot', name: 'Operation Theatre', floor: 2, capacity: 6, category: 'clinical' },
    'cafeteria': { id: 'cafeteria', name: 'Cafeteria', floor: 0, capacity: 80, category: 'services' },
    'info-desk': { id: 'info-desk', name: 'Information Desk', floor: 0, capacity: 10, category: 'admin' },
    'exit': { id: 'exit', name: 'Exit', floor: 0, capacity: 200, category: 'access' },
};

// ─── Doctor Type → Department Mapping ─────────────────────────────
const DOCTOR_DEPARTMENT_MAP = {
    'general': ['consultation'],
    'cardiologist': ['consultation', 'radiology'],
    'orthopedic': ['consultation', 'radiology', 'ot'],
    'dermatologist': ['consultation'],
    'neurologist': ['consultation', 'radiology', 'lab'],
    'pediatrician': ['consultation', 'lab'],
    'surgeon': ['consultation', 'ot', 'ward'],
    'radiologist': ['radiology'],
    'pathologist': ['lab'],
    'psychiatrist': ['consultation'],
    'ent': ['consultation', 'radiology'],
    'ophthalmologist': ['consultation'],
};

// ─── Appointment Type Patterns ────────────────────────────────────
const APPOINTMENT_PATTERNS = {
    'new_consultation': {
        typicalSequence: ['entrance', 'reception', 'triage', 'consultation', 'pharmacy', 'billing', 'exit'],
        avgDuration: 90, // minutes
    },
    'followup': {
        typicalSequence: ['entrance', 'reception', 'consultation', 'pharmacy', 'exit'],
        avgDuration: 45,
    },
    'diagnostic_test': {
        typicalSequence: ['entrance', 'reception', 'radiology', 'lab', 'billing', 'exit'],
        avgDuration: 60,
    },
    'emergency': {
        typicalSequence: ['entrance', 'emergency', 'radiology', 'icu', 'ward'],
        avgDuration: 180,
    },
    'surgery': {
        typicalSequence: ['entrance', 'reception', 'consultation', 'lab', 'ot', 'ward', 'billing', 'exit'],
        avgDuration: 360,
    },
    'lab_only': {
        typicalSequence: ['entrance', 'reception', 'lab', 'billing', 'exit'],
        avgDuration: 30,
    },
    'pharmacy_pickup': {
        typicalSequence: ['entrance', 'pharmacy', 'exit'],
        avgDuration: 15,
    },
    'visitor': {
        typicalSequence: ['entrance', 'info-desk', 'ward', 'cafeteria', 'exit'],
        avgDuration: 60,
    },
};

// ─── Historical Journey Templates (Training Data) ────────────────
// Each journey represents a completed patient visit
const JOURNEY_TEMPLATES = [
    // New patient – General
    {
        id: 'j01', doctorType: 'general', appointmentType: 'new_consultation', role: 'patient_new',
        sequence: ['entrance', 'reception', 'triage', 'consultation', 'pharmacy', 'billing', 'exit'], duration: 85
    },
    {
        id: 'j02', doctorType: 'general', appointmentType: 'new_consultation', role: 'patient_new',
        sequence: ['entrance', 'reception', 'triage', 'consultation', 'lab', 'pharmacy', 'billing', 'exit'], duration: 110
    },

    // Follow-up – General
    {
        id: 'j03', doctorType: 'general', appointmentType: 'followup', role: 'patient_followup',
        sequence: ['entrance', 'reception', 'consultation', 'pharmacy', 'exit'], duration: 40
    },
    {
        id: 'j04', doctorType: 'general', appointmentType: 'followup', role: 'patient_followup',
        sequence: ['entrance', 'reception', 'consultation', 'exit'], duration: 30
    },

    // Cardiologist
    {
        id: 'j05', doctorType: 'cardiologist', appointmentType: 'new_consultation', role: 'patient_new',
        sequence: ['entrance', 'reception', 'triage', 'consultation', 'radiology', 'consultation', 'pharmacy', 'billing', 'exit'], duration: 120
    },
    {
        id: 'j06', doctorType: 'cardiologist', appointmentType: 'followup', role: 'patient_followup',
        sequence: ['entrance', 'reception', 'consultation', 'radiology', 'consultation', 'pharmacy', 'exit'], duration: 75
    },

    // Orthopedic
    {
        id: 'j07', doctorType: 'orthopedic', appointmentType: 'new_consultation', role: 'patient_new',
        sequence: ['entrance', 'reception', 'triage', 'consultation', 'radiology', 'consultation', 'pharmacy', 'billing', 'exit'], duration: 130
    },
    {
        id: 'j08', doctorType: 'orthopedic', appointmentType: 'surgery', role: 'patient_new',
        sequence: ['entrance', 'reception', 'consultation', 'lab', 'radiology', 'ot', 'ward', 'billing', 'exit'], duration: 400
    },

    // Diagnostics
    {
        id: 'j09', doctorType: 'radiologist', appointmentType: 'diagnostic_test', role: 'patient_followup',
        sequence: ['entrance', 'reception', 'radiology', 'billing', 'exit'], duration: 50
    },
    {
        id: 'j10', doctorType: 'pathologist', appointmentType: 'lab_only', role: 'patient_followup',
        sequence: ['entrance', 'reception', 'lab', 'billing', 'exit'], duration: 25
    },

    // Emergency
    {
        id: 'j11', doctorType: 'general', appointmentType: 'emergency', role: 'patient_new',
        sequence: ['entrance', 'emergency', 'triage', 'radiology', 'emergency', 'ward'], duration: 200
    },
    {
        id: 'j12', doctorType: 'surgeon', appointmentType: 'emergency', role: 'patient_new',
        sequence: ['entrance', 'emergency', 'radiology', 'ot', 'icu', 'ward'], duration: 480
    },

    // Neurologist
    {
        id: 'j13', doctorType: 'neurologist', appointmentType: 'new_consultation', role: 'patient_new',
        sequence: ['entrance', 'reception', 'triage', 'consultation', 'radiology', 'lab', 'consultation', 'pharmacy', 'billing', 'exit'], duration: 150
    },
    {
        id: 'j14', doctorType: 'neurologist', appointmentType: 'followup', role: 'patient_followup',
        sequence: ['entrance', 'reception', 'consultation', 'lab', 'pharmacy', 'exit'], duration: 60
    },

    // Pediatrician
    {
        id: 'j15', doctorType: 'pediatrician', appointmentType: 'new_consultation', role: 'patient_new',
        sequence: ['entrance', 'reception', 'triage', 'consultation', 'lab', 'pharmacy', 'billing', 'exit'], duration: 95
    },

    // Visitor
    {
        id: 'j16', doctorType: null, appointmentType: 'visitor', role: 'visitor',
        sequence: ['entrance', 'info-desk', 'ward', 'cafeteria', 'exit'], duration: 55
    },
    {
        id: 'j17', doctorType: null, appointmentType: 'visitor', role: 'visitor',
        sequence: ['entrance', 'info-desk', 'ward', 'exit'], duration: 40
    },
    {
        id: 'j18', doctorType: null, appointmentType: 'visitor', role: 'visitor',
        sequence: ['entrance', 'info-desk', 'icu', 'cafeteria', 'exit'], duration: 65
    },

    // Pharmacy only
    {
        id: 'j19', doctorType: null, appointmentType: 'pharmacy_pickup', role: 'patient_followup',
        sequence: ['entrance', 'pharmacy', 'exit'], duration: 12
    },

    // Dermatologist followup
    {
        id: 'j20', doctorType: 'dermatologist', appointmentType: 'followup', role: 'patient_followup',
        sequence: ['entrance', 'reception', 'consultation', 'pharmacy', 'billing', 'exit'], duration: 50
    },
];

// ─── Expanded Transition Matrix ───────────────────────────────────
// P(nextDepartment | currentDepartment, role)
const TRANSITION_MATRIX = {
    'entrance': {
        'patient_new': { 'reception': 0.70, 'emergency': 0.20, 'pharmacy': 0.05, 'info-desk': 0.05 },
        'patient_followup': { 'reception': 0.55, 'pharmacy': 0.20, 'radiology': 0.15, 'lab': 0.10 },
        'visitor': { 'info-desk': 0.60, 'ward': 0.25, 'cafeteria': 0.15 },
    },
    'reception': {
        'patient_new': { 'triage': 0.55, 'consultation': 0.30, 'emergency': 0.10, 'radiology': 0.05 },
        'patient_followup': { 'consultation': 0.60, 'radiology': 0.15, 'lab': 0.15, 'pharmacy': 0.10 },
        'visitor': { 'info-desk': 0.50, 'ward': 0.40, 'cafeteria': 0.10 },
    },
    'triage': {
        'patient_new': { 'consultation': 0.60, 'emergency': 0.30, 'radiology': 0.10 },
        'patient_followup': { 'consultation': 0.80, 'radiology': 0.15, 'lab': 0.05 },
    },
    'consultation': {
        'patient_new': { 'pharmacy': 0.30, 'lab': 0.25, 'radiology': 0.20, 'billing': 0.15, 'ot': 0.05, 'ward': 0.05 },
        'patient_followup': { 'pharmacy': 0.45, 'lab': 0.15, 'radiology': 0.15, 'billing': 0.10, 'exit': 0.15 },
    },
    'radiology': {
        'patient_new': { 'consultation': 0.50, 'lab': 0.15, 'emergency': 0.10, 'ot': 0.10, 'billing': 0.10, 'pharmacy': 0.05 },
        'patient_followup': { 'consultation': 0.45, 'billing': 0.25, 'pharmacy': 0.15, 'exit': 0.15 },
    },
    'lab': {
        'patient_new': { 'consultation': 0.45, 'pharmacy': 0.25, 'radiology': 0.10, 'billing': 0.15, 'ward': 0.05 },
        'patient_followup': { 'pharmacy': 0.40, 'consultation': 0.25, 'billing': 0.20, 'exit': 0.15 },
    },
    'pharmacy': {
        'patient_new': { 'billing': 0.60, 'exit': 0.30, 'consultation': 0.10 },
        'patient_followup': { 'exit': 0.60, 'billing': 0.30, 'consultation': 0.10 },
    },
    'billing': {
        'patient_new': { 'exit': 0.75, 'pharmacy': 0.15, 'cafeteria': 0.10 },
        'patient_followup': { 'exit': 0.80, 'pharmacy': 0.10, 'cafeteria': 0.10 },
    },
    'emergency': {
        'patient_new': { 'triage': 0.30, 'radiology': 0.25, 'icu': 0.20, 'ot': 0.15, 'ward': 0.10 },
    },
    'ot': {
        'patient_new': { 'ward': 0.50, 'icu': 0.40, 'billing': 0.10 },
    },
    'icu': {
        'patient_new': { 'ward': 0.70, 'ot': 0.20, 'billing': 0.10 },
    },
    'ward': {
        'patient_new': { 'billing': 0.50, 'pharmacy': 0.20, 'exit': 0.20, 'cafeteria': 0.10 },
        'visitor': { 'cafeteria': 0.40, 'exit': 0.50, 'info-desk': 0.10 },
    },
    'info-desk': {
        'visitor': { 'ward': 0.55, 'icu': 0.15, 'cafeteria': 0.20, 'exit': 0.10 },
    },
    'cafeteria': {
        'visitor': { 'exit': 0.60, 'ward': 0.30, 'info-desk': 0.10 },
        'patient_new': { 'exit': 0.70, 'billing': 0.20, 'pharmacy': 0.10 },
        'patient_followup': { 'exit': 0.80, 'pharmacy': 0.10, 'billing': 0.10 },
    },
};

// ─── Time-of-Day Crowd Model ─────────────────────────────────────
// Returns simulated crowd density (0.0 = empty, 1.0 = full) by hour
function getCrowdDensity(departmentId, hour) {
    const dept = DEPARTMENTS[departmentId];
    if (!dept) return 0.1;

    // Base density by department category
    const baseCurves = {
        'clinical': [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.4, 0.7, 0.9, 0.95, 0.85, 0.6, 0.7, 0.8, 0.7, 0.5, 0.3, 0.2, 0.15, 0.1, 0.1, 0.1, 0.1],
        'diagnostics': [0.05, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.3, 0.6, 0.8, 0.85, 0.75, 0.5, 0.6, 0.7, 0.6, 0.4, 0.2, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05],
        'admin': [0.1, 0.05, 0.05, 0.05, 0.05, 0.1, 0.3, 0.5, 0.8, 0.9, 0.85, 0.7, 0.5, 0.6, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1, 0.05, 0.05, 0.05, 0.05],
        'services': [0.1, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 0.8, 0.85, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1, 0.1, 0.05, 0.05],
        'access': [0.1, 0.05, 0.05, 0.05, 0.05, 0.1, 0.3, 0.5, 0.7, 0.8, 0.7, 0.5, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1, 0.1, 0.05, 0.05],
    };

    const curve = baseCurves[dept.category] || baseCurves['access'];
    const h = Math.max(0, Math.min(23, Math.floor(hour)));

    // Add jitter ±10%
    const jitter = (Math.random() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, curve[h] + jitter));
}

// Get current crowd snapshot for all departments
function getCurrentCrowdSnapshot() {
    const hour = new Date().getHours();
    const snapshot = [];

    for (const [deptId] of Object.entries(DEPARTMENTS)) {
        snapshot.push({
            nodeId: deptId,
            density: parseFloat(getCrowdDensity(deptId, hour).toFixed(2)),
            capacity: DEPARTMENTS[deptId].capacity,
        });
    }
    return snapshot;
}

// ─── Department Load Model ────────────────────────────────────────
// Simulates current utilization as fraction of capacity
function getDepartmentLoads() {
    const hour = new Date().getHours();
    const loads = {};

    for (const [deptId, dept] of Object.entries(DEPARTMENTS)) {
        const crowdDensity = getCrowdDensity(deptId, hour);
        const currentOccupancy = Math.round(crowdDensity * dept.capacity);
        loads[deptId] = {
            departmentId: deptId,
            name: dept.name,
            capacity: dept.capacity,
            currentOccupancy,
            utilization: parseFloat(crowdDensity.toFixed(2)),
            isOverloaded: crowdDensity > 0.85,
        };
    }
    return loads;
}

module.exports = {
    DEPARTMENTS,
    DOCTOR_DEPARTMENT_MAP,
    APPOINTMENT_PATTERNS,
    JOURNEY_TEMPLATES,
    TRANSITION_MATRIX,
    getCrowdDensity,
    getCurrentCrowdSnapshot,
    getDepartmentLoads,
};
