import React from "react";
import ConnectionPool from "@/db";
import MapWrapper from "./MapWrapper";
import { GPSPointRow } from "@/app/DataTypes";

interface DashboardProps {
  params: {
    userid: string;
  };
}

const UserDashboardPage: React.FC<DashboardProps> = async ({
  params,
}: DashboardProps) => {
  const { userid } = await params;

  const sql = `
    SELECT 
      ST_AsGeoJSON(beginpoint)::jsonb as beginpoint, 
      ST_AsGeoJSON(endpoint)::jsonb as endpoint 
    FROM intersections 
    WHERE userid = '${userid}'
  `;

  // console.log(sql)

  const test = await ConnectionPool.query(
    sql
  );
  console.log("test rows:", test.rows);
  const intersectionRows: any[] = test.rows;

  let initialCenter: [number, number] = [0, 0];

  let initialScale = 9;
  if (intersectionRows.length > 0) {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    intersectionRows.forEach(row => {
      // Check all 4 points (begin and end) to find the edges
      const points = [row.beginpoint.coordinates, row.endpoint.coordinates];
      
      points.forEach(([lng, lat]) => {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
    });

    // The center is the midpoint of the bounds
    initialCenter = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
    
  } else{
    initialScale = 1;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
            {userid?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Current user: <span className="font-medium text-gray-800">{userid}</span>
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Intersections: <span className="font-medium text-gray-800">{intersectionRows.length}</span>
        </div>
      </div>
      <div className="bg-white/90 p-6 rounded-lg shadow-md border border-gray-200 max-w-7xl backdrop-blur-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Instructions</h2>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <span className="font-bold text-blue-600">1.</span>
            <p className="text-gray-700 text-sm">
              <strong>Zoom</strong> into the city you're in (e.g. Toronto, SF)
            </p>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600">2.</span>
            <p className="text-gray-700 text-sm">
              <strong>Click</strong> on 2 points on the map to define the stretch.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600">3.</span>
            <p className="text-gray-700 text-sm">
              Hit <strong>Submit</strong> to save the intersection.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600">4.</span>
            <p className="text-gray-700 text-sm">
              <strong>Refresh</strong> the page to see the road stretch and congestion level reflected on the map.
            </p>
          </li>
        </ul>
      </div>

      <MapWrapper initialCenter={initialCenter} initialZoom={initialScale} userid={userid} apiKey={process.env.TOMTOM_API_KEY!} />

      

    </div>
  );
};

export default UserDashboardPage;
