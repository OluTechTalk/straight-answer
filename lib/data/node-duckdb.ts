// Node-side DuckDB loader for tests and evals (the app uses DuckDB-WASM in the browser).
import { DuckDBInstance, type DuckDBConnection } from "@duckdb/node-api";
import { generateDataset, type Row } from "../../data/generate";
import { EXAMPLE_SCHEMA } from "./schema";

const sqlLit = (v: string | number) => (typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`);

/** Build an in-memory DuckDB with the synthetic example dataset (deterministic). */
export async function createExampleDb(): Promise<DuckDBConnection> {
  const instance = await DuckDBInstance.create(":memory:");
  const conn = await instance.connect();
  const ds = generateDataset();
  for (const table of EXAMPLE_SCHEMA) {
    const cols = table.columns.map((c) => `${c.name} ${c.type}`).join(", ");
    await conn.run(`CREATE TABLE ${table.name} (${cols})`);
    const rows: Row[] = ds[table.name as keyof typeof ds];
    const chunk = 500;
    for (let i = 0; i < rows.length; i += chunk) {
      const values = rows
        .slice(i, i + chunk)
        .map((r) => `(${table.columns.map((c) => sqlLit(r[c.name])).join(", ")})`)
        .join(",\n");
      await conn.run(`INSERT INTO ${table.name} VALUES ${values}`);
    }
  }
  return conn;
}

/** Run a query and return rows as plain JSON objects. */
export async function queryRows(conn: DuckDBConnection, sql: string): Promise<Record<string, unknown>[]> {
  const reader = await conn.runAndReadAll(sql);
  return reader.getRowObjectsJson() as Record<string, unknown>[];
}
