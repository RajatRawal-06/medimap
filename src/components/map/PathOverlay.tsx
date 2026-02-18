import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { NavigationPath } from '../../navigation/types';

interface PathOverlayProps {
    path: NavigationPath | null;
}

export default function PathOverlay({ path }: PathOverlayProps) {
    const map = useMap();

    useEffect(() => {
        if (!path || path.steps.length < 2) return;

        // Convert path steps to LatLng array
        // Assuming x,y are mapped to lat,lng somehow. 
        // For this MVP, let's assume direct mapping or simple scaling if needed.
        // In a real app, you'd project local coords to Geo coords.
        const latlngs = path.steps.map(step => [step.x, step.y] as [number, number]);

        const polyline = L.polyline(latlngs, {
            color: 'blue',
            weight: 5,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round'
        }).addTo(map);

        // Fit bounds to show the whole path
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        // Cleanup
        return () => {
            map.removeLayer(polyline);
        };
    }, [map, path]);

    return null;
}
