import { useState, useEffect } from 'react';

interface GeolocationState {
    coords: {
        latitude: number;
        longitude: number;
    } | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation() {
    const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    const [state, setState] = useState<GeolocationState>({
        coords: null,
        error: isSupported ? null : 'Geolocation is not supported',
        loading: isSupported,
    });

    useEffect(() => {
        if (!isSupported) return;

        const onSuccess = (position: GeolocationPosition) => {
            setState({
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                error: null,
                loading: false,
            });
        };

        const onError = (error: GeolocationPositionError) => {
            setState({
                coords: null,
                error: error.message,
                loading: false,
            });
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };

        const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isSupported]);

    return state;
}
