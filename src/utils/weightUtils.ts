import { FruitProduct, WeightUnit } from '../types';

/**
 * Format currency to IDR string
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Convert quantity from selected unit to equivalent weight in KG
 */
export function convertToKg(quantity: number, unit: WeightUnit): number {
  switch (unit) {
    case 'kg':
      return quantity;
    case 'ons':
      return quantity * 0.1; // 1 ons = 100 gram = 0.1 kg
    case 'g':
      return quantity / 1000; // 1000 gram = 1 kg
    case 'pcs':
      return quantity; // stored as unit count
    default:
      return quantity;
  }
}

/**
 * Calculate item price based on unit and quantity
 */
export function calculateItemPrice(product: FruitProduct, quantity: number, unit: WeightUnit): number {
  if (product.unitType === 'unit') {
    return (product.sellingPriceUnit || product.sellingPriceKg) * quantity;
  }

  switch (unit) {
    case 'kg':
      return product.sellingPriceKg * quantity;
    case 'ons':
      const priceOns = product.sellingPriceOns || Math.round(product.sellingPriceKg / 10);
      return priceOns * quantity;
    case 'g':
      const priceGram = product.sellingPriceKg / 1000;
      return Math.round(priceGram * quantity);
    case 'pcs':
      return (product.sellingPriceUnit || product.sellingPriceKg) * quantity;
    default:
      return product.sellingPriceKg * quantity;
  }
}

/**
 * Get unit label display text
 */
export function getUnitLabel(unit: WeightUnit): string {
  switch (unit) {
    case 'kg':
      return 'Kilogram (kg)';
    case 'ons':
      return 'Ons (100 gram)';
    case 'g':
      return 'Gram (g)';
    case 'pcs':
      return 'Pack / Pcs';
    default:
      return unit;
  }
}

/**
 * Format weight string with auto unit scaling (e.g., 0.5 kg -> 500 gram or 5 ons)
 */
export function formatWeightDisplay(amountKg: number, preferUnit: WeightUnit = 'kg'): string {
  if (preferUnit === 'ons') {
    const ons = amountKg * 10;
    return `${ons.toLocaleString('id-ID', { maximumFractionDigits: 1 })} ons`;
  }
  if (preferUnit === 'g') {
    const grams = amountKg * 1000;
    return `${grams.toLocaleString('id-ID', { maximumFractionDigits: 0 })} g`;
  }
  return `${amountKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg`;
}
