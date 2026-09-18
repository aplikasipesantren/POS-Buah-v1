import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily if key exists
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Endpoint: AI Voice Parser fallback for multi-item spoken input
app.post('/api/voice-parse', async (req, res) => {
  try {
    const { spokenText, availableProducts } = req.body;
    if (!spokenText) {
      return res.status(400).json({ error: 'spokenText is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        useFallback: true,
        message: 'Gemini API key not configured, using local rule-based voice parser.'
      });
    }

    const productListStr = availableProducts
      ? availableProducts.map((p: any) => `- ${p.name} (ID: ${p.id}, Barcode: ${p.barcode})`).join('\n')
      : 'No product list provided';

    const prompt = `Anda adalah sistem kecerdasan kasir toko buah ritel di Indonesia.
Tugas Anda adalah menguraikan pesan suara staf kasir dalam Bahasa Indonesia berikut ini menjadi tindakan atau daftar item keranjang kasir.

Teks suara kasir: "${spokenText}"

Daftar Buah yang tersedia di toko:
${productListStr}

Harap analisis dan kembalikan JSON dengan format persis seperti ini:
{
  "action": "ADD_CART" | "SEARCH" | "CLEAR_CART" | "GO_TAB" | "PAY",
  "items": [
    {
      "productName": "nama buah dari daftar",
      "quantity": 1.5,
      "unit": "kg" | "ons" | "g" | "pcs"
    }
  ],
  "targetTab": "pos" | "inventory" | "reports",
  "confidence": 0.95
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const textResult = response.text || '{}';
    const parsed = JSON.parse(textResult);

    res.json({ success: true, result: parsed });
  } catch (error: any) {
    console.error('Gemini Voice Parse Error:', error);
    res.json({ useFallback: true, error: error.message });
  }
});

// AI Endpoint: Intelligent Retail Financial & Inventory Insights
app.post('/api/ai-insights', async (req, res) => {
  try {
    const { salesData, inventoryData } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        insight: 'Laporan Otomatis: Penjualan berjalan stabil. Pastikan stok buah berkadar air tinggi seperti Semangka dan Jeruk tetap dingin dan terjangkau di area display utama.'
      });
    }

    const prompt = `Anda adalah konsultan manajemen bisnis toko buah ritel profesional.
Berikan ringkasan analisis singkat (3-4 kalimat singkat), ramah, dan sangat praktis untuk manajer toko buah berdasarkan data berikut:

Data Penjualan Ringkas: ${JSON.stringify(salesData)}
Data Stok Buah Terkini: ${JSON.stringify(inventoryData)}

Berikan saran prioritas produk yang perlu di-restock, potensi diskon buah cepat matang, serta proyeksi keuntungan. Gunakan Bahasa Indonesia yang ringkas dan profesional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt
    });

    res.json({ success: true, insight: response.text });
  } catch (error: any) {
    res.json({ insight: 'Penjualan dan rotasi stok hari ini terjaga dengan baik.' });
  }
});

async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FruitKasir POS server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
