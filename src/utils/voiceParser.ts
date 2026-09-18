import { FruitProduct, WeightUnit, VoiceRecognizedCommand } from '../types';

export interface DetectedVoiceItem {
  product: FruitProduct;
  quantity: number;
  unit: WeightUnit;
}

/**
 * Extract quantity and unit from a sub-string phrase
 */
export function extractQtyAndUnit(phrase: string): { quantity: number; unit: WeightUnit } {
  let unit: WeightUnit = 'kg';
  const norm = phrase.toLowerCase();

  if (norm.includes('ons') || norm.includes('on ')) {
    unit = 'ons';
  } else if (norm.includes('gram') || norm.includes('g ')) {
    unit = 'g';
  } else if (norm.includes('pack') || norm.includes('pcs') || norm.includes('biji') || norm.includes('buah') || norm.includes('butir')) {
    unit = 'pcs';
  } else if (norm.includes('kilo') || norm.includes('kg')) {
    unit = 'kg';
  }

  const cleaned = norm
    .replace('setengah', '0.5')
    .replace('satu setengah', '1.5')
    .replace('dua setengah', '2.5')
    .replace('tiga setengah', '3.5')
    .replace('satu', '1')
    .replace('dua', '2')
    .replace('tiga', '3')
    .replace('empat', '4')
    .replace('lima', '5')
    .replace('enam', '6')
    .replace('tujuh', '7')
    .replace('delapan', '8')
    .replace('sembilan', '9')
    .replace('sepuluh', '10')
    .replace('koma', '.');

  let quantity = 1.0;
  const matches = cleaned.match(/\d+(\.\d+)?/g);
  if (matches && matches.length > 0) {
    const parsed = parseFloat(matches[0]);
    if (!isNaN(parsed) && parsed > 0) {
      quantity = parsed;
    }
  }

  return { quantity, unit };
}

/**
 * Parses spoken Indonesian text into multiple structured POS product items
 */
export function parseVoiceMultiItems(text: string, availableFruits: FruitProduct[]): DetectedVoiceItem[] {
  const normalizedText = text.toLowerCase().trim();
  if (!normalizedText) return [];

  const matchedPositions: { fruit: FruitProduct; index: number; nameLength: number }[] = [];

  for (const fruit of availableFruits) {
    const fruitName = fruit.name.toLowerCase();
    const keywords = fruitName.split(' ');

    let foundIndex = normalizedText.indexOf(fruitName);
    if (foundIndex !== -1) {
      matchedPositions.push({ fruit, index: foundIndex, nameLength: fruitName.length });
      continue;
    }

    for (const kw of keywords) {
      if (kw.length > 2 && !['buah', 'super', 'manis', 'impor', 'lokal', 'organik', 'segar', 'paket', 'non', 'biji', 'merah'].includes(kw)) {
        foundIndex = normalizedText.indexOf(kw);
        if (foundIndex !== -1) {
          if (!matchedPositions.some(m => m.fruit.id === fruit.id)) {
            matchedPositions.push({ fruit, index: foundIndex, nameLength: kw.length });
          }
          break;
        }
      }
    }
  }

  if (matchedPositions.length === 0) {
    return [];
  }

  matchedPositions.sort((a, b) => a.index - b.index);

  const results: DetectedVoiceItem[] = [];

  for (let i = 0; i < matchedPositions.length; i++) {
    const current = matchedPositions[i];
    const prevEndIdx = i > 0 ? matchedPositions[i - 1].index + matchedPositions[i - 1].nameLength : 0;
    const nextStartIdx = i < matchedPositions.length - 1 ? matchedPositions[i + 1].index : normalizedText.length;

    const segment = normalizedText.substring(prevEndIdx, nextStartIdx);
    const { quantity, unit } = extractQtyAndUnit(segment);

    results.push({
      product: current.fruit,
      quantity,
      unit
    });
  }

  return results;
}

/**
 * Parses spoken Indonesian text into structured POS commands
 */
export function parseVoiceCommand(text: string, availableFruits: FruitProduct[]): VoiceRecognizedCommand {
  const normalizedText = text.toLowerCase().trim();

  // Navigation commands
  if (normalizedText.includes('kasir') || normalizedText.includes('halaman utama')) {
    return { action: 'GO_TAB', targetTab: 'pos', rawText: text, confidence: 0.95 };
  }
  if (normalizedText.includes('stok') || normalizedText.includes('inventaris') || normalizedText.includes('gudang')) {
    return { action: 'GO_TAB', targetTab: 'inventory', rawText: text, confidence: 0.95 };
  }
  if (normalizedText.includes('laporan') || normalizedText.includes('keuangan')) {
    return { action: 'GO_TAB', targetTab: 'reports', rawText: text, confidence: 0.95 };
  }

  // Clear cart
  if (normalizedText.includes('kosongkan keranjang') || normalizedText.includes('hapus keranjang') || normalizedText.includes('batal semua')) {
    return { action: 'CLEAR_CART', rawText: text, confidence: 0.95 };
  }

  // Pay
  if (normalizedText.includes('bayar') || normalizedText.includes('proses pembayaran')) {
    return { action: 'PAY', rawText: text, confidence: 0.9 };
  }

  // Multi-item check
  const multiItems = parseVoiceMultiItems(text, availableFruits);
  if (multiItems.length > 0) {
    const first = multiItems[0];
    return {
      action: 'ADD_CART',
      productName: first.product.name,
      quantity: first.quantity,
      unit: first.unit,
      rawText: text,
      confidence: 0.95
    };
  }

  // Fallback to Search
  const searchTerms = normalizedText
    .replace(/tambah|beli|cari|masukkan|pesan|kilo|kg|ons|gram|pack|pcs|\d+|setengah|koma/gi, '')
    .trim();

  if (searchTerms.length > 1) {
    return {
      action: 'SEARCH',
      productName: searchTerms,
      rawText: text,
      confidence: 0.7
    };
  }

  return {
    action: 'UNKNOWN',
    rawText: text,
    confidence: 0.2
  };
}

