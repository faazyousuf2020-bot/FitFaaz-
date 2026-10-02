import type { Food, Walk } from "./types";
import { sum } from "./util";

export type Totals = { kcal: number; p: number; c: number; f: number; fib: number };
export const foodTotals = (rows: Food[]): Totals => ({
  kcal: sum(rows, (r) => r.kcal), p: sum(rows, (r) => r.p ?? 0), c: sum(rows, (r) => r.c ?? 0),
  f: sum(rows, (r) => r.f ?? 0), fib: sum(rows, (r) => r.fib ?? 0),
});
export const foodOn = (food: Food[], date: string) => foodTotals(food.filter((r) => r.date === date));

export type LiveWalkLike = { date: string; secs: number; m: number; steps: number; kcal: number } | null;
export function walkOn(walks: Walk[], date: string, live: LiveWalkLike) {
  const ws = walks.filter((w) => w.date === date);
  const l = live && live.date === date ? live : null;
  return {
    count: ws.length + (l ? 1 : 0),
    secs: sum(ws, (w) => w.secs) + (l?.secs ?? 0),
    m: sum(ws, (w) => w.m) + (l?.m ?? 0),
    steps: sum(ws, (w) => w.steps) + (l?.steps ?? 0),
    kcal: sum(ws, (w) => w.kcal) + (l?.kcal ?? 0),
  };
}
