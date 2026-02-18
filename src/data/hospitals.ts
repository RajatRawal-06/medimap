import type { Hospital, Review } from '../types';

export interface HospitalExtended extends Hospital {
    rating: number;
    reviews_count: number;
    is_emergency_available: boolean;
    stats: {
        total_doctors: number;
        total_departments: number;
        beds_available: number;
        crowd_status: 'Low' | 'Medium' | 'High';
    };
    features: string[];
    reviews: Review[];
}

export const mockHospitals: HospitalExtended[] = [
    {
        id: 'mock-hosp-1',
        name: 'City General Medical Center',
        slug: 'city-general', // URL: /facilities/city-general
        address: '123 Healthcare Blvd, Metropolis',
        image_url: 'https://images.unsplash.com/photo-1587351021759-3e566b9af923?auto=format&fit=crop&q=80&w=1200',
        description: 'A premier medical facility offering world-class healthcare services. Leading the way in urban medicine.',
        location_lat: 40.7128,
        location_lng: -74.0060,
        emergency_phone: '+1 (555) 911-0001',
        created_at: new Date().toISOString(),
        rating: 4.8,
        reviews_count: 1250,
        is_emergency_available: true,
        stats: {
            total_doctors: 150,
            total_departments: 25,
            beds_available: 45,
            crowd_status: 'Medium'
        },
        features: ['Wheelchair Accessible', '24/7 Emergency', 'Pharmacy Inside', 'Trauma Center'],
        reviews: [
            { id: 'r1', doctor_id: '', user_id: 'u1', rating: 5, comment: 'Exceptional care from the moment I walked in. The nursing staff was attentive and kind.', created_at: '2025-10-15', user_name: 'Alice Cooper' },
            { id: 'r2', doctor_id: '', user_id: 'u2', rating: 4, comment: 'Facilities are top-notch, though the wait time was slightly longer than expected.', created_at: '2025-11-20', user_name: 'Marcus Ford' },
            { id: 'r3', doctor_id: '', user_id: 'u3', rating: 5, comment: 'Dr. Strange in Neurology is a genius. Fixed my issue in one visit.', created_at: '2025-12-05', user_name: 'Stephen V.' },
            { id: 'r4', doctor_id: '', user_id: 'u4', rating: 5, comment: 'Clean, modern, and very efficient emergency room process.', created_at: '2026-01-12', user_name: 'Sarah Connor' },
            { id: 'r5', doctor_id: '', user_id: 'u5', rating: 3, comment: 'Parking was a nightmare, but the medical service itself was good.', created_at: '2026-02-01', user_name: 'John R.' }
        ]
    },
    {
        id: 'mock-hosp-2',
        name: "St. Mary's Medical Center",
        slug: 'st-marys-medical', // URL: /facilities/st-marys-medical
        address: '45 Sacred Heart Way, New York',
        image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200',
        description: 'Compassionate care with a legacy of excellence. Specialized in pediatric and elderly care.',
        location_lat: 40.7589,
        location_lng: -73.9851,
        emergency_phone: '+1 (555) 911-0002',
        created_at: new Date().toISOString(),
        rating: 4.9,
        reviews_count: 890,
        is_emergency_available: true,
        stats: {
            total_doctors: 95,
            total_departments: 18,
            beds_available: 12,
            crowd_status: 'High'
        },
        features: ['Elevator Available', 'Braille Signage', 'Chapel', 'Parking Available'],
        reviews: [
            { id: 'r6', doctor_id: '', user_id: 'u6', rating: 5, comment: 'The nurses are absolute angels. They treated my mother with so much respect.', created_at: '2026-01-05', user_name: 'Sarah Jenkins' },
            { id: 'r7', doctor_id: '', user_id: 'u7', rating: 5, comment: 'Best pediatric ward in the city. My kids actually like coming here.', created_at: '2026-02-15', user_name: 'Mike Ross' },
            { id: 'r8', doctor_id: '', user_id: 'u8', rating: 4, comment: 'Very peaceful environment for recovery.', created_at: '2025-11-30', user_name: 'Emily B.' }
        ]
    },
    {
        id: 'mock-hosp-3',
        name: 'Valley Heart Institute',
        slug: 'valley-heart', // URL: /facilities/valley-heart
        address: '8800 Cardio Drive, Silicon Valley',
        image_url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1200',
        description: 'Specialized cardiac care center with cutting-edge research facilities and top-tier cardiologists.',
        location_lat: 37.3875,
        location_lng: -122.0575,
        emergency_phone: '+1 (555) 911-0003',
        created_at: new Date().toISOString(),
        rating: 4.7,
        reviews_count: 450,
        is_emergency_available: false, // Specialized center
        stats: {
            total_doctors: 45,
            total_departments: 5,
            beds_available: 20,
            crowd_status: 'Low'
        },
        features: ['Wheelchair Accessible', 'Parking Available', 'Valet Service', 'Cafeteria'],
        reviews: [
            { id: 'r9', doctor_id: '', user_id: 'u9', rating: 5, comment: 'They saved my life. Forever grateful to the surgery team.', created_at: '2026-02-10', user_name: 'John Doe' },
            { id: 'r10', doctor_id: '', user_id: 'u10', rating: 5, comment: 'State of the art technology everywhere.', created_at: '2026-01-20', user_name: 'Tech Enthusiast' },
            { id: 'r11', doctor_id: '', user_id: 'u11', rating: 2, comment: 'Expensive cafeteria food.', created_at: '2025-12-12', user_name: 'Gourmet Critic' }
        ]
    }
];

// Helper to find mock by slug
export function getMockHospitalBySlug(slug: string): HospitalExtended | null {
    return mockHospitals.find(h => h.slug === slug) || null;
}
