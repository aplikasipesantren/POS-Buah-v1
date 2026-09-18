import React, { useState, useEffect } from 'react';
import { X, Mic, Sparkles, Check, RefreshCw, Plus, ShoppingBag } from 'lucide-react';
import { FruitProduct, VoiceRecognizedCommand, WeightUnit } from '../types';
import { parseVoiceCommand, parseVoiceMultiItems, DetectedVoiceItem } from '../utils/voiceParser';
import { sounds } from '../utils/audioBeep';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FruitProduct[];
  onAddToCart: (product: FruitProduct, quantity: number, unit: WeightUnit) => void;
  onExecuteCommand: (command: VoiceRecognizedCommand) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onExecuteCommand
}) => {
  if (!isOpen) return null;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedCommand, setRecognizedCommand] = useState<VoiceRecognizedCommand | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedVoiceItem[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  useEffect(() => {
    let recognition: any = null;

    if (isOpen) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          recognition = new SpeechRecognition();
          recognition.lang = 'id-ID';
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onstart = () => {
            setIsListening(true);
            sounds.playVoiceChime();
          };

          recognition.onresult = (event: any) => {
            let currentText = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              currentText += event.results[i][0].transcript;
            }
            setTranscript(currentText);
            processSpokenText(currentText);
          };

          recognition.onerror = (err: any) => {
            console.warn('Speech recognition error:', err);
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
        } catch (e) {
          console.warn('Speech recognition start failed:', e);
        }
      }
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch (e) {}
      }
    };
  }, [isOpen]);

  const handleStartListening = () => {
    setTranscript('');
    setRecognizedCommand(null);
    setDetectedItems([]);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          processSpokenText(text);
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const processSpokenText = async (text: string) => {
    setTranscript(text);

    // Immediate local multi-item rule parsing
    const localParsed = parseVoiceMultiItems(text, products);
    if (localParsed.length > 0) {
      setDetectedItems(localParsed);
    }

    const cmd = parseVoiceCommand(text, products);
    setRecognizedCommand(cmd);

    // Attempt Gemini AI voice parsing for enhanced precision
    try {
      setIsProcessingAI(true);
      const res = await fetch('/api/voice-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spokenText: text,
          availableProducts: products
        })
      });
      const data = await res.json();
      if (data.success && data.result && data.result.items && data.result.items.length > 0) {
        const aiItems: DetectedVoiceItem[] = [];
        for (const item of data.result.items) {
          const found = products.find(p => p.name.toLowerCase().includes(item.productName.toLowerCase()) || item.productName.toLowerCase().includes(p.name.toLowerCase()));
          if (found) {
            aiItems.push({
              product: found,
              quantity: item.quantity || 1,
              unit: (item.unit as WeightUnit) || 'kg'
            });
          }
        }
        if (aiItems.length > 0) {
          setDetectedItems(aiItems);
        }
      }
    } catch (e) {
      console.warn('AI voice parse fallback');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleApplyPreset = (sampleText: string) => {
    processSpokenText(sampleText);
  };

  const handleAddSingleItem = (item: DetectedVoiceItem) => {
    sounds.playBarcodeBeep();
    onAddToCart(item.product, item.quantity, item.unit);
    // Remove added item from detected list
    setDetectedItems(prev => prev.filter(i => i.product.id !== item.product.id));
  };

  const handleAddAllItems = () => {
    if (detectedItems.length === 0) return;
    sounds.playBarcodeBeep();
    detectedItems.forEach(item => {
      onAddToCart(item.product, item.quantity, item.unit);
    });
    setDetectedItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Pencatatan Suara (Voice POS)</h3>
              <p className="text-xs text-emerald-100">Bicara Langsung untuk Tambah Banyak Item Sekaligus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-center">
          
          {/* Animated Microphone Pulse Circle */}
          <div className="flex flex-col items-center justify-center pt-1">
            <button
              onClick={handleStartListening}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white ring-8 ring-red-200 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:scale-105'
              }`}
            >
              <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
            </button>

            <div className="mt-2.5 text-xs font-bold text-slate-700">
              {isListening ? (
                <span className="text-red-600 flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  Mendengarkan... Silakan bicara sekarang
                </span>
              ) : (
                <span className="text-slate-500">Ketuk Mikrofon untuk Mulai Bicara</span>
              )}
            </div>
          </div>

          {/* Transcript Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Hasil Transkrip Suara:</span>
              {isProcessingAI && (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  AI Gemini Menguraikan...
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-900 min-h-[36px] italic">
              {transcript ? `"${transcript}"` : 'Belum ada input suara. Silakan coba tekan mikrofon atau pilih contoh kalimat di bawah.'}
            </p>
          </div>

          {/* Parsed Multi-Product Result Section */}
          {detectedItems.length > 0 && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-left space-y-2.5 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-900 bg-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-800" />
                  PRODUK TERDETEKSI ({detectedItems.length} Item)
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Bisa tambah sekaligus atau satu-satu</span>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {detectedItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 flex-none"
                      />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-xs truncate">{item.product.name}</h4>
                        <p className="text-[11px] font-bold text-emerald-800">
                          Jumlah: <span className="text-emerald-700 font-black">{item.quantity} {item.unit}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddSingleItem(item)}
                      className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 flex-none transition-colors"
                      title="Tambah item ini saja"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>
                ))}
              </div>

              {/* Add All Button */}
              <button
                onClick={handleAddAllItems}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                Tambah Semua ({detectedItems.length}) Item Ke Keranjang
              </button>
            </div>
          )}

          {/* Example Prompt Chips for Field Staff Testing */}
          <div className="text-left space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Contoh Perintah Suara (Multi-Produk Sekaligus):
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleApplyPreset('tambahkan Mangga 1 kilo semangka 1 kilo dan buah naga 1 kilo')}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-xs border border-amber-300 transition-colors text-left"
              >
                "tambahkan Mangga 1 kilo semangka 1 kilo dan buah naga 1 kilo"
              </button>
              <button
                onClick={() => handleApplyPreset('Beli 2.5 kilo Apel Fuji, 1 kilo Jeruk, dan 5 ons Alpukat')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-300 transition-colors"
              >
                "Beli 2.5 kg Apel, 1 kg Jeruk, 5 ons Alpukat"
              </button>
              <button
                onClick={() => handleApplyPreset('3 pack Paket Buah Potong dan 2 kg Semangka')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-300 transition-colors"
              >
                "3 pack Paket Buah Potong dan 2 kg Semangka"
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-medium">Dukungan Bahasa Indonesia</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

