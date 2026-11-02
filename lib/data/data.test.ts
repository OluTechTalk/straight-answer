import { beforeAll, describe, expect, it } from "vitest";
import type { DuckDBConnection } from "@duckdb/node-api";
import { generateDataset } from "../../data/generate";
import { METRICS } from "./metrics";
import { createExampleDb, queryRows } from "./node-duckdb";

const r2 = (n: number) => Math.round(n * 100) / 100;
const r4 = (n: number) => Math.round(n * 10000) / 10000;

describe("generator", () => {
  it("is deterministic", () => {
    expect(generateDataset()).toEqual(generateDataset());
  });
  it("has the documented sizes and valid keys", () => {
    const ds = generateDataset();
    expect(ds.regions).toHaveLength(5);
    expect(ds.customers).toHaveLength(400);
    expect(ds.products).toHaveLength(30);
    expect(ds.orders).toHaveLength(5000);
    const cust = new Set(ds.customers.map((c) => c.customer_id));
    const prod = new Set(ds.products.map((p) => p.product_id));
    for (const o of ds.orders) {
      expect(cust.has(o.customer_id)).toBe(true);
      expect(prod.has(o.product_id)).toBe(true);
      expect(Number(o.discount)).toBeLessThanOrEqual(Number(o.order_total));
    }
  });
  it("covers all four statuses and the full date range", () => {
    const { orders } = generateDataset();
    expect(new Set(orders.map((o) => o.status))).toEqual(new Set(["completed", "refunded", "cancelled", "pending"]));
    expect(orders[0].order_date >= "2023-01-01").toBe(true);
    expect(orders[orders.length - 1].order_date <= "2024-12-31").toBe(true);
  });
  it("only marks recent orders pending", () => {
    const { orders } = generateDataset();
    for (const o of orders.filter((x) => x.status === "pending")) expect(String(o.order_date) >= "2024-12-21").toBe(true);
  });
});

describe("metric reference queries match an independent JS computation", () => {
  let conn: DuckDBConnection;
  const ds = generateDataset();
  const prodById = new Map(ds.products.map((p) => [p.product_id, p]));
  const completed = ds.orders.filter((o) => o.status === "completed");
  const placed = ds.orders.filter((o) => o.status === "completed" || o.status === "refunded");

  beforeAll(async () => {
    conn = await createExampleDb();
  });

  const expected: Record<string, number> = {
    revenue: r2(completed.reduce((s, o) => s + Number(o.order_total) - Number(o.discount), 0)),
    gross_sales: r2(placed.reduce((s, o) => s + Number(o.order_total), 0)),
    order_count: placed.length,
    aov: r2(completed.reduce((s, o) => s + Number(o.order_total) - Number(o.discount), 0) / completed.length),
    refund_rate: r4(placed.filter((o) => o.status === "refunded").length / placed.length),
    discount_rate: r4(completed.reduce((s, o) => s + Number(o.discount), 0) / completed.reduce((s, o) => s + Number(o.order_total), 0)),
    gross_margin: r2(
      completed.reduce((s, o) => s + Number(o.order_total) - Number(o.discount) - Number(prodById.get(o.product_id)!.unit_cost) * Number(o.quantity), 0),
    ),
    active_customers: new Set(completed.map((o) => o.customer_id)).size,
    new_customers: ds.customers.length,
    repeat_customers: (() => {
      const counts = new Map<string | number, number>();
      for (const o of completed) counts.set(o.customer_id, (counts.get(o.customer_id) ?? 0) + 1);
      return [...counts.values()].filter((n) => n >= 2).length;
    })(),
  };

  it("has an expected value for every metric", () => {
    expect(Object.keys(expected).sort()).toEqual(METRICS.map((m) => m.id).sort());
  });

  for (const m of METRICS) {
    it(`${m.id}`, async () => {
      const rows = await queryRows(conn, m.referenceSql);
      expect(rows).toHaveLength(1);
      expect(Number(rows[0].value)).toBeCloseTo(expected[m.id], 2);
    });
  }
});
