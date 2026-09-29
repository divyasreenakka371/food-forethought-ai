import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  Apple,
  Carrot,
  ChefHat,
  Clock3,
  Leaf,
  Lightbulb,
  Milk,
  Plus,
  Refrigerator,
  Snowflake,
  Trash2,
  Wheat,
} from "lucide-react";
import {
  CATEGORIES,
  SAMPLE_ITEMS,
  STORAGE_LABELS,
  daysLeftLabel,
  scoreItem,
  shelfLifeFor,
  type FoodItem,
  type ScoredItem,
  type Storage,
  type Urgency,
} from "@/lib/foodwise";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoodWise AI — Waste less, eat better" },
      {
        name: "description",
        content:
          "Log the food in your kitchen, see what needs eating first, and get practical ideas to use it up before it becomes waste.",
      },
      { property: "og:title", content: "FoodWise AI — Waste less, eat better" },
      {
        property: "og:description",
        content:
          "Log the food in your kitchen, see what needs eating first, and get practical ideas to use it up before it becomes waste.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FoodWise,
});

const URGENCY_STYLES: Record<Urgency, { chip: string; bar: string; label: string }> = {
  fresh: {
    chip: "bg-fresh text-fresh-foreground",
    bar: "bg-primary",
    label: "Fresh",
  },
  soon: {
    chip: "bg-soon text-soon-foreground",
    bar: "bg-soon-foreground",
    label: "Use soon",
  },
  urgent: {
    chip: "bg-urgent text-urgent-foreground",
    bar: "bg-urgent-foreground",
    label: "Use now",
  },
};

const STORAGE_ICONS: Record<Storage, typeof Refrigerator> = {
  fridge: Refrigerator,
  freezer: Snowflake,
  pantry: Wheat,
  counter: Apple,
};

const CATEGORY_ICONS: Record<string, typeof Leaf> = {
  "Leafy greens": Leaf,
  Vegetables: Carrot,
  Dairy: Milk,
  "Cooked leftovers": ChefHat,
};

function FoodWise() {
  const [items, setItems] = useState<FoodItem[]>(SAMPLE_ITEMS);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0] ?? "Vegetables");
  const [storage, setStorage] = useState<Storage>("fridge");
  const [daysAgo, setDaysAgo] = useState("0");

  const scored = useMemo(
    () =>
      items
        .map((item) => scoreItem(item))
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [items],
  );

  const urgentCount = scored.filter((i) => i.urgency === "urgent").length;
  const soonCount = scored.filter((i) => i.urgency === "soon").length;

  function addItem(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const days = Math.max(0, Number(daysAgo) || 0);
    const item: FoodItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      storage,
      quantity: quantity.trim() || "1 item",
      addedAt: Date.now() - days * 86_400_000,
      typicalDays: shelfLifeFor(category, storage),
    };
    setItems((prev) => [...prev, item]);
    setName("");
    setQuantity("");
    setDaysAgo("0");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="texture-paper min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight">
                FoodWise AI
              </h1>
              <p className="text-xs text-muted-foreground">
                Waste less, eat better
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm sm:flex">
            <Stat label="Tracked" value={String(items.length)} />
            <Stat label="Use soon" value={String(soonCount)} tone="soon" />
            <Stat label="Use now" value={String(urgentCount)} tone="urgent" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <section className="mb-10 max-w-2xl animate-rise">
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your kitchen,{" "}
            <span className="italic text-primary">before the bin.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Add what's in your fridge, pantry, and counter. FoodWise ranks
            everything by freshness and storage, then suggests real ways to
            cook it before it's too late.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Add food form */}
          <section
            className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm animate-rise"
            style={{ animationDelay: "80ms" }}
          >
            <h3 className="font-display text-lg font-semibold">
              Add a food item
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              A few details are all we need.
            </p>
            <form onSubmit={addItem} className="mt-5 space-y-4">
              <Field label="What is it?">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cherry tomatoes"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Quantity">
                  <input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 2 cups"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
              </div>
              <Field label="Stored in">
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(STORAGE_LABELS) as Storage[]).map((s) => {
                    const Icon = STORAGE_ICONS[s];
                    const active = storage === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStorage(s)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-colors ${
                          active
                            ? "border-primary bg-secondary text-secondary-foreground"
                            : "border-input bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="size-4" />
                        {STORAGE_LABELS[s]}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Bought / cooked how many days ago?">
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={daysAgo}
                  onChange={(e) => setDaysAgo(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" />
                Add to my kitchen
              </button>
            </form>
          </section>

          {/* Priority list */}
          <section
            className="space-y-4 animate-rise"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex items-end justify-between">
              <h3 className="font-display text-lg font-semibold">
                Eat-first queue
              </h3>
              <p className="text-sm text-muted-foreground">
                Sorted by what needs attention soonest
              </p>
            </div>

            {scored.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
                Your kitchen is empty — add your first item to get started.
              </div>
            )}

            {scored.map((item) => (
              <FoodCard key={item.id} item={item} onRemove={removeItem} />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "soon" | "urgent";
}) {
  const color =
    tone === "urgent"
      ? "text-urgent-foreground"
      : tone === "soon"
        ? "text-soon-foreground"
        : "text-foreground";
  return (
    <div className="text-center">
      <div className={`font-display text-xl font-semibold ${color}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function FoodCard({
  item,
  onRemove,
}: {
  item: ScoredItem;
  onRemove: (id: string) => void;
}) {
  const styles = URGENCY_STYLES[item.urgency];
  const StorageIcon = STORAGE_ICONS[item.storage];
  const CategoryIcon = CATEGORY_ICONS[item.category] ?? Leaf;
  const [expanded, setExpanded] = useState(item.urgency !== "fresh");

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <CategoryIcon className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-display text-base font-semibold">
                {item.name}
              </h4>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles.chip}`}
              >
                {styles.label}
              </span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <StorageIcon className="size-3.5" />
                {STORAGE_LABELS[item.storage]}
              </span>
              <span>{item.quantity}</span>
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Clock3 className="size-3.5" />
                {daysLeftLabel(item.daysLeft)}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Freshness bar */}
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${styles.bar}`}
          style={{ width: `${item.percentUsed}%` }}
        />
      </div>

      {/* Tips */}
      {item.tips.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            <Lightbulb className="size-4" />
            {expanded ? "Hide ideas" : `Use-it-up ideas (${item.tips.length})`}
          </button>
          {expanded && (
            <ul className="mt-3 space-y-2 rounded-xl bg-cream p-4">
              {item.tips.map((tip) => (
                <li
                  key={tip}
                  className="flex gap-2 text-sm text-accent-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
