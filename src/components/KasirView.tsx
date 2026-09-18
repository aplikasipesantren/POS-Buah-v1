import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Scale, Plus, Minus, Trash2, 
  ShoppingBag, Sparkles, AlertCircle, ArrowRight, X,
  Scan, Mic, Tag, ChevronDown, User, UserPlus, Truck, MapPin, PlusCircle
} from 'lucide-react';
import { FruitProduct, CartItem, FruitCategory, WeightUnit, Customer, OrderType, AppSettings } from '../types';
import { formatRupiah, calculateItemPrice, getUnitLabel } from '../utils/weightUtils';
import { sounds } from '../utils/audioBeep';
import { AddCustomerModal } from './AddCustomerModal';

interface KasirViewProps {
  products: FruitProduct[];
  cartItems: CartItem[];
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  orderType: OrderType;
  onChangeOrderType: (orderType: OrderType) => void;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onAddToCart: (product: FruitProduct, quantity: number, unit: WeightUnit) => void;
  onUpdateCartItemQty: (cartItemId: string, newQty: number) => void;
  onUpdateCartItemUnit: (cartItemId: string, newUnit: WeightUnit) => void;
  onRemoveCartItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenScaleModal: (product: FruitProduct) => void;
  onOpenPaymentModal: (discountAmount: number, taxAmount: number) => void;
  onOpenBarcodeScanner: () => void;
  onOpenVoiceModal: () => void;
  onOpenAddProductModal: () => void;
  isCartMobileOpen: boolean;
  onCloseCartMobile: () => void;
  settings?: AppSettings;
}

