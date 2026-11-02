// Deterministic synthetic dataset generator. ALL DATA IS SYNTHETIC.
// Run: npm run gen:data  (writes CSVs to data/out/). Same seed, same output.

import { mkdirSync, writeFileSync } from "node:fs";

export const SEED = 20241231;
export const AS_OF = "2024-12-31"; // "today" for every relative time phrase

export type Row = Record<string, string | number>;
export interface Dataset {
  regions: Row[];
  customers: Row[];
  products: Row[];
  orders: Row[];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86400000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const ms = (d: string) => Date.parse(d + "T00:00:00Z");

const REGIONS = [
  { region_id: 1, region_name: "North America", country_group: "US and Canada" },
  { region_id: 2, region_name: "Europe", country_group: "EU and UK" },
  { region_id: 3, region_name: "Asia Pacific", country_group: "APAC" },
  { region_id: 4, region_name: "Latin America", country_group: "LATAM" },
  { region_id: 5, region_name: "Middle East and Africa", country_group: "MEA" },
];
const REGION_WEIGHTS = [0.38, 0.27, 0.2, 0.1, 0.05];

const FIRST = ["Ava", "Liam", "Noah", "Mia", "Zoe", "Ethan", "Ivy", "Omar", "Lena", "Kai", "Nora", "Sam", "Priya", "Diego", "Hana", "Tomas", "Amara", "Yuki", "Felix", "Rosa"];
const LAST = ["Stone", "Rivera", "Nguyen", "Okafor", "Larsen", "Khan", "Moreau", "Silva", "Tanaka", "Brooks", "Haddad", "Novak", "Reyes", "Kowalski", "Mensah", "Fischer"];
const SEGMENTS = ["Consumer", "Small Business", "Enterprise"];
const SEGMENT_WEIGHTS = [0.6, 0.3, 0.1];

const CATEGORIES: Record<string, string[]> = {
  Office: ["Desk Lamp", "Notebook Set", "Standing Mat", "Monitor Arm", "Cable Kit", "Desk Organizer"],
  Electronics: ["Wireless Mouse", "Mechanical Keyboard", "USB Hub", "Webcam", "Headset", "Portable Charger"],
  Home: ["Water Bottle", "Throw Blanket", "Plant Pot", "Wall Clock", "Candle Set", "Storage Bin"],
  Travel: ["Packing Cubes", "Travel Mug", "Daypack", "Luggage Tag", "Sleep Mask", "Adapter Plug"],
  Fitness: ["Yoga Mat", "Resistance Bands", "Jump Rope", "Foam Roller", "Gym Towel", "Shaker Bottle"],
};

function pickWeighted<T>(rnd: () => number, items: T[], weights: number[]): T {
  let r = rnd();
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
const pick = <T,>(rnd: () => number, items: T[]) => items[Math.floor(rnd() * items.length)];
const round2 = (n: number) => Math.round(n * 100) / 100;

export function generateDataset(seed = SEED): Dataset {
  const rnd = mulberry32(seed);
  const start = ms("2023-01-01");
  const end = ms(AS_OF);
  const totalDays = Math.round((end - start) / DAY) + 1;

  const regions: Row[] = REGIONS.map((r) => ({ ...r }));

  // Products: 30. `price` is the CURRENT list price. 8 products had a price increase on 2024-03-01.
  const products: Row[] = [];
  let pid = 1;
  for (const [category, names] of Object.entries(CATEGORIES)) {
    for (const product_name of names) {
      const price = round2(8 + rnd() * 112);
      products.push({
        product_id: pid++,
        product_name,
        category,
        price,
        unit_cost: round2(price * (0.35 + rnd() * 0.3)),
      });
    }
  }
  const PRICE_CHANGE = ms("2024-03-01");
  const changed = new Set<number>();
  while (changed.size < 8) changed.add(1 + Math.floor(rnd() * products.length));

  // Customers: 400. signup_date is account creation, NOT first order date.
  const customers: Row[] = [];
  for (let i = 1; i <= 400; i++) {
    const region = pickWeighted(rnd, REGIONS, REGION_WEIGHTS);
    const segment = pickWeighted(rnd, SEGMENTS, SEGMENT_WEIGHTS);
    const signup = start + Math.floor(Math.pow(rnd(), 1.3) * totalDays) * DAY;
    const first = pick(rnd, FIRST);
    const last = pick(rnd, LAST);
    customers.push({
      customer_id: i,
      customer_name: `${first} ${last}`,
      email: `${first}.${last}.${i}@example.test`.toLowerCase(),
      region_id: region.region_id, // BILLING region
      segment,
      signup_date: iso(signup),
    });
  }

  // Orders: 5,000 over 2 years with growth and a Q4 bump.
  const orders: Row[] = [];
  const bySignup = [...customers].sort((a, b) => String(a.signup_date).localeCompare(String(b.signup_date)));
  const segMult: Record<string, number> = { Consumer: 1, "Small Business": 1.6, Enterprise: 2.5 };
  const TARGET = 5000;
  while (orders.length < TARGET) {
    const dayIdx = Math.floor(Math.pow(rnd(), 0.85) * totalDays);
    const date = start + dayIdx * DAY;
    const month = new Date(date).getUTCMonth();
    if (month < 9 && rnd() < 0.18) continue; // thin out Jan-Sep so Q4 has a bump
    const eligible = bySignup.filter((c) => ms(String(c.signup_date)) <= date);
    if (eligible.length === 0) continue;
    const cust = eligible[Math.floor(rnd() * eligible.length)];
    const product = pick(rnd, products);
    const quantity = 1 + Math.floor(rnd() * 3 * (segMult[String(cust.segment)] ?? 1));
    const pidNum = Number(product.product_id);
    const unit = changed.has(pidNum) && date < PRICE_CHANGE ? Number(product.price) * 0.9 : Number(product.price);
    const order_total = round2(unit * quantity); // BEFORE discount
    const discount = rnd() < 0.3 ? round2(order_total * pick(rnd, [0.05, 0.1, 0.15, 0.2])) : 0;
    const shipRegion = rnd() < 0.85 ? Number(cust.region_id) : pickWeighted(rnd, REGIONS, REGION_WEIGHTS).region_id;
    const age = (end - date) / DAY;
    let status = "completed";
    const r = rnd();
    if (age < 10 && r < 0.5) status = "pending";
    else if (r < 0.05) status = "cancelled";
    else if (r < 0.11) status = "refunded";
    orders.push({
      order_id: 0,
      customer_id: cust.customer_id,
      product_id: product.product_id,
      order_date: iso(date),
      quantity,
      order_total,
      discount,
      status,
      region_id: shipRegion, // SHIPPING region
    });
  }
  orders.sort((a, b) => String(a.order_date).localeCompare(String(b.order_date)) || Number(a.customer_id) - Number(b.customer_id));
  orders.forEach((o, i) => (o.order_id = i + 1));

  return { regions, customers, products, orders };
}

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
}

export function writeDataset(dir: string, seed = SEED) {
  const ds = generateDataset(seed);
  mkdirSync(dir, { recursive: true });
  for (const [name, rows] of Object.entries(ds)) writeFileSync(`${dir}/${name}.csv`, toCsv(rows));
  return ds;
}

// CLI: node data/generate.ts
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("data/generate.ts")) {
  const ds = writeDataset("data/out");
  for (const [k, v] of Object.entries(ds)) console.log(`${k}: ${v.length} rows`);
}
