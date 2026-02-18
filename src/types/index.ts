export interface Hospital {
    id: string;
    name: string;
    address: string | null;
    image_url: string | null;
    description: string | null;
    location_lat: number | null;
    location_lng: number | null;
    emergency_phone: string | null;
    slug?: string; // Added for SEO-friendly URLs
    created_at: string;
}

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    hospital_id: string;
    availability_status: string;
    image_url: string | null;
    experience_years: number;
    rating: number;
    ratings_count: number;
    live_queue: number;
    slug?: string; // Added for SEO
    bio?: string; // Added for profile
    created_at: string;
    hospitals?: Hospital; // For join
}

export interface Department {
    id: string;
    hospital_id: string;
    name: string;
    created_at: string;
}

export interface Review {
    id: string;
    doctor_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user_name?: string; // Optional for display if joined
}

export interface Appointment {
    id: string;
    user_id: string;
    doctor_id: string;
    hospital_id: string;
    appointment_date: string;
    appointment_time: string;
    status: 'booked' | 'cancelled' | 'completed';
    created_at: string;
    doctors?: Doctor; // For join
}


