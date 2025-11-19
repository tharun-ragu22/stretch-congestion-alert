"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS directly here
import L from 'leaflet';

// --- Type Definitions ---
type LatLon = [number, number];

interface Intersection {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
}

interface MapDisplayProps {
//   intersections: Intersection[]; 
  initialCenter: LatLon;
  initialZoom: number;
}

// --- Custom Marker Icon Setup ---
// This prevents the default marker icon from failing to load due to missing paths.
// We use the icon paths provided by unpkg, which are standard for leaflet setup.
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});


// --- MapDisplay Component ---
const MapDisplay: React.FC<MapDisplayProps> = ({ initialCenter, initialZoom }) => {

    return (
        <div className="rounded-xl overflow-hidden shadow-lg border-2 border-indigo-200">
            <MapContainer 
                center={initialCenter} 
                zoom={initialZoom} 
                scrollWheelZoom={true}
                // Setting height is essential for Leaflet to initialize properly
                style={{ height: '500px', width: '100%' }} 
                className="z-0" 
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* {intersections.map((intersection) => (
                    <Marker 
                        key={intersection.id} // Ensures every item in the list has a unique key!
                        position={[intersection.latitude, intersection.longitude]} 
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="font-sans">
                                <p className="font-semibold text-indigo-700 mb-1">{intersection.name}</p>
                                <p className="text-xs text-gray-500">
                                    Lat: {intersection.latitude.toFixed(6)}, Lng: {intersection.longitude.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))} */}
            </MapContainer>
        </div>
    );
};

export default MapDisplay;