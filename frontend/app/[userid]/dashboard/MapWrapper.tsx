"use client"; 

import { GPSPointRow } from '@/app/DataTypes';
import tt from '@tomtom-international/web-sdk-maps';
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useCallback } from "react";

// --- Type Definitions ---
type LatLon = [number, number];

interface MapWrapperProps {
  intersections: GPSPointRow[];
  initialCenter: LatLon;
  initialZoom: number;
  apiKey: string;
  userid: string;
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
  const [pointDiv, setPointsDiv] = useState(<div></div>);
  const handleMapClick = (lngLat: tt.LngLat) => {
    setPoints((prevPoints) => [...prevPoints, lngLat].slice(-2));
  };

  const okClick = async () => {
    const response = await fetch(`/api/${props.userid}/intersections`, {
      method: "POST",
      body: JSON.stringify(points),
    });
    console.log(response.text);
  };

  const fetchData = useCallback(async () => {
    // 1. Construct the dynamic API URL
    const apiUrl = `/api/${props.userid}/intersections`;
    console.log(`Attempting to fetch data from: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        // Handle HTTP error statuses (400s, 500s)
        const errorBody = await response.json();
        throw new Error(
          `HTTP error ${response.status}: ${errorBody.error || "Unknown error"}`
        );
      }

      // 2. Parse the JSON response
      const result = await response.json();

      // 3. Update state with fetched data

      console.log("Data fetched successfully:", result);
    } catch (err) {
      console.error("Fetch operation failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log("points:", points);

    setPointsDiv(
      <div>
        <h2>Selected Ponts:</h2>
        <ul>
          {points &&
            points.map((p) => (
              <li>
                Lat: {p.lat}, Lng: {p.lng}
              </li>
            ))}
        </ul>
        {points.length === 2 && <button onClick={okClick}>Ok</button>}
      </div>
    );
  }, [points]);
  return (
    <div>
      <DynamicMapDisplay {...props} onMapClick={handleMapClick} />
      {pointDiv}
    </div>
  );
};

export default MapWrapper;