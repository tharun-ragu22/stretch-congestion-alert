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

  const test = await ConnectionPool.query(
    `SELECT beginpoint, endpoint FROM intersections where userid = '${userid}';`
  );
  // console.log(test.rows);
  const testRows: GPSPointRow[] = test.rows;

  let centerX = 0;
  let centerY = 0;
  for (let i = 0; i < testRows.length; i++) {
    centerX += testRows[i].beginpoint.x + testRows[i].endpoint.x;
    centerY += testRows[i].beginpoint.y + testRows[i].endpoint.y;
  }
  centerX /= 2 * testRows.length;
  centerY /= 2 * testRows.length;

  return (
    <div>
      Current user: {userid}
      <table>
        <thead>
          <tr>
            <th>Begin</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {test.rows.map((points: GPSPointRow) => {
            // console.log(points);
            const { beginpoint, endpoint } = points;
            return (
              <tr key = {Math.random.toString()}>
                <td>
                  {beginpoint.x},{beginpoint.y}
                </td>
                <td>
                  {endpoint.x},{endpoint.y}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <MapWrapper initialCenter={[centerY, centerX]} initialZoom={12} intersections={testRows}/>
    </div>
  );
};

export default UserDashboardPage;
