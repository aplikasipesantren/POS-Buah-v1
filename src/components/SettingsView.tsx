import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Store, CreditCard, Sparkles, MessageSquare, 
  Printer, Sliders, Database, Save, Check, ShieldAlert, Plus, Trash2, QrCode, Upload
} from 'lucide-react';
import { AppSettings, UserRole } from '../types';
import { formatRupiah } from '../utils/weightUtils';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  userRole: UserRole;
  onClearAllTransactions: () => void;
  onOpenAdminPinModal: (callback: () => void) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  setSettings,
  userRole,
  onClearAllTransactions,
  onOpenAdminPinModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'identitas' | 'pembayaran' | 'ai' | 'whatsapp' | 'printer' | 'transaksi' | 'developer'
  >('identitas');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dangerConfirmText, setDangerConfirmText] = useState('');

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleBank = (id: string) => {
    setSettings(prev => ({
      ...prev,
      paymentGateways: {
        ...prev.paymentGateways,
        manualTransfer: {
          ...prev.paymentGateways.manualTransfer,
          banks: prev.paymentGateways.manualTransfer.banks.map(b => 
            b.id === id ? { ...b, enabled: !b.enabled } : b
          )
        }
      }
    }));
  };

  const handleAddBank = () => {
    const newBank = {
      id: `bank-${Date.now()}`,
      bankName: 'Bank BSI',
      bankIcon: '🏦',
      accountNumber: '7112233445',
      accountHolder: 'PT BUAH SEGAR NUSANTARA',
      enabled: true
    };
    setSettings(prev => ({
      ...prev,
      paymentGateways: {
        ...prev.paymentGateways,
        manualTransfer: {
          ...prev.paymentGateways.manualTransfer,
          banks: [...prev.paymentGateways.manualTransfer.banks, newBank]
        }
      }
    }));
  };

  const handleDangerReset = () => {
    if (dangerConfirmText !== 'HAPUS SEMUA DATA') {
      alert('Tuliskan "HAPUS SEMUA DATA" untuk konfirmasi!');
      return;
    }
    onOpenAdminPinModal(() => {
      onClearAllTransactions();
      setDangerConfirmText('');
      alert('Semua data histori transaksi telah dibersihkan!');
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-emerald-600" />
            Pengaturan Sistem Kasir & Integrasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi identitas toko, gateway pembayaran (Duitku/Transfer/QRIS), AI Gemini, WA Gateway, Thermal Printer, dan Aturan Transaksi.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}
        </button>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveSubTab('identitas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'identitas' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🏬 Identitas Toko
        </button>

        <button
          onClick={() => setActiveSubTab('pembayaran')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'pembayaran' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          💳 Metode Pembayaran
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'ai' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ✨ AI Gemini
        </button>

        <button
          onClick={() => setActiveSubTab('whatsapp')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'whatsapp' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          💬 WA Gateway
        </button>

        <button
          onClick={() => setActiveSubTab('printer')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'printer' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🖨️ Thermal Printer
        </button>

        <button
          onClick={() => setActiveSubTab('transaksi')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'transaksi' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚙️ Rules Transaksi
        </button>

        <button
          onClick={() => setActiveSubTab('developer')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'developer' ? 'bg-red-50 text-red-700 shadow-xs border border-red-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🛠️ Backup & Danger Zone
        </button>
      </div>

      {/* SUB-TAB 1: IDENTITAS */}
      {activeSubTab === 'identitas' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">Identitas Aplikasi & Pemilik Toko</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Aplikasi</label>
              <input
                type="text"
                value={settings.identity.appName}
                onChange={(e) => setSettings({ ...settings, identity: { ...settings.identity, appName: e.target.value } })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagline Slogan</label>
              <input
                type="text"
                value={settings.identity.tagline}
                onChange={(e) => setSettings({ ...settings, identity: { ...settings.identity, tagline: e.target.value } })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pemilik Toko</label>
              <input
                type="text"
                value={settings.identity.ownerName}
                onChange={(e) => setSettings({ ...settings, identity: { ...settings.identity, ownerName: e.target.value } })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Toko</label>
              <input
                type="text"
                value={settings.identity.whatsapp}
                onChange={(e) => setSettings({ ...settings, identity: { ...settings.identity, whatsapp: e.target.value } })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Toko Lengkap</label>
              <textarea
                rows={2}
                value={settings.identity.address}
                onChange={(e) => setSettings({ ...settings, identity: { ...settings.identity, address: e.target.value } })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: METODE PEMBAYARAN */}
      {activeSubTab === 'pembayaran' && (
        <div className="space-y-4">
          
          {/* Duitku Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Payment Gateway Duitku</h3>
                <p className="text-xs text-slate-500">Virtual Account, Credit Card & E-Wallet Otomatis</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentGateways.duitku.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      duitku: { ...settings.paymentGateways.duitku, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {settings.paymentGateways.duitku.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mode Environment</label>
                  <select
                    value={settings.paymentGateways.duitku.isSandbox ? 'SANDBOX' : 'PRODUCTION'}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        duitku: { ...settings.paymentGateways.duitku, isSandbox: e.target.value === 'SANDBOX' }
                      }
                    })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="SANDBOX">Sandbox (Testing)</option>
                    <option value="PRODUCTION">Production (Live)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Merchant Code</label>
                  <input
                    type="text"
                    value={settings.paymentGateways.duitku.merchantCode}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        duitku: { ...settings.paymentGateways.duitku, merchantCode: e.target.value }
                      }
                    })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">API Key Duitku</label>
                  <input
                    type="password"
                    value={settings.paymentGateways.duitku.apiKey}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        duitku: { ...settings.paymentGateways.duitku, apiKey: e.target.value }
                      }
                    })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Transfer Manual Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Transfer Bank Manual (Multi-Bank)</h3>
                <p className="text-xs text-slate-500">Tampilkan rekening tujuan pembayaran kasir</p>
              </div>
              <button
                onClick={handleAddBank}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Bank
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {settings.paymentGateways.manualTransfer.banks.map(bank => (
                <div key={bank.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{bank.bankIcon} {bank.bankName}</span>
                    <input
                      type="checkbox"
                      checked={bank.enabled}
                      onChange={() => handleToggleBank(bank.id)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800">{bank.accountNumber}</div>
                  <div className="text-[10px] text-slate-500">a.n {bank.accountHolder}</div>
                </div>
              ))}
            </div>
          </div>

          {/* QRIS Statis Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">QRIS Statis Toko</h3>
                <p className="text-xs text-slate-500">Scan QR Code All Payment (GoPay, OVO, ShopeePay, Dana)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentGateways.qrisStatis.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentGateways: {
                      ...settings.paymentGateways,
                      qrisStatis: { ...settings.paymentGateways.qrisStatis, enabled: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {settings.paymentGateways.qrisStatis.enabled && (
              <div className="flex items-center gap-4 pt-2">
                <img
                  src={settings.paymentGateways.qrisStatis.qrImageUrl}
                  alt="QRIS Statis"
                  className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                />
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">URL Gambar QR Code</label>
                  <input
                    type="text"
                    value={settings.paymentGateways.qrisStatis.qrImageUrl}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentGateways: {
                        ...settings.paymentGateways,
                        qrisStatis: { ...settings.paymentGateways.qrisStatis, qrImageUrl: e.target.value }
                      }
                    })}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUB-TAB 3: AI GEMINI */}
      {activeSubTab === 'ai' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Asisten Gemini Integration
              </h3>
              <p className="text-xs text-slate-500">Dukungan Multi-Model (Gemini 2.5 Flash / Pro) untuk analisis omzet dan rekomendasi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model Gemini AI</label>
              <select
                value={settings.aiGemini.model}
                onChange={(e) => setSettings({ ...settings, aiGemini: { ...settings.aiGemini, model: e.target.value } })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Sangat Cepat & Direkomendasikan)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Kemampuan Analitis Tinggi)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Asisten AI</label>
              <input
                type="text"
                value={settings.aiGemini.assistantName}
                onChange={(e) => setSettings({ ...settings, aiGemini: { ...settings.aiGemini, assistantName: e.target.value } })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom System Prompt AI</label>
              <textarea
                rows={3}
                value={settings.aiGemini.systemPrompt}
                onChange={(e) => setSettings({ ...settings, aiGemini: { ...settings.aiGemini, systemPrompt: e.target.value } })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: WHATSAPP GATEWAY */}
      {activeSubTab === 'whatsapp' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">WhatsApp Gateway Service (Baileys)</h3>
          
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-900">Status Gateway: {settings.waGateway.status}</div>
              <div className="text-[10px] text-emerald-700">Terhubung dengan No: {settings.waGateway.phoneConnected}</div>
            </div>
            <button className="px-3 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs">
              Scan QR Code WA
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Server URL WA API</label>
            <input
              type="text"
              value={settings.waGateway.serverUrl}
              onChange={(e) => setSettings({ ...settings, waGateway: { ...settings.waGateway, serverUrl: e.target.value } })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 5: PRINTER THERMAL */}
      {activeSubTab === 'printer' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-2">Pengaturan Cetak Struk Printer Thermal</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ukuran Kertas Thermal</label>
              <select
                value={settings.thermalPrinter.paperWidth}
                onChange={(e) => setSettings({
                  ...settings,
                  thermalPrinter: { ...settings.thermalPrinter, paperWidth: e.target.value as '58mm' | '80mm' }
                })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="58mm">58 mm (Struk Kasir Standar)</option>
                <option value="80mm">80 mm (Struk Lebar Supermarket)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Header Struk</label>
              <textarea
                rows={2}
                value={settings.thermalPrinter.headerText}
                onChange={(e) => setSettings({
                  ...settings,
                  thermalPrinter: { ...settings.thermalPrinter, headerText: e.target.value }
                })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Footer Struk</label>
              <textarea
                rows={2}
                value={settings.thermalPrinter.footerText}
                onChange={(e) => setSettings({
                  ...settings,
                  thermalPrinter: { ...settings.thermalPrinter, footerText: e.target.value }
                })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: RULES TRANSAKSI */}
      {activeSubTab === 'transaksi' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Fitur & Aturan Transaksi POS</h3>
              <p className="text-xs text-slate-500">Nilai diskon dan PPN/Pajak di bawah ini akan otomatis diterapkan pada keranjang belanja Kasir.</p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300">
              👑 Owner / Admin Config
            </span>
          </div>

          <div className="space-y-3">
            {/* Diskon Toggle & Rate */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Aktifkan Diskon Transaksi Otomatis</div>
                  <div className="text-[10px] text-slate-500">Jika Aktif, diskon otomatis terpasang pada keranjang belanja kasir</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.transactionRules.enableDiscount}
                  onChange={(e) => setSettings({
                    ...settings,
                    transactionRules: { ...settings.transactionRules, enableDiscount: e.target.checked }
                  })}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {settings.transactionRules.enableDiscount && (
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Persentase Diskon Default (%):
                    </label>
                    <select
                      value={settings.transactionRules.defaultDiscountPercent ?? 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        transactionRules: {
                          ...settings.transactionRules,
                          defaultDiscountPercent: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                    >
                      <option value={0}>0% (Tanpa Diskon Default)</option>
                      <option value={5}>5% (Diskon Member Regular)</option>
                      <option value={10}>10% (Diskon Member VIP / Promo)</option>
                      <option value={15}>15% (Diskon Event Khusus)</option>
                      <option value={20}>20% (Diskon Spesial)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Voucher Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">Aktifkan Voucher Belanja</div>
                <div className="text-[10px] text-slate-500">Input kode voucher potongan harga saat transaksi</div>
              </div>
              <input
                type="checkbox"
                checked={settings.transactionRules.enableVoucher}
                onChange={(e) => setSettings({
                  ...settings,
                  transactionRules: { ...settings.transactionRules, enableVoucher: e.target.checked }
                })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Tax / PPN Toggle & Rate */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Aktifkan Pajak Pertambahan Nilai (PPN / PB1)</div>
                  <div className="text-[10px] text-slate-500">Kalkulasi PPN/PB1 otomatis tertera di keranjang kasir dan nota cetak</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.transactionRules.enableTax}
                  onChange={(e) => setSettings({
                    ...settings,
                    transactionRules: { ...settings.transactionRules, enableTax: e.target.checked }
                  })}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {settings.transactionRules.enableTax && (
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Persentase PPN / Pajak Toko (%):
                    </label>
                    <select
                      value={settings.transactionRules.taxPercent}
                      onChange={(e) => setSettings({
                        ...settings,
                        transactionRules: {
                          ...settings.transactionRules,
                          taxPercent: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                    >
                      <option value={11}>11% (PPN Standar Indonesia)</option>
                      <option value={10}>10% (PB1 Pajak Daerah / Toko)</option>
                      <option value={12}>12% (PPN Kenaikan)</option>
                      <option value={5}>5% (Pajak Khusus)</option>
                      <option value={0}>0% (Bebas Pajak)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: DEVELOPER & DANGER ZONE */}
      {activeSubTab === 'developer' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Backup & Restore Database JSON</h3>
            <div className="flex gap-2">
              <button
                onClick={() => alert('Backup file JSON berhasil di-download!')}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Download Backup JSON
              </button>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-900 font-extrabold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Zona Bahaya: Reset Database
            </div>
            <p className="text-xs text-red-700">
              Tindakan ini akan menghapus SELURUH histori transaksi kasir secara permanen. Tindakan tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder='Ketik "HAPUS SEMUA DATA"'
                value={dangerConfirmText}
                onChange={(e) => setDangerConfirmText(e.target.value)}
                className="text-xs p-2.5 bg-white border border-red-300 rounded-xl flex-1 outline-none"
              />
              <button
                onClick={handleDangerReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Hapus Transaksi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
