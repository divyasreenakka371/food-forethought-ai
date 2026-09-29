export type Storage = "fridge" | "freezer" | "pantry" | "counter";

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  storage: Storage;
  addedAt: number; // epoch ms
  typicalDays: number; // typical shelf life in days for this storage
  quantity: string;
}

export type Urgency = "fresh" | "soon" | "urgent";

export interface ScoredItem extends FoodItem {
  daysLeft: number;
  percentUsed: number; // 0-100 of shelf life consumed
  urgency: Urgency;
  tips: string[];
}

// Typical shelf life (days) by category and storage
const SHELF_LIFE: Record<string, Record<Storage, number>> = {
  "Leafy greens": { fridge: 5, freezer: 30, pantry: 1, counter: 1 },
  "Fresh herbs": { fridge: 7, freezer: 60, pantry: 2, counter: 2 },
  "Berries": { fridge: 4, freezer: 90, pantry: 1, counter: 1 },
  "Other fruit": { fridge: 10, freezer: 120, pantry: 5, counter: 5 },
  "Vegetables": { fridge: 7, freezer: 120, pantry: 7, counter: 4 },
  "Dairy": { fridge: 7, freezer: 60, pantry: 0.5, counter: 0.25 },
  "Meat & fish": { fridge: 2, freezer: 120, pantry: 0.25, counter: 0.1 },
  "Cooked leftovers": { fridge: 4, freezer: 60, pantry: 0.25, counter: 0.1 },
  "Bread & baked": { fridge: 10, freezer: 90, pantry: 5, counter: 4 },
  "Eggs": { fridge: 28, freezer: 0, pantry: 2, counter: 2 },
  "Dry goods": { fridge: 365, freezer: 365, pantry: 180, counter: 180 },
  "Condiments & jars": { fridge: 60, freezer: 0, pantry: 90, counter: 30 },
};

export const CATEGORIES = Object.keys(SHELF_LIFE);

export const STORAGE_LABELS: Record<Storage, string> = {
  fridge: "Fridge",
  freezer: "Freezer",
  pantry: "Pantry",
  counter: "Counter",
};

export function shelfLifeFor(category: string, storage: Storage): number {
  return SHELF_LIFE[category]?.[storage] ?? 7;
}

const TIPS: Record<string, string[]> = {
  "Leafy greens": [
    "Wilt into a frittata, soup, or pasta in the last 10 minutes of cooking.",
    "Blend into a green smoothie with fruit to mask bitterness.",
    "Make a quick pesto — greens, nuts, oil, and cheese freeze well.",
  ],
  "Fresh herbs": [
    "Chop and freeze in olive oil using an ice-cube tray.",
    "Stir into a compound butter for bread, eggs, or vegetables.",
    "Blend into a chimichurri or salsa verde — keeps a week in the fridge.",
  ],
  "Berries": [
    "Simmer into a quick compote for yogurt, oats, or pancakes.",
    "Freeze on a tray, then bag — perfect for smoothies.",
    "Bake into a crumble or muffins before they soften.",
  ],
  "Other fruit": [
    "Roast with a little honey for a dessert or oatmeal topping.",
    "Blend overripe fruit into smoothies or freeze for later.",
    "Stew into a sauce for pancakes, yogurt, or pork dishes.",
  ],
  "Vegetables": [
    "Roast a mixed tray at 200°C — almost any vegetable works.",
    "Simmer into a soup or curry; soft veg blends beautifully.",
    "Pickle quick-style with vinegar, salt, and sugar.",
  ],
  "Dairy": [
    "Turn milk into pancakes, bechamel, or a creamy soup.",
    "Soft cheese nearing its date melts perfectly into pasta.",
    "Yogurt works in marinades, dressings, and baking.",
  ],
  "Meat & fish": [
    "Cook tonight and refrigerate — cooked meat keeps 3–4 more days.",
    "Freeze raw portions now if you won't cook within a day.",
    "Mince or flake into a stir-fry, tacos, or fried rice.",
  ],
  "Cooked leftovers": [
    "Reinvent as fried rice, a frittata, or a grain bowl.",
    "Freeze individual portions for effortless future lunches.",
    "Blend cooked veg leftovers into soup with stock.",
  ],
  "Bread & baked": [
    "Blitz stale bread into breadcrumbs — freeze the bag.",
    "Make croutons, French toast, or bread pudding.",
    "Revive a loaf: sprinkle with water, bake 8 min at 180°C.",
  ],
  "Eggs": [
    "Boil a batch for snacks and salads all week.",
    "Bake a frittata or shakshuka to use several at once.",
    "Test freshness: eggs that sink in water are still good.",
  ],
  "Dry goods": [
    "Check dates — most dry goods are fine well past 'best before'.",
    "Cook grains in bulk and freeze flat portions.",
    "Combine odds and ends into a pantry soup or grain salad.",
  ],
  "Condiments & jars": [
    "Whisk near-empty jars into salad dressings or marinades.",
    "Stir pastes and sauces into soups and stews for depth.",
    "Use pickles and preserves on a clean-out-the-fridge board.",
  ],
};

export function scoreItem(item: FoodItem, now = Date.now()): ScoredItem {
  const ageDays = (now - item.addedAt) / 86_400_000;
  const daysLeft = item.typicalDays - ageDays;
  const percentUsed = Math.min(100, Math.max(0, (ageDays / item.typicalDays) * 100));

  let urgency: Urgency = "fresh";
  if (daysLeft <= 1.5) urgency = "urgent";
  else if (daysLeft <= Math.max(2, item.typicalDays * 0.35)) urgency = "soon";

  const allTips = TIPS[item.category] ?? [];
  const tips = urgency === "fresh" ? allTips.slice(0, 1) : allTips.slice(0, 3);

  return { ...item, daysLeft, percentUsed, urgency, tips };
}

export function daysLeftLabel(daysLeft: number): string {
  if (daysLeft < 0) return "Past its best";
  if (daysLeft < 1) return "Use today";
  if (daysLeft < 2) return "1 day left";
  return `${Math.round(daysLeft)} days left`;
}

export const SAMPLE_ITEMS: FoodItem[] = [
  {
    id: "s1",
    name: "Baby spinach",
    category: "Leafy greens",
    storage: "fridge",
    addedAt: Date.now() - 3.5 * 86_400_000,
    typicalDays: 5,
    quantity: "1 bag",
  },
  {
    id: "s2",
    name: "Chicken breast",
    category: "Meat & fish",
    storage: "fridge",
    addedAt: Date.now() - 1.2 * 86_400_000,
    typicalDays: 2,
    quantity: "400 g",
  },
  {
    id: "s3",
    name: "Greek yogurt",
    category: "Dairy",
    storage: "fridge",
    addedAt: Date.now() - 2 * 86_400_000,
    typicalDays: 7,
    quantity: "1 tub",
  },
  {
    id: "s4",
    name: "Sourdough loaf",
    category: "Bread & baked",
    storage: "counter",
    addedAt: Date.now() - 2.5 * 86_400_000,
    typicalDays: 4,
    quantity: "Half loaf",
  },
  {
    id: "s5",
    name: "Bananas",
    category: "Other fruit",
    storage: "counter",
    addedAt: Date.now() - 4 * 86_400_000,
    typicalDays: 5,
    quantity: "4 pieces",
  },
];
