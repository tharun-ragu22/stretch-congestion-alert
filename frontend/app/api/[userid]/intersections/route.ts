import { NextRequest } from "next/server";
import ConnectionPool from "@/db";

// Define the expected runtime structure of the parameters
interface RouteParams {
  userid: string;
}

// Mock function to simulate a PostgreSQL query (as requested)
async function queryPostgres(sql: string, params: any[] = []) {
  try {
    const userId = params[0];
    console.log(`[POSTGRES_QUERY] User: ${userId}, SQL: ${sql}`);
    const res = await ConnectionPool.query(sql, params);

    return res.rows[0];
  } catch (err: unknown) {
    console.error(`error executing ${sql} with params ${params}`);
    throw err;
  }
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

  try {
    // Mock SQL Query:
    const sql =
      "SELECT id, lat, lng, created_at FROM intersections WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5";
    const result = await queryPostgres(sql, [userid]);

    // Use standard Web API Response.json()
    return Response.json(result.rows);
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

  await ConnectionPool.query(sql, [user, ...beginpoint, ...endpoint]);
}

// -----------------------------------------------------------------------------------
// POST Handler (Aggressive Type Fix)
// -----------------------------------------------------------------------------------
// Workaround: Use 'unknown' for the context object to satisfy the Next.js validator.
export async function POST(
  request: NextRequest,
  context: { params: Promise<unknown> }
): Promise<Response> {
  console.log("ya dad", await context.params);
  console.log("help");
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

    // Mock SQL Query:
    const sql =
      "INSERT INTO intersections (userid, beginpoint, endpoint) VALUES ($1, POINT($3, $2), POINT($5, $4))";
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
