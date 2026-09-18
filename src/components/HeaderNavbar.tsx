import React, { useState, useEffect } from 'react';
import { Menu, ShoppingCart, Store, UserCheck, LogOut } from 'lucide-react';
import { CartItem, ShiftInfo, UserRole, Branch } from '../types';
import { formatRupiah } from '../utils/weightUtils';

interface HeaderNavbarProps {
  onOpenDrawer: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenVoiceModal: () => void;
  onOpenAddProductModal: () => void;
  onOpenCartMobile: () => void;
  cartItems: CartItem[];
  cartTotal: number;
  shiftInfo: ShiftInfo;
  onOpenShiftModal: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  activeTab: string;
  userRole: UserRole;
  branches: Branch[];
  currentBranchId: string;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  onOpenDrawer,
  onOpenBarcodeScanner,
  onOpenVoiceModal,
  onOpenAddProductModal,
  onOpenCartMobile,
  cartItems,
  cartTotal,
  shiftInfo,
  onOpenShiftModal,
  onOpenLoginModal,
  onLogout,
  activeTab,
  userRole,
  branches,
  currentBranchId
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalCartCount = cartItems.length;
  const currentBranch = branches.find(b => b.id === currentBranchId);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Drawer Toggle & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenDrawer}
            id="btn-open-drawer"
            className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            aria-label="Buka Menu Navigation Drawer"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🍎
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  FruitKasir <span className="text-emerald-600 text-xs sm:text-sm font-semibold px-1.5 py-0.5 bg-emerald-100 rounded-md">POS</span>
                </h1>
                
                {/* Role Badge & Switch User */}
                <button
                  onClick={onOpenLoginModal}
                  className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border shadow-2xs hover:opacity-80 transition-opacity flex items-center gap-1 ${
                    userRole === 'OWNER' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                    userRole === 'ADMIN' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                    'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                  title="Klik untuk Ganti Akun Login"
                >
                  <span>{userRole === 'OWNER' && '👑 OWNER'}</span>
                  <span>{userRole === 'ADMIN' && '🛡️ ADMIN'}</span>
                  <span>{userRole === 'KASIR' && '🛒 KASIR'}</span>
                  <span className="text-[9px] text-slate-500 font-normal">↺ Ganti</span>
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Keluar / Logout Akun"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-500 hidden sm:flex items-center gap-1 font-medium">
                <Store className="w-3 h-3 text-emerald-600" />
                {currentBranch?.name || 'Cabang Utama'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Shift Info */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenShiftModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Shift: {shiftInfo.cashierName}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </div>

        {/* Realtime Clock & Mobile Cart Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Cart Drawer Trigger for Mobile & Small Tablet */}
          {activeTab === 'pos' && (
            <button
              onClick={onOpenCartMobile}
              id="btn-open-cart-mobile"
              className="md:hidden relative flex items-center justify-center p-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          {/* Realtime Clock */}
          <div className="hidden sm:flex flex-col items-end justify-center px-3.5 py-1.5 bg-slate-100/90 border border-slate-200/80 rounded-xl shadow-2xs">
            <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5 font-mono">
              <span className="text-emerald-700 text-[9px] font-sans font-black uppercase px-1.5 py-0.2 bg-emerald-100 rounded-md border border-emerald-300">
                LIVE
              </span>
              <span>{timeStr || '00:00:00'}</span>
            </div>
            <div className="text-[11px] sm:text-xs font-extrabold text-slate-600 mt-0.5">
              {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

