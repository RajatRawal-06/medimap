import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import PathOverlay from './PathOverlay';
import { useNavigationStore } from '../../store/useNavigationStore';

// Fix Leaflet's default icon path issues
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewerProps {
    lat?: number;
    lng?: number;
    label?: string;
}

export default function MapViewer({ lat = 51.505, lng = -0.09, label = "Location" }: MapViewerProps) {
    const { path } = useNavigationStore();

    return (
        <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full rounded-xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
                <Popup>
                    {label}
                </Popup>
            </Marker>
            <PathOverlay path={path} />
        </MapContainer>
    );
}