export const KasirView: React.FC<KasirViewProps> = ({
  products,
  cartItems,
  customers,
  onAddCustomer,
  orderType,
  onChangeOrderType,
  selectedCustomer,
  onSelectCustomer,
  onAddToCart,
  onUpdateCartItemQty,
  onUpdateCartItemUnit,
  onRemoveCartItem,
  onClearCart,
  onOpenScaleModal,
  onOpenPaymentModal,
  onOpenBarcodeScanner,
  onOpenVoiceModal,
  onOpenAddProductModal,
  isCartMobileOpen,
  onCloseCartMobile,
  settings
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Automatic tax & discount rates from Admin/Owner settings
  const defaultTax = settings?.transactionRules?.enableTax ? (settings.transactionRules.taxPercent ?? 11) : 0;
  const defaultDiscount = settings?.transactionRules?.enableDiscount ? (settings.transactionRules.defaultDiscountPercent ?? 0) : 0;

  const [discountPercent, setDiscountPercent] = useState<number>(defaultDiscount);
  const [taxPercent, setTaxPercent] = useState<number>(defaultTax);

  // Synchronize when settings change in Admin panel
  useEffect(() => {
    if (settings?.transactionRules) {
      setTaxPercent(settings.transactionRules.enableTax ? (settings.transactionRules.taxPercent ?? 11) : 0);
      setDiscountPercent(settings.transactionRules.enableDiscount ? (settings.transactionRules.defaultDiscountPercent ?? 0) : 0);
    }
  }, [settings]);

  // Customer Autocomplete & Modal State
  const [custSearchInput, setCustSearchInput] = useState(selectedCustomer ? selectedCustomer.name : '');
  const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  const categories: string[] = ['Semua', 'Lokal', 'Impor', 'Organik', 'Potong & Jus', 'Premium'];

  // Filter customers for dropdown search autocomplete
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(custSearchInput.toLowerCase()) ||
    c.phone.includes(custSearchInput)
  );

  // Filter fruits based on search & category
  const filteredProducts = products.filter(fruit => {
    const matchesSearch = fruit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fruit.barcode.includes(searchQuery) ||
                          (fruit.origin && fruit.origin.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Semua' || fruit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate cart subtotal, discount, tax, final total
  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableBase * (taxPercent / 100));
  const finalTotal = taxableBase + taxAmount;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pb-24 md:pb-0 md:h-[calc(100vh-5.5rem)]">
      
      {/* LEFT / MAIN COLUMN: FRUIT CATALOG GRID */}
      <div className="md:col-span-7 lg:col-span-8 xl:col-span-9 flex flex-col h-full overflow-hidden space-y-2.5">
        
        {/* Search & Category Header */}
        <div className="flex-none bg-white p-3 sm:p-4 rounded-2xl shadow-2xs border border-slate-200 space-y-3">
          
          {/* Search bar & quick triggers */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama buah, asal, atau scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={onOpenBarcodeScanner}
              className="p-2.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 rounded-xl border border-slate-300 transition-colors"
              title="Pemindai Barcode"
            >
              <Scan className="w-5 h-5 text-emerald-700" />
            </button>

            <button
              onClick={onOpenVoiceModal}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-transform active:scale-95"
              title="Perintah Suara"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Quick Add Product Button (+ Produk) inside search toolbar */}
            <button
              type="button"
              onClick={onOpenAddProductModal}
              id="btn-add-product-toolbar"
              className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              title="Tambah Produk Buah Baru"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>+ Produk</span>
            </button>
          </div>

          {/* Category Pills Slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs scale-102'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Fruit Cards Grid (Scrollable Viewport) */}
        <div className="flex-1 overflow-y-auto pr-1 pb-16 md:pb-2 min-h-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredProducts.map((fruit) => {
            const isLowStock = fruit.stockKg <= fruit.minStockKg && fruit.stockKg > 0;
            const isOutOfStock = fruit.stockKg <= 0;
            const priceOns = fruit.sellingPriceOns || Math.round(fruit.sellingPriceKg / 10);

            return (
              <div
                key={fruit.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                {/* Image & Badges */}
                <div className="relative h-28 sm:h-32 bg-slate-100 overflow-hidden">
                  <img
                    src={fruit.imageUrl}
                    alt={fruit.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category Tag */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                    {fruit.category}
                  </span>

                  {/* Stock Status Badge */}
                  {isOutOfStock ? (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white text-[9px] font-extrabold rounded-md shadow-xs">
                      STOK HABIS
                    </span>
                  ) : isLowStock ? (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black rounded-md shadow-xs flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      {fruit.stockKg.toFixed(1)} kg (Kritis)
                    </span>
                  ) : (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-600/90 text-white text-[9px] font-extrabold rounded-md backdrop-blur-xs shadow-2xs">
                      Stok: {fruit.stockKg.toFixed(1)} kg
                    </span>
                  )}
                </div>

                {/* Fruit Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                      {fruit.name}
                    </h3>
                    {fruit.origin && (
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">
                        📍 {fruit.origin}
                      </p>
                    )}
                  </div>

                  {/* Dual Price Display: Rp / kg and Rp / ons */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <div className="text-xs sm:text-sm font-extrabold text-emerald-800">
                      {formatRupiah(fruit.sellingPriceKg)} <span className="text-[10px] text-slate-500 font-normal">/ kg</span>
                    </div>
                    <div className="text-[10px] font-bold text-amber-700">
                      {formatRupiah(priceOns)} <span className="font-normal text-slate-500">/ ons</span>
                    </div>
                  </div>

                  {/* Quick Weigh & Add Buttons */}
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {/* Scale Weigh Modal Button */}
                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        sounds.playBarcodeBeep();
                        onOpenScaleModal(fruit);
                      }}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 border border-slate-300 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
                      title="Timbang Berat Spesifik"
                    >
                      <Scale className="w-3 h-3 text-emerald-700" />
                      Timbang
                    </button>

                    {/* Quick +1 kg or +1 unit */}
                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        sounds.playBarcodeBeep();
                        onAddToCart(fruit, 1, fruit.unitType === 'unit' ? 'pcs' : 'kg');
                      }}
                      className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-0.5 transition-transform active:scale-95 disabled:opacity-40 shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      {fruit.unitType === 'unit' ? '1 Pcs' : '1 kg'}
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="text-3xl">🔍</div>
            <h4 className="font-bold text-slate-800 text-sm">Buah Tidak Ditemukan</h4>
            <p className="text-xs text-slate-500">Coba kata kunci lain atau pilih kategori "Semua".</p>
          </div>
        )}
      </div>

    </div>

      {/* RIGHT COLUMN: SHOPPING CART PANEL */}
      <div className={`md:col-span-5 lg:col-span-4 xl:col-span-3 h-full overflow-hidden ${
        isCartMobileOpen
          ? 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end h-full max-h-screen'
          : 'hidden md:block'
      }`}>
        
        <div className={`w-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden ${
          isCartMobileOpen ? 'max-w-md h-full pb-16 md:pb-0 rounded-none shadow-2xl animate-slide-left' : ''
        }`}>
          
          {/* Cart Header */}
          <div className="flex-none px-3.5 py-2.5 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <div>
                <h2 className="font-bold text-xs sm:text-sm">Keranjang Belanja</h2>
                <p className="text-[10px] text-slate-400">{cartItems.length} Item Ditimbang</p>
              </div>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            )}

            {isCartMobileOpen && (
              <button onClick={onCloseCartMobile} className="lg:hidden p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Order Type & Customer Selector Header Bar */}
          <div className="flex-none p-2.5 bg-slate-100 border-b border-slate-200 space-y-2">
            
            {/* Row 1: Order Type Pills + Reset Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => onChangeOrderType('TAKE_AWAY')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    orderType === 'TAKE_AWAY'
                      ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                >
                  🥡 Take Away
                </button>
                <button
                  type="button"
                  onClick={() => onChangeOrderType('DELIVERY')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    orderType === 'DELIVERY'
                      ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-300/60'
                  }`}
                >
                  🚚 Delivery
                </button>
              </div>

              {selectedCustomer && (
                <button
                  onClick={() => {
                    onSelectCustomer(null);
                    setCustSearchInput('');
                  }}
                  className="text-[10px] text-red-600 hover:underline font-bold"
                >
                  Reset Umum
                </button>
              )}
            </div>

            {/* Row 2: Customer Search Input & Add Customer Button */}
            <div className="flex items-center gap-1.5 relative">
              <div className="relative flex-1">
                <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pelanggan / member..."
                  value={custSearchInput}
                  onFocus={() => setIsCustDropdownOpen(true)}
                  onChange={(e) => {
                    setCustSearchInput(e.target.value);
                    setIsCustDropdownOpen(true);
                  }}
                  className="w-full text-xs font-bold pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                {custSearchInput && (
                  <button
                    onClick={() => {
                      setCustSearchInput('');
                      onSelectCustomer(null);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center justify-center font-bold"
                title="Tambah Pelanggan Baru"
              >
                <UserPlus className="w-4 h-4" />
              </button>

              {/* Customer Dropdown Results */}
              {isCustDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsCustDropdownOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100 p-1">
                    <button
                      onClick={() => {
                        onSelectCustomer(null);
                        setCustSearchInput('');
                        setIsCustDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center justify-between rounded-lg"
                    >
                      <span>👤 Pelanggan Umum (Tanpa Nama)</span>
                    </button>
                    {filteredCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        onClick={() => {
                          onSelectCustomer(cust);
                          setCustSearchInput(cust.name);
                          setIsCustDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-emerald-50 text-xs text-slate-900 flex items-center justify-between rounded-lg transition-colors"
                      >
                        <div>
                          <div className="font-extrabold text-slate-900">{cust.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span>{cust.phone}</span>
                            <span className="font-bold text-amber-700">🪙 {cust.points || 0} Poin</span>
                          </div>
                        </div>
                        {cust.memberType === 'VIP' && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-300">
                            VIP ⭐
                          </span>
                        )}
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div className="p-3 text-center text-xs text-slate-500">
                        Tidak ada. Klik tombol <span className="font-bold text-emerald-700">'+'</span> untuk tambah.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Selected Customer Details */}
            {selectedCustomer && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1 text-[11px]">
                    👤 {selectedCustomer.name}
                    {selectedCustomer.memberType === 'VIP' && <span className="text-amber-600 font-bold">⭐ VIP</span>}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-mono font-bold">{selectedCustomer.phone}</span>
                </div>
                
                {/* Member Points Row */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200/80">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    🪙 Poin Member: <span className="font-black text-amber-700 text-xs">{selectedCustomer.points || 0} Poin</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800">
                    (+{Math.floor(finalTotal / 10000)} Poin transaksi)
                  </span>
                </div>

                {orderType === 'DELIVERY' && (
                  <div className="text-[10px] text-indigo-900 bg-indigo-50 p-1 rounded-md border border-indigo-200 truncate">
                    <span className="font-bold">📍 Alamat:</span> {selectedCustomer.address || 'Alamat belum diisi'}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Cart Items List - Compact Card Height so 4-5 Items are visible */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-2.5 space-y-2">
            {cartItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className="p-2 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-xl space-y-1.5 transition-colors"
                >
                  {/* Item Top Row: Product info & price & trash */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200/80 flex-none"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">
                          {item.product.name}
                        </h4>
                        <div className="text-[10px] text-slate-500 font-medium">
                          @ Rp {item.effectivePricePerUnit.toLocaleString('id-ID')} / {item.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-none">
                      <div className="text-right">
                        <div className="font-extrabold text-xs text-emerald-800">
                          {formatRupiah(item.totalPrice)}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveCartItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Bottom Row: Unit toggle & Stepper */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/60">
                    {/* Unit Toggle: kg | ons | g */}
                    {item.product.unitType === 'weight' ? (
                      <div className="flex bg-white rounded-md p-0.5 border border-slate-200 text-[9px] font-extrabold">
                        {(['kg', 'ons', 'g'] as WeightUnit[]).map((u) => (
                          <button
                            key={u}
                            onClick={() => onUpdateCartItemUnit(item.id, u)}
                            className={`px-1.5 py-0.5 rounded-xs uppercase transition-all ${
                              item.unit === u
                                ? 'bg-emerald-600 text-white font-black shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-500 uppercase px-1.5 py-0.5 bg-white border border-slate-200 rounded-md">
                        Pack/Pcs
                      </span>
                    )}

                    {/* Stepper buttons */}
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-slate-200">
                      <button
                        onClick={() => onUpdateCartItemQty(item.id, Math.max(0.1, item.quantity - (item.unit === 'ons' ? 1 : item.unit === 'g' ? 100 : 0.1)))}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="font-extrabold text-[11px] text-slate-900 px-1 min-w-[2.5rem] text-center">
                        {item.quantity.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
                      </span>

                      <button
                        onClick={() => onUpdateCartItemQty(item.id, item.quantity + (item.unit === 'ons' ? 1 : item.unit === 'g' ? 100 : 0.1))}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {cartItems.length === 0 && (
              <div className="py-10 text-center space-y-2">
                <div className="text-3xl">🛒</div>
                <div className="text-xs font-bold text-slate-700">Keranjang Kasir Kosong</div>
                <p className="text-[11px] text-slate-500">Pilih buah dari katalog di samping atau gunakan barcode/suara.</p>
              </div>
            )}
          </div>

          {/* Cart Summary & Checkout Footer */}
          <div className="flex-none p-3 bg-slate-50 border-t border-slate-200 rounded-b-2xl space-y-2">
            
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between font-semibold">
                <span>Subtotal ({cartItems.length} item):</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              {/* Diskon (Nominal langsung berdasarkan aturan Admin/Owner) */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span>Diskon {discountPercent > 0 ? `(${discountPercent}%)` : ''}:</span>
                  {settings?.transactionRules?.enableDiscount && discountPercent > 0 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                      ⚡ Aturan Owner
                    </span>
                  )}
                </div>
                <span className={discountAmount > 0 ? "font-extrabold text-red-600" : "font-semibold text-slate-400"}>
                  {discountAmount > 0 ? `-${formatRupiah(discountAmount)}` : formatRupiah(0)}
                </span>
              </div>

              {/* Pajak/PPN (Nominal langsung berdasarkan aturan Admin/Owner) */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span>Pajak PPN {taxPercent > 0 ? `(${taxPercent}%)` : ''}:</span>
                  {settings?.transactionRules?.enableTax && taxPercent > 0 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded border border-amber-200">
                      ⚡ Aturan Admin
                    </span>
                  )}
                </div>
                <span className={taxAmount > 0 ? "font-extrabold text-amber-800" : "font-semibold text-slate-400"}>
                  {taxAmount > 0 ? `+${formatRupiah(taxAmount)}` : formatRupiah(0)}
                </span>
              </div>

              <div className="flex justify-between font-black text-xs sm:text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span className="text-emerald-700 font-black text-sm sm:text-base">{formatRupiah(finalTotal)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              disabled={cartItems.length === 0}
              onClick={() => onOpenPaymentModal(discountAmount, taxAmount)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition-transform active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>BAYAR {formatRupiah(finalTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>

    </div>

      {/* MODAL: TAMBAH PELANGGAN BARU */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onAddCustomer={(newCust) => {
          onAddCustomer(newCust);
          onSelectCustomer(newCust);
          setCustSearchInput(newCust.name);
        }}
      />
    </>
  );
};
