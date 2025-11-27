import { NextRequest } from "next/server";
import { queryPostgres } from "../../helpers";

// Define the expected runtime structure of the parameters
interface RouteParams {
  userid: string;
}

interface userTableRow {
  userid: string;
  email: string;
  password: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<unknown> }
): Promise<Response> {
  // console.log(context.params)

  const { userid } = (await context.params) as RouteParams;
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");
  const sql = `SELECT * FROM users where userid = $1 and password = $2`;

  const result = await queryPostgres(sql, [userid, password]);
  if (result.rows[0].rowCount !== 0) {
    return Response.json({
      status: 200,
    });
  }

  return Response.json({
    status: 404,
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<unknown> }
): Promise<Response> {
  // Cast the unknown 'params' object to the actual expected type for runtime use

  try {
    // Mock implementation of a POST request:
    const { userid, email, password } = (await request.json()) as userTableRow;

    // check if userid exists
    const userExistsResponse = await queryPostgres(
      `SELECT userid FROM users WHERE userid = $1`,
      [userid]
    );

    

    if (userExistsResponse.rowCount !== 0) {
      return new Response(
        JSON.stringify({ error: "Account with user id already exists" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // check if email exists

    const emailExistsResponse = await queryPostgres(
      `SELECT email FROM users WHERE email = $1`,
      [email]
    );

    if (emailExistsResponse.rowCount !== 0) {
      return new Response(
        JSON.stringify({ error: "Account with email already exists" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // if neither exist, then create new row

    const sql =
      "INSERT INTO users (userid, email, password) VALUES ($1, $2, $3)";

    await queryPostgres(sql, [userid, email, password]);

    return Response.json(
      {
        message: `Intersection created successfully for user ${userid}.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error processing POST request:`, error);
    return new Response(
      JSON.stringify({ error: "Invalid data format or failed insertion" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}