import type { City, CityCostRange } from '../cities';

export function midRange(r: CityCostRange | undefined): number {
  if (!r) return 0;
  return (r.min + r.max) / 2;
}

export function lifestyleCost(r: CityCostRange | undefined, mode: 'frugal' | 'moderate' | 'comfortable'): number {
  if (!r) return 0;
  if (mode === 'frugal') return r.min * 0.85;
  if (mode === 'comfortable') return r.max * 1.15;
  return midRange(r);
}

export function singleBudgetMid(city: City): number {
  return midRange(city.monthlyBudget.single);
}
