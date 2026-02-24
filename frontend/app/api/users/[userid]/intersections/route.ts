import { NextRequest } from "next/server";
import { queryPostgres } from "@/app/api/helpers";
import { GPSPointRow } from "@/app/DataTypes";
import axios from "axios";

// Define the expected runtime structure of the parameters
interface RouteParams {
  userid: string;
}

// -----------------------------------------------------------------------------------
// GET Handler (Aggressive Type Fix)
// -----------------------------------------------------------------------------------
// Workaround: Use 'unknown' for the context object to satisfy the Next.js validator,
// then cast the params inside the function.
export async function GET(
  request: NextRequest,
  context: { params: Promise<unknown> }
): Promise<Response> {
  // Cast the unknown 'params' object to the actual expected type for runtime use
  const { userid } = (await context.params) as RouteParams;

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  try {
 
    const sql = `
      SELECT 
        ST_AsGeoJSON(beginpoint)::jsonb as beginpoint, 
        ST_AsGeoJSON(endpoint)::jsonb as endpoint 
      FROM intersections 
      WHERE userid = $1
    `;

    const result = await queryPostgres(sql, [userid]);
    console.log("result from get", result);
    const intersections: any[] = [];
    const BATCH_SIZE = 2;
    for (let i = 0; i < result.rows.length; i += BATCH_SIZE) {
      const batch = result.rows.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (gpsPointRow: any) => {
        
        // 2. Extract coordinates from the GeoJSON structure
        // PostGIS GeoJSON format is [longitude, latitude]
        const bLng = gpsPointRow.beginpoint.coordinates[0];
        const bLat = gpsPointRow.beginpoint.coordinates[1];
        const eLng = gpsPointRow.endpoint.coordinates[0];
        const eLat = gpsPointRow.endpoint.coordinates[1];

        // TomTom usually expects "latitude,longitude" in the URL string
        const TOMTOM_API_URL = `https://api.tomtom.com/snap-to-roads/1/snap-to-roads?points=${bLat},${bLng};${eLat},${eLng}&fields={route{type,geometry{type,coordinates},properties{speedProfile{value,unit},speedLimits{value,unit}}}}&key=${process.env.TOMTOM_API_KEY}`;
        
        
        try {
          const res = await axios.get(TOMTOM_API_URL);
          return res.data.route;
        } catch (err) {
          console.error("couldn't make request", gpsPointRow);
          return null;
        }
      });
      const batchResults = await Promise.all(batchPromises);
      intersections.push(...batchResults.filter(r => r !== null));
      await delay(500);
    }

    console.log("created intersections", intersections);

    // Use standard Web API Response.json()
    return Response.json(intersections);
  } catch (error) {
    console.error(`Error fetching intersections for user ${userid}:`, error);

    return new Response(
      JSON.stringify({ error: "Failed to fetch user intersections" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function insertIntersection(sql: string, params: any[]) {
  const user: string = params[0];
  const beginpoint: number[] = Object.values(params[1]);
  const endpoint: number[] = Object.values(params[2]);
  console.log(user, beginpoint, endpoint);

  await queryPostgres(sql, [user, ...beginpoint, ...endpoint]);
}

// -----------------------------------------------------------------------------------
// POST Handler (Aggressive Type Fix)
// -----------------------------------------------------------------------------------
// Workaround: Use 'unknown' for the context object to satisfy the Next.js validator.
export async function POST(
  request: NextRequest,
  context: { params: Promise<unknown> }
): Promise<Response> {
  // Cast the unknown 'params' object to the actual expected type for runtime use
  const { userid } = (await context.params) as RouteParams;
  console.log(`POST request received for user: ${userid}`);

  try {
    // Mock implementation of a POST request:
    const body = await request.json();
    console.log("received body: ", body);
    let points: tt.LngLat[] = [];
    body.forEach((row: tt.LngLat) => {
      points.push(row);
    });
    const sql =
      "INSERT INTO intersections (userid, beginpoint, endpoint) VALUES ($1, ST_SetSRID(ST_MakePoint($3, $2), 4326), ST_SetSRID(ST_MakePoint($5, $4), 4326));";
    await insertIntersection(sql, [userid, ...points]);

    return Response.json(
      {
        message: `Intersection created successfully for user ${userid} at (${points[0].lat}, ${points[0].lng}).`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error processing POST request for user ${userid}:`, error);
    return new Response(
      JSON.stringify({ error: "Invalid data format or failed insertion" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
