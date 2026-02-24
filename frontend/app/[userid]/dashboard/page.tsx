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

  let centerX = 0;
  let centerY = 0;
  let initialScale = 12;
  if (testRows.length > 0) {
    for (let i = 0; i < testRows.length; i++) {
      centerX += testRows[i].beginpoint.coordinates[0] + testRows[i].endpoint.coordinates[0];
      centerY += testRows[i].beginpoint.coordinates[1] + testRows[i].endpoint.coordinates[1];
    }
    centerX /= 2 * testRows.length;
    centerY /= 2 * testRows.length;
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

      <MapWrapper initialCenter={[centerY, centerX]} initialZoom={initialScale} userid={userid} apiKey={process.env.TOMTOM_API_KEY!} />
    </div>
  );
};

export default UserDashboardPage;
