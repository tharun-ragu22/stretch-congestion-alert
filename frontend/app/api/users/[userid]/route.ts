import { NextRequest } from "next/server";
import { queryPostgres } from "../../helpers";

// Define the expected runtime structure of the parameters
interface RouteParams {
  userid: string;
}

export async function GET(
  request: NextRequest,
  context: { params: RouteParams }
): Promise<Response> {
  // console.log(context.params)

  const { userid } = await context.params;
  console.log("received userid ", userid);
  const sql = `SELECT * FROM users where userid = $1`;

  const result = await queryPostgres(sql, [userid]);
  console.log("result from user get:", result.rows[0]);
  if (result.rows.length !== 0) {
    return Response.json({
      status: 200,
    });
  }

  return Response.json({
    status:404
  });
}
