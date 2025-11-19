import React from "react";
import ConnectionPool from "@/db";
import MapWrapper from "./MapWrapper";
import { GPSPointRow } from "@/app/DataTypes";

import axios from "axios";

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

  const API_URL =
    "https://api.tomtom.com/snapToRoads/1?points=-79.153523%2C43.795885%3B-79.162917%2C43.798734&timestamps=2021-01-01T00%3A00%3A00Z%3B2021-01-01T00%3A03%3A00Z&vehicleType=PassengerCar&fields=%7Broute%7Bgeometry%7Bcoordinates%7D%7D%7D&key=70J6CF7zlPcjhpv5FVjI1hvvVDSNML9p";

  // try {
  //   const response = await fetch(API_URL);
  //   if (!response.ok) {
  //     console.error("Bad request");
  //   }

  //   console.log("response", response);
  //   // const data = response.json;
  //   // console.log("data:", data);

  //   console.log("text", response.text);
  // } catch (err) {
  //   console.error("error while making request");
  // }

  // axios.get(API_URL).then((res) => {
  //   res.data.route.forEach(
  //     (item : GPSPointRow) => {
  //       console.log(item)
  //     }
  //   )
  // });
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
      <MapWrapper initialCenter={[centerY, centerX]} initialZoom={12} />
    </div>
  );
};

export default UserDashboardPage;
