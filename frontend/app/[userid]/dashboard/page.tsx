import React from "react";
import ConnectionPool from "@/db";

interface DashboardProps {
  params: {
    userid: string;
  };
}

interface Point {
  x: string;
  y: string;
}

interface PointRow {
  beginpoint: Point;
  endpoint: Point;
}

const UserDashboardPage: React.FC<DashboardProps> = async ({
  params,
}: DashboardProps) => {
  const { userid } = await params;

  const test = await ConnectionPool.query(
    `SELECT beginpoint, endpoint FROM intersections where userid = '${userid}';`
  );
  console.log(test.rows);

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
          {test.rows.map((points: PointRow) => {
            console.log(points);
            const { beginpoint, endpoint } = points;
            return (
              <tr>
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
    </div>
  );
};

export default UserDashboardPage;
