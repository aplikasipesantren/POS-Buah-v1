import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Scan, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import { FruitProduct } from '../types';
import { sounds } from '../utils/audioBeep';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FruitProduct[];
  onScanSuccess: (product: FruitProduct) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onScanSuccess
}) => {
  if (!isOpen) return null;

  const [manualBarcode, setManualBarcode] = useState('');
  const [lastScanned, setLastScanned] = useState<FruitProduct | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [useCamera, setUseCamera] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let html5Qrcode: Html5Qrcode | null = null;

    if (useCamera) {
      const qrCodeId = 'reader-container';
      
      // Give DOM time to render div
      const timer = setTimeout(() => {
        try {
          html5Qrcode = new Html5Qrcode(qrCodeId);
          scannerRef.current = html5Qrcode;

          html5Qrcode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 160 }
            },
            (decodedText) => {
              handleBarcodeFound(decodedText);
            },
            (error) => {
              // Ignore standard frame scan errors
            }
          ).catch((err) => {
            console.warn('Camera access error:', err);
            setErrorMessage('Kamera tidak diizinkan atau tidak tersedia. Silakan gunakan pemindai simulasi/manual.');
            setUseCamera(false);
          });
        } catch (e) {
          console.warn('HTML5 QRCode error:', e);
          setUseCamera(false);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5Qrcode && html5Qrcode.isScanning) {
          html5Qrcode.stop().then(() => html5Qrcode?.clear()).catch(console.error);
        }
      };
    }
  }, [useCamera]);

  const handleBarcodeFound = (barcodeStr: string) => {
    const cleanCode = barcodeStr.trim();
    const found = products.find(p => p.barcode === cleanCode);

    if (found) {
      sounds.playBarcodeBeep();
      setLastScanned(found);
      setErrorMessage('');
      onScanSuccess(found);
    } else {
      setErrorMessage(`Barcode "${cleanCode}" tidak terdaftar pada katalog buah.`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode) return;
    handleBarcodeFound(manualBarcode);
    setManualBarcode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Pemindai Barcode Buah</h3>
              <p className="text-xs text-slate-300">Scan Stiker Timbangan atau Barcode Produk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport or Manual Fallback */}
        <div className="p-4 overflow-y-auto space-y-4">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setUseCamera(true)}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                useCamera ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              Kamera Langsung
            </button>
            <button
              onClick={() => setUseCamera(false)}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                !useCamera ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scan className="w-4 h-4" />
              Simulasi / Input Barcode
            </button>
          </div>

          {/* Camera Scanner View */}
          {useCamera ? (
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 min-h-[220px] flex items-center justify-center">
              <div id="reader-container" className="w-full h-full text-white"></div>
              
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-56 h-36 border-2 border-emerald-400 rounded-xl relative shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_red]"></div>
                </div>
                <span className="mt-2 text-[11px] font-mono bg-slate-900/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                  Arahkan Barcode ke Dalam Kotak
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  Ketik Nomor Barcode Produk:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: 89910010001"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-transform active:scale-95"
                  >
                    Scan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Success Scan Feedback Alert */}
          {lastScanned && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 animate-fade-in">
              <img
                src={lastScanned.imageUrl}
                alt={lastScanned.name}
                className="w-12 h-12 rounded-lg object-cover border border-emerald-200"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Buah Berhasil Terdeteksi!
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{lastScanned.name}</div>
                <div className="text-xs text-slate-600 font-medium">
                  Barcode: {lastScanned.barcode} • Rp {lastScanned.sellingPriceKg.toLocaleString('id-ID')}/kg
                </div>
              </div>
            </div>
          )}

          {/* Error Feedback */}
          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Test Barcode Presets for quick evaluation */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              Uji Coba Cepat (Barcode Sampel Buah):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 6).map((fruit) => (
                <button
                  key={fruit.id}
                  onClick={() => handleBarcodeFound(fruit.barcode)}
                  className="p-2 bg-slate-50 hover:bg-emerald-50 text-left border border-slate-200 hover:border-emerald-300 rounded-xl transition-all"
                >
                  <div className="text-xs font-bold text-slate-900 truncate">{fruit.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">BC: {fruit.barcode}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Selesai / Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
