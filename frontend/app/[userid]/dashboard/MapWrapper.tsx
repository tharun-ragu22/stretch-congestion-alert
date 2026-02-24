"use client"; 

import tt from '@tomtom-international/web-sdk-maps';
import React, { useState, useEffect, useCallback } from "react";
import MapDisplay from './MapDisplay';

// --- Type Definitions ---
type LatLon = [number, number];

interface MapWrapperProps {
  initialCenter: LatLon;
  initialZoom: number;
  apiKey: string;
  userid: string;
  bounds: [number, number, number, number] | null;
}

const loadingComponent = (
  <div className="flex items-center justify-center h-64 w-full bg-white rounded-2xl shadow-lg p-6">
    <div className="flex items-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-indigo-600 border-gray-200"></div>
      <div>
        <p className="text-lg font-semibold text-gray-900">Loading Map</p>
        <p className="text-sm text-gray-500">Fetching tiles and routes…</p>
      </div>
    </div>
  </div>
);

// MapWrapper component simply passes props to the dynamically loaded component.
const MapWrapper: React.FC<MapWrapperProps> = (props) => {
  const [points, setPoints] = useState<tt.LngLat[]>([]);
  const [intersections, setIntersections] = useState<Object[]>([]);
  const [isAddPointsLoading, setIsAddPointsLoading] = useState(false);
  const [pointDiv, setPointsDiv] = useState(<div></div>);
  const [mapDiv, setMapDiv] = useState(<div></div>);
  const handleMapClick = (lngLat: tt.LngLat) => {
    setPoints((prevPoints) => [...prevPoints, lngLat].slice(-2));
  };

  const okClick = async () => {
    setIsAddPointsLoading(true);
    const response = await fetch(`/api/users/${props.userid}/intersections`, {
      method: "POST",
      body: JSON.stringify(points),
    });
    console.log(response.text);
    if (response.ok) {
      console.log("click worked");
      await fetchIntersections();
      setPoints([]);
      setIsAddPointsLoading(false);
    }
  };

  const fetchIntersections = useCallback(async () => {
    // 1. Construct the dynamic API URL
    const apiUrl = `/api/users/${props.userid}/intersections`;
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
      setIntersections(result);
    } catch (err) {
      console.error("Fetch operation failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchIntersections();
  }, [fetchIntersections]);

  useEffect(() => {
    const mapPanel = isAddPointsLoading ? (
      loadingComponent
    ) : (
      <div className="h-[640px] w-full">
        <MapDisplay
          {...props}
          onMapClick={handleMapClick}
          intersections={intersections}
        />
      </div>
    );

    const layout = (
      <div className="max-w-7xl mx-auto py-8 px-4 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4">
            {mapPanel}
          </div>
          <aside className="lg:col-span-1 bg-white rounded-2xl shadow p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Selected Points
            </h3>
            <div className="flex-1 overflow-auto text-sm text-gray-700">
              <ul className="space-y-2">
                {points.length === 0 && (
                  <li className="text-gray-400">No points selected</li>
                )}
                {points.map((p, i) => (
                  <li key={i} className="px-3 py-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-800">
                      Lat: {p.lat.toFixed(6)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Lng: {p.lng.toFixed(6)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              {points.length === 2 ? (
                <button
                  onClick={okClick}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
                >
                  Confirm & Save
                </button>
              ) : (
                <button
                  disabled
                  className="w-full h-10 bg-gray-100 text-gray-400 rounded-md"
                >
                  Select 2 points to enable
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    );

    setMapDiv(layout);
  }, [intersections, isAddPointsLoading, points]);

  useEffect(() => {
    console.log("points:", points);

    setPointsDiv(
      <div>
        <h2>Selected Points:</h2>
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
      {isAddPointsLoading ? loadingComponent : mapDiv}
    </div>
  );
};

export default MapWrapper;