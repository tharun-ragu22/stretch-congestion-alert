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
  const testRows: any[] = test.rows;

  let initialCenter: [number, number] = [0, 0];
  let bounds: [number, number, number, number] | null = null;

  let initialScale = 10;
  if (testRows.length > 0) {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    testRows.forEach(row => {
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
    
    // TomTom bounds format: [SW_lng, SW_lat, NE_lng, NE_lat]
    bounds = [minLng, minLat, maxLng, maxLat];
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
          Intersections: <span className="font-medium text-gray-800">{testRows.length}</span>
        </div>
      </div>

      <MapWrapper initialCenter={initialCenter} initialZoom={initialScale} userid={userid} apiKey={process.env.TOMTOM_API_KEY!} bounds={bounds} />
    </div>
  );
};

export default UserDashboardPage;
