import React from 'react';
import { 
  X, ShoppingBag, Package, BarChart3, QrCode, 
  UserCheck, Settings, ShieldCheck, Store, Mic, 
  Users, Building2, User, ChevronRight, Crown, Shield
} from 'lucide-react';
import { FruitProduct, ShiftInfo, UserRole, Branch } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  products: FruitProduct[];
  shiftInfo: ShiftInfo;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  branches: Branch[];
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  onOpenShiftModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenLoginModal?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  products,
  shiftInfo,
  userRole,
  setUserRole,
  branches,
  currentBranchId,
  setCurrentBranchId,
  onOpenShiftModal,
  onOpenVoiceModal,
  onOpenLoginModal
}) => {
  if (!isOpen) return null;

  const lowStockCount = products.filter(p => !p.isDeleted && p.stockKg <= p.minStockKg).length;
  const totalStockKg = products.filter(p => !p.isDeleted).reduce((acc, p) => acc + p.stockKg, 0);

  // Dynamic menu items based on role
  const getMenuItems = () => {
    if (userRole === 'OWNER') {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard / Overview',
          subtitle: 'Statistik Omset Multi-Cabang',
          icon: BarChart3,
          color: 'text-purple-600 bg-purple-100'
        },
        {
          id: 'pos',
          label: 'Kasir Utama (POS)',
          subtitle: 'Penjualan Kilo & Ons',
          icon: ShoppingBag,
          color: 'text-emerald-600 bg-emerald-100'
        },
        {
          id: 'master',
          label: 'Master Data',
          subtitle: 'Produk, Kategori & Satuan',
          icon: Package,
          color: 'text-blue-600 bg-blue-100',
          badge: lowStockCount > 0 ? `${lowStockCount} Kritis` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
        },
        {
          id: 'customers',
          label: 'Data Pelanggan',
          subtitle: 'Pelanggan, Level & Harga Member',
          icon: Users,
          color: 'text-amber-600 bg-amber-100'
        },
        {
          id: 'inventory',
          label: 'Inventori & Cabang',
          subtitle: 'Cabang, Gudang, Supplier & PO',
          icon: Building2,
          color: 'text-indigo-600 bg-indigo-100'
        },
        {
          id: 'employees',
          label: 'Data Karyawan',
          subtitle: 'User Kasir, Admin & PIN Otorisasi',
          icon: UserCheck,
          color: 'text-teal-600 bg-teal-100'
        },
        {
          id: 'reports',
          label: 'Laporan Keuangan',
          subtitle: 'Laporan Transaksi, Pajak & Cabang',
          icon: BarChart3,
          color: 'text-pink-600 bg-pink-100'
        },
        {
          id: 'settings',
          label: 'Pengaturan',
          subtitle: 'Identitas, Payment, Gemini & WA',
          icon: Settings,
          color: 'text-slate-600 bg-slate-100'
        },
        {
          id: 'barcodes',
          label: 'Cetak Barcode',
          subtitle: 'Stiker Timbangan Harga',
          icon: QrCode,
          color: 'text-amber-600 bg-amber-100'
        },
        {
          id: 'profile',
          label: 'Pengaturan Profile',
          subtitle: 'Ubah Data Diri & Avatar',
          icon: User,
          color: 'text-cyan-600 bg-cyan-100'
        }
      ];
    } else if (userRole === 'ADMIN') {
      return [
        {
          id: 'pos',
          label: 'Kasir Utama (POS)',
          subtitle: 'Penjualan Kilo & Ons',
          icon: ShoppingBag,
          color: 'text-emerald-600 bg-emerald-100'
        },
        {
          id: 'dashboard',
          label: 'Dashboard / Overview',
          subtitle: 'Ringkasan Omzet & Performa',
          icon: BarChart3,
          color: 'text-purple-600 bg-purple-100'
        },
        {
          id: 'master',
          label: 'Master Data',
          subtitle: 'Produk, Kategori & Satuan',
          icon: Package,
          color: 'text-blue-600 bg-blue-100'
        },
        {
          id: 'customers',
          label: 'Data Pelanggan',
          subtitle: 'Pelanggan & Member',
          icon: Users,
          color: 'text-amber-600 bg-amber-100'
        },
        {
          id: 'inventory',
          label: 'Inventori & Cabang',
          subtitle: 'Stok Opname, PO & Gudang',
          icon: Building2,
          color: 'text-indigo-600 bg-indigo-100'
        },
        {
          id: 'employees',
          label: 'Data Karyawan',
          subtitle: 'Daftar Staff Kasir',
          icon: UserCheck,
          color: 'text-teal-600 bg-teal-100'
        },
        {
          id: 'reports',
          label: 'Laporan Keuangan',
          subtitle: 'Detail Transaksi & Kasir',
          icon: BarChart3,
          color: 'text-pink-600 bg-pink-100'
        },
        {
          id: 'barcodes',
          label: 'Cetak Barcode',
          subtitle: 'Stiker Timbangan Harga',
          icon: QrCode,
          color: 'text-amber-600 bg-amber-100'
        },
        {
          id: 'profile',
          label: 'Pengaturan Profile',
          subtitle: 'Ubah Profile Admin',
          icon: User,
          color: 'text-cyan-600 bg-cyan-100'
        }
      ];
    } else {
      // KASIR
      return [
        {
          id: 'pos',
          label: 'Kasir Utama (POS)',
          subtitle: 'Penjualan Kilo & Ons',
          icon: ShoppingBag,
          color: 'text-emerald-600 bg-emerald-100'
        },
        {
          id: 'dashboard',
          label: 'Dashboard / Overview',
          subtitle: 'Ringkasan Penjualan Hari Ini',
          icon: BarChart3,
          color: 'text-purple-600 bg-purple-100'
        },
        {
          id: 'master',
          label: 'Master Data (Lihat Stok)',
          subtitle: 'Cek Katalog & Harga Buah',
          icon: Package,
          color: 'text-blue-600 bg-blue-100'
        },
        {
          id: 'customers',
          label: 'Data Pelanggan',
          subtitle: 'Pencarian Member',
          icon: Users,
          color: 'text-amber-600 bg-amber-100'
        },
        {
          id: 'reports',
          label: 'Laporan Transaksi Kasir',
          subtitle: 'Cetak & Share WA Struk',
          icon: BarChart3,
          color: 'text-pink-600 bg-pink-100'
        },
        {
          id: 'barcodes',
          label: 'Cetak Barcode',
          subtitle: 'Stiker Timbangan Harga',
          icon: QrCode,
          color: 'text-amber-600 bg-amber-100'
        },
        {
          id: 'profile',
          label: 'Pengaturan Profile',
          subtitle: 'Profile Staff Kasir',
          icon: User,
          color: 'text-cyan-600 bg-cyan-100'
        }
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Drawer Container */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right border-r border-slate-200">
        
        {/* Drawer Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl border border-white/20">
              🍊
            </div>
            <div>
              <h2 className="font-extrabold text-base leading-snug">FruitKasir Multi</h2>
              <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                <Store className="w-3 h-3 text-amber-300" />
                POS Timbangan Buah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cashier Shift Widget */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">{shiftInfo.cashierName}</div>
              <div className="text-[10px] text-slate-500 font-medium">Shift Active</div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenShiftModal();
            }}
            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-lg shadow-2xs"
          >
            Tutup Shift
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
            Menu Utama ({userRole})
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs leading-tight font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{item.subtitle}</div>
                  </div>
                </div>

                {item.badge ? (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            );
          })}

          <div className="pt-3 text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
            AI Voice POS
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenVoiceModal();
            }}
            className="w-full flex items-center justify-between p-2.5 text-slate-700 hover:bg-emerald-50 rounded-xl transition-colors border border-dashed border-emerald-300 bg-emerald-50/50"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Voice POS</div>
                <div className="text-[10px] text-slate-500">Input transaksi suara</div>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md">
              AI Voice
            </span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Versi 3.0 Multi-Role</span>
          </div>
          <span className="font-bold text-slate-700">{userRole}</span>
        </div>

      </div>
    </div>
  );
};
