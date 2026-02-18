export type RoomType = 'OPD' | 'ICU' | 'Lab' | 'Pharmacy' | 'Emergency' | 'Surgery' | 'Wards' | 'Cafeteria' | 'Restroom' | 'Elevator' | 'Stairs';

export interface MapNode {
    id: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    type: RoomType;
    label: string;
    floor: number;
    crowdLevel: 'Low' | 'Medium' | 'High';
}

export const HOSPITAL_FLOOR_DATA: Record<number, MapNode[]> = {
    1: [
        { id: 'start-entrance', x: 50, y: 95, type: 'Restroom', label: 'Main Entrance', floor: 1, crowdLevel: 'Low' },
        { id: 'reception', x: 50, y: 80, type: 'OPD', label: 'Reception', floor: 1, crowdLevel: 'High' },
        { id: 'pharmacy', x: 20, y: 70, type: 'Pharmacy', label: 'Pharmacy', floor: 1, crowdLevel: 'Medium' },
        { id: 'emergency', x: 80, y: 70, type: 'Emergency', label: 'Emergency (ER)', floor: 1, crowdLevel: 'High' },
        { id: 'elevator-1', x: 10, y: 50, type: 'Elevator', label: 'Elevator A', floor: 1, crowdLevel: 'Low' },
        { id: 'cafeteria', x: 90, y: 50, type: 'Cafeteria', label: 'Cafeteria', floor: 1, crowdLevel: 'Medium' },
    ],
    2: [
        { id: 'elevator-2', x: 10, y: 50, type: 'Elevator', label: 'Elevator A', floor: 2, crowdLevel: 'Low' },
        { id: 'opd-general', x: 30, y: 30, type: 'OPD', label: 'General OPD', floor: 2, crowdLevel: 'High' },
        { id: 'opd-specialty', x: 70, y: 30, type: 'OPD', label: 'Specialty Clinics', floor: 2, crowdLevel: 'Medium' },
        { id: 'lab', x: 50, y: 60, type: 'Lab', label: 'Pathology Lab', floor: 2, crowdLevel: 'Low' },
    ],
    3: [
        { id: 'id-icu', x: 50, y: 20, type: 'ICU', label: 'Intensive Care Unit', floor: 3, crowdLevel: 'Low' },
        { id: 'surgery', x: 80, y: 20, type: 'Surgery', label: 'Surgery Suites', floor: 3, crowdLevel: 'Low' },
        { id: 'wards', x: 20, y: 50, type: 'Wards', label: 'Inpatient Wards', floor: 3, crowdLevel: 'Medium' },
        { id: 'elevator-3', x: 10, y: 50, type: 'Elevator', label: 'Elevator A', floor: 3, crowdLevel: 'Low' },
    ]
};

export const MOCK_PATHS: Record<string, string> = {
    // Paths must match ${startNodeId}-to-${endNodeId} format
    'start-entrance-to-emergency': "M 50 95 L 50 80 L 80 80 L 80 70",
    'start-entrance-to-pharmacy': "M 50 95 L 50 80 L 20 80 L 20 70",
    'reception-to-elevator-1': "M 50 80 L 10 80 L 10 50",
    'start-entrance-to-reception': "M 50 95 L 50 80",
    'reception-to-pharmacy': "M 50 80 L 20 80 L 20 70",
    'reception-to-emergency': "M 50 80 L 80 80 L 80 70",
    'elevator-1-to-cafeteria': "M 10 50 L 90 50",
    'elevator-1-to-emergency': "M 10 50 L 10 70 L 80 70",
};
