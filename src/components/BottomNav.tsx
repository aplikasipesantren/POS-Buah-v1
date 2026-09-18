import React from 'react';
import { ShoppingBag, Package, Mic, BarChart3, User } from 'lucide-react';
import { FruitProduct } from '../types';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDrawer: () => void;
  onOpenVoiceModal: () => void;
  products: FruitProduct[];
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenDrawer,
  onOpenVoiceModal,
  products
}) => {
  const lowStockCount = products.filter(p => p.stockKg <= p.minStockKg).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* Kasir POS */}
        <button
          onClick={() => onSelectTab('pos')}
          id="nav-pos"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-w-[60px] min-h-[44px] ${
            activeTab === 'pos'
              ? 'text-emerald-700 font-extrabold bg-emerald-50 scale-105'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Kasir</span>
        </button>

        {/* Stok / Inventaris */}
        <button
          onClick={() => onSelectTab('inventory')}
          id="nav-inventory"
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-w-[60px] min-h-[44px] ${
            activeTab === 'inventory'
              ? 'text-emerald-700 font-extrabold bg-emerald-50 scale-105'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Stok Buah</span>
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>

        {/* Voice POS Center Highlight Button */}
        <button
          onClick={onOpenVoiceModal}
          id="nav-voice"
          className="relative -top-3 flex flex-col items-center justify-center w-12 h-12 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-transform active:scale-95 ring-4 ring-white"
          aria-label="Aktivasi Perintah Suara"
        >
          <Mic className="w-6 h-6" />
        </button>

        {/* Laporan */}
        <button
          onClick={() => onSelectTab('reports')}
          id="nav-reports"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-w-[60px] min-h-[44px] ${
            activeTab === 'reports'
              ? 'text-emerald-700 font-extrabold bg-emerald-50 scale-105'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Laporan</span>
        </button>

        {/* Profile / Menu Drawer */}
        <button
          onClick={onOpenDrawer}
          id="nav-drawer"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 font-medium transition-all min-w-[60px] min-h-[44px]"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Profil</span>
        </button>

      </div>
    </nav>
  );
};
