// Metric definitions (the glossary). The model must use these; the UI displays them.
// `referenceSql` is a hand-written, whole-dataset query that defines the metric precisely. Evals build on these.
// ALL DATA IS SYNTHETIC.

export interface MetricDef {
  id: string;
  name: string;
  /** Words people use that should map to this metric. */
  aliases: string[];
  /** One plain sentence, shown to users. */
  definition: string;
  /** Reference query over the whole example dataset, returning one row, one column named `value`. */
  referenceSql: string;
}

export const METRICS: MetricDef[] = [
  {
    id: "revenue",
    name: "Revenue",
    aliases: ["revenue", "net revenue", "net sales", "income"],
    definition: "Sum of (order_total - discount) over orders with status 'completed'. Refunded, cancelled and pending orders are excluded.",
    referenceSql: "SELECT ROUND(SUM(order_total - discount), 2) AS value FROM orders WHERE status = 'completed'",
  },
  {
    id: "gross_sales",
    name: "Gross sales",
    aliases: ["gross sales", "gross revenue", "list sales"],
    definition: "Sum of order_total (before discounts) over orders with status 'completed' or 'refunded'. Cancelled and pending orders are excluded.",
    referenceSql: "SELECT ROUND(SUM(order_total), 2) AS value FROM orders WHERE status IN ('completed', 'refunded')",
  },
  {
    id: "order_count",
    name: "Orders",
    aliases: ["orders", "number of orders", "order count", "order volume"],
    definition: "Count of orders with status 'completed' or 'refunded'. Cancelled and pending orders are not counted.",
    referenceSql: "SELECT COUNT(*) AS value FROM orders WHERE status IN ('completed', 'refunded')",
  },
  {
    id: "aov",
    name: "Average order value (AOV)",
    aliases: ["aov", "average order value", "average basket", "average order size"],
    definition: "Revenue divided by the number of 'completed' orders.",
    referenceSql: "SELECT ROUND(SUM(order_total - discount) / COUNT(*), 2) AS value FROM orders WHERE status = 'completed'",
  },
  {
    id: "refund_rate",
    name: "Refund rate",
    aliases: ["refund rate", "return rate", "refunds"],
    definition: "Orders with status 'refunded' divided by orders with status 'completed' or 'refunded', as a fraction between 0 and 1.",
    referenceSql:
      "SELECT ROUND(SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) * 1.0 / COUNT(*), 4) AS value FROM orders WHERE status IN ('completed', 'refunded')",
  },
  {
    id: "discount_rate",
    name: "Discount rate",
    aliases: ["discount rate", "average discount", "discounting"],
    definition: "Total discount divided by total order_total, over 'completed' orders, as a fraction between 0 and 1.",
    referenceSql: "SELECT ROUND(SUM(discount) / SUM(order_total), 4) AS value FROM orders WHERE status = 'completed'",
  },
  {
    id: "gross_margin",
    name: "Gross margin",
    aliases: ["gross margin", "margin", "profit", "gross profit"],
    definition: "Revenue minus the cost of goods (products.unit_cost * orders.quantity), over 'completed' orders. In currency units, not a percentage.",
    referenceSql:
      "SELECT ROUND(SUM(o.order_total - o.discount - p.unit_cost * o.quantity), 2) AS value FROM orders o JOIN products p ON p.product_id = o.product_id WHERE o.status = 'completed'",
  },
  {
    id: "active_customers",
    name: "Active customers",
    aliases: ["active customers", "buying customers", "customers who bought"],
    definition: "Distinct customers with at least one 'completed' order in the period asked about. Having an account is not enough.",
    referenceSql: "SELECT COUNT(DISTINCT customer_id) AS value FROM orders WHERE status = 'completed'",
  },
  {
    id: "new_customers",
    name: "New customers",
    aliases: ["new customers", "signups", "new signups", "customer acquisition"],
    definition: "Customers whose signup_date falls in the period asked about. This is account creation, not first purchase.",
    referenceSql: "SELECT COUNT(*) AS value FROM customers",
  },
  {
    id: "repeat_customers",
    name: "Repeat customers",
    aliases: ["repeat customers", "returning customers", "repeat buyers"],
    definition: "Distinct customers with two or more 'completed' orders in the period asked about.",
    referenceSql:
      "SELECT COUNT(*) AS value FROM (SELECT customer_id FROM orders WHERE status = 'completed' GROUP BY customer_id HAVING COUNT(*) >= 2)",
  },
];

/** Terms that map to more than one metric or window. A question using them without a qualifier should trigger a clarifying question. */
export const AMBIGUOUS_TERMS: { term: string; why: string; candidates: string[] }[] = [
  { term: "sales", why: "Could mean revenue (net of discounts, completed only) or gross sales (before discounts, includes refunded).", candidates: ["revenue", "gross_sales"] },
  { term: "customers", why: "Could mean all accounts, active customers, new customers or repeat customers.", candidates: ["active_customers", "new_customers", "repeat_customers"] },
  { term: "best / top (with no measure)", why: "Best by revenue, orders, margin or something else?", candidates: ["revenue", "order_count", "gross_margin"] },
  { term: "region", why: "Orders have a shipping region and customers have a billing region. Default to the order's shipping region and say so.", candidates: ["orders.region_id", "customers.region_id"] },
  { term: "recently / lately", why: "No fixed window. Ask for one.", candidates: [] },
];

/** Time conventions. Relative phrases are measured from AS_OF_DATE, not the real clock. */
export const TIME_CONVENTIONS = [
  "The data covers 2023-01-01 to 2024-12-31. 'Today' is 2024-12-31 for every relative phrase.",
  "'This year' = calendar 2024. 'Last year' = calendar 2023.",
  "'Last month' = December 2024. 'This month' = December 2024 to date.",
  "'Last quarter' = Q4 2024 (Oct-Dec). Quarters are calendar quarters.",
  "'Last 30 days' = 2024-12-02 to 2024-12-31 inclusive.",
  "Weeks start on Monday.",
  "Orders placed in the last ~10 days may still be 'pending' and are excluded from revenue.",
];

export function metricsToText(metrics: MetricDef[] = METRICS): string {
  const defs = metrics.map((m) => `- ${m.name} (${m.id}; also called: ${m.aliases.join(", ")}): ${m.definition}`).join("\n");
  const amb = AMBIGUOUS_TERMS.map((a) => `- "${a.term}": ${a.why}`).join("\n");
  return `METRIC DEFINITIONS\n${defs}\n\nAMBIGUOUS TERMS\n${amb}\n\nTIME CONVENTIONS\n${TIME_CONVENTIONS.map((t) => `- ${t}`).join("\n")}`;
}
