import ConnectionPool from "@/db";

// Mock function to simulate a PostgreSQL query (as requested)
export async function queryPostgres(sql: string, params: any[] = []) {
  try {
    const userId = params[0];
    console.log(`[POSTGRES_QUERY] User: ${userId}, SQL: ${sql}`);
    const res = await ConnectionPool.query(sql, params);

    return res;
  } catch (err: unknown) {
    console.error(`error executing ${sql} with params ${params}`);
    throw err;
  }
}