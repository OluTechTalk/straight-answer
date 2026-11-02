// Schema doc for the synthetic example dataset. This (plus metrics.ts) is all the model ever sees about the data.
// ALL DATA IS SYNTHETIC. Column notes are deliberately blunt about misleading names.

export interface ColumnDoc {
  name: string;
  type: "INTEGER" | "DOUBLE" | "VARCHAR" | "DATE";
  description: string;
}
export interface TableDoc {
  name: string;
  description: string;
  columns: ColumnDoc[];
}

export const AS_OF_DATE = "2024-12-31";

export const EXAMPLE_SCHEMA: TableDoc[] = [
  {
    name: "regions",
    description: "Five sales regions. Synthetic.",
    columns: [
      { name: "region_id", type: "INTEGER", description: "Primary key." },
      { name: "region_name", type: "VARCHAR", description: "Region name, e.g. 'Europe'." },
      { name: "country_group", type: "VARCHAR", description: "Informal grouping label. Not a country column." },
    ],
  },
  {
    name: "customers",
    description: "400 customers. Synthetic.",
    columns: [
      { name: "customer_id", type: "INTEGER", description: "Primary key." },
      { name: "customer_name", type: "VARCHAR", description: "Full name (synthetic)." },
      { name: "email", type: "VARCHAR", description: "Synthetic email at example.test." },
      { name: "region_id", type: "INTEGER", description: "BILLING region of the customer. Foreign key to regions. Not necessarily where orders ship." },
      { name: "segment", type: "VARCHAR", description: "One of 'Consumer', 'Small Business', 'Enterprise'." },
      { name: "signup_date", type: "DATE", description: "Account creation date. NOT the date of the first order." },
    ],
  },
  {
    name: "products",
    description: "30 products in 5 categories. Synthetic.",
    columns: [
      { name: "product_id", type: "INTEGER", description: "Primary key." },
      { name: "product_name", type: "VARCHAR", description: "Product name." },
      { name: "category", type: "VARCHAR", description: "One of Office, Electronics, Home, Travel, Fitness." },
      { name: "price", type: "DOUBLE", description: "CURRENT list price per unit. Some products were cheaper before 2024-03-01, so price * quantity does not equal orders.order_total for older orders." },
      { name: "unit_cost", type: "DOUBLE", description: "Cost per unit to the business." },
    ],
  },
  {
    name: "orders",
    description: "5,000 orders, one product per order, 2023-01-01 to 2024-12-31. Synthetic.",
    columns: [
      { name: "order_id", type: "INTEGER", description: "Primary key." },
      { name: "customer_id", type: "INTEGER", description: "Foreign key to customers." },
      { name: "product_id", type: "INTEGER", description: "Foreign key to products." },
      { name: "order_date", type: "DATE", description: "Date the order was placed." },
      { name: "quantity", type: "INTEGER", description: "Units ordered." },
      { name: "order_total", type: "DOUBLE", description: "Amount BEFORE discount (price at order time * quantity). Despite the name, it is not what the customer paid." },
      { name: "discount", type: "DOUBLE", description: "Discount in currency units, subtracted from order_total. 0 when no discount." },
      { name: "status", type: "VARCHAR", description: "One of 'completed', 'refunded' (fully refunded), 'cancelled', 'pending' (placed in the last ~10 days, not yet fulfilled)." },
      { name: "region_id", type: "INTEGER", description: "SHIPPING region of the order. Foreign key to regions. May differ from the customer's billing region." },
    ],
  },
];

/** Render the schema as compact text for a model prompt or a docs page. */
export function schemaToText(schema: TableDoc[] = EXAMPLE_SCHEMA): string {
  return schema
    .map(
      (t) =>
        `TABLE ${t.name}: ${t.description}\n` +
        t.columns.map((c) => `  - ${t.name}.${c.name} ${c.type}: ${c.description}`).join("\n"),
    )
    .join("\n\n");
}
