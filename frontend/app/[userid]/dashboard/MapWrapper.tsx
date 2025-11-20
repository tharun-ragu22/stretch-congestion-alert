"use client"; 

import { GPSPointRow } from '@/app/DataTypes';
import tt from '@tomtom-international/web-sdk-maps';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from "react";

// --- Type Definitions ---
type LatLon = [number, number];

interface MapWrapperProps {
  intersections: GPSPointRow[];
  initialCenter: LatLon;
  initialZoom: number;
  apiKey: string;
}

// Dynamically import the MapDisplay component.
// CRITICAL: ssr: false is correctly placed inside this "use client" component.
const DynamicMapDisplay = dynamic(() => import("./MapDisplay"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[500px] w-full bg-gray-100 rounded-xl shadow-lg p-6">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-gray-300"></div>
      <p className="mt-4 text-xl font-semibold text-gray-700">
        Loading Map Display...
      </p>
    </div>
  ),
});

// MapWrapper component simply passes props to the dynamically loaded component.
const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  const [points, setPoints] = useState<tt.LngLat[]>([]);
  const [pointDiv, setPointsDiv] = useState(<div></div>)
  const handleMapClick = (lngLat: tt.LngLat) => {
    setPoints((prevPoints) => [...prevPoints, lngLat].slice(-2));
    
  };

  useEffect(()=> {
    console.log("points:", points);
    setPointsDiv(
      <div>
        <h2>Selected Ponts:</h2>
      <ul>
        {points && points.map((p) => (
          <li>
            Lat: {p.lat}, Lng: {p.lng}
          </li>
        ))}
      </ul>
      </div>
    )
  }, [points])
  return (
    <div>
      <DynamicMapDisplay {...props} onMapClick={handleMapClick} />
      {pointDiv}
    </div>
  );
};

export default MapWrapper;