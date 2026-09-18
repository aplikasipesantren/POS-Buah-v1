import React, { useState, useEffect } from 'react';
import { HeaderNavbar } from './components/HeaderNavbar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BottomNav } from './components/BottomNav';
import { KasirView } from './components/KasirView';
import { MasterDataView } from './components/MasterDataView';
import { CustomerManagementView } from './components/CustomerManagementView';
import { InventoryModuleView } from './components/InventoryModuleView';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';
import { ReportsView } from './components/ReportsView';
import { BarcodeGeneratorView } from './components/BarcodeGeneratorView';
import { DashboardView } from './components/DashboardView';

import { WeightScaleModal } from './components/WeightScaleModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ShiftModal } from './components/ShiftModal';
import { ShiftReceiptModal, ShiftReportData } from './components/ShiftReceiptModal';
import { AddProductModal } from './components/AddProductModal';
import { AdminPinModal } from './components/AdminPinModal';
import { LoginModal } from './components/LoginModal';

import { 
  FruitProduct, CartItem, Transaction, RestockLog, 
  ShiftInfo, WeightUnit, PaymentMethod, VoiceRecognizedCommand,
  Customer, OrderType, UserRole, UserProfile, Branch, Warehouse, Supplier,
  PurchaseOrder, StockOpname, Employee, AppSettings, FruitCategory, UnitDefinition
} from './types';

import { INITIAL_FRUITS } from './data/initialFruits';
import { 
  INITIAL_BRANCHES, INITIAL_WAREHOUSES, INITIAL_SUPPLIERS, 
  INITIAL_EMPLOYEES, INITIAL_SETTINGS, INITIAL_UNITS 
} from './data/initialData';

import { convertToKg, calculateItemPrice } from './utils/weightUtils';
import { sounds } from './utils/audioBeep';

export default function App() {
  // Multi-Role & Profile State
  const [userRole, setUserRole] = useState<UserRole>('OWNER'); // OWNER, ADMIN, KASIR
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr-1',
    name: 'Bpk. Budi Santoso (Owner)',
    email: 'budi.owner@fruitkasir.id',
    phone: '0812-9988-7766',
    role: 'OWNER',
    branchId: 'b1',
    pin: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });

  // Master Data States
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentBranchId, setCurrentBranchId] = useState<string>('b1');
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  const [categories, setCategories] = useState<FruitCategory[]>([
    { id: 'cat-1', name: 'Buah Impor Premium', description: 'Buah-buahan segar impor kualitas super', icon: '🍎' },
    { id: 'cat-2', name: 'Buah Lokal Nusantara', description: 'Hasil panen kebun lokal nusantara', icon: '🥑' },
    { id: 'cat-3', name: 'Buah Potong & Praktis', description: 'Siap saji dalam mika & kemasan harian', icon: '🍉' },
    { id: 'cat-4', name: 'Parcel & Hampers', description: 'Paket hampers kado & kado keranjang', icon: '🎁' }
  ]);
  const [units, setUnits] = useState<UnitDefinition[]>(INITIAL_UNITS);

  // Products with LocalStorage
  const [products, setProducts] = useState<FruitProduct[]>(() => {
    const saved = localStorage.getItem('fruitkasir_products');
    if (!saved) return INITIAL_FRUITS;
    try {
      const parsed: FruitProduct[] = JSON.parse(saved);
      return parsed.map(p => {
        const match = INITIAL_FRUITS.find(i => i.id === p.id);
        if (match && match.imageUrl && match.imageUrl !== p.imageUrl) {
          return { ...p, imageUrl: match.imageUrl };
        }
        return p;
      });
    } catch (e) {
      return INITIAL_FRUITS;
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fruitkasir_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('fruitkasir_customers');
    return saved ? JSON.parse(saved) : [
      {
        id: 'cust-1',
        name: 'Ibu Rahma Santoso',
        phone: '0812-3456-7890',
        address: 'Jl. Melati No. 12, Kel. Pasarkuning, Jakarta Selatan',
        memberType: 'VIP',
        points: 240,
        totalSpend: 2400000,
        totalOrders: 14,
        createdAt: '2026-01-15',
        isDeleted: false
      },
      {
        id: 'cust-2',
        name: 'Bpk. Hendra Gunawan',
        phone: '0857-9988-7766',
        address: 'Komp. Buah Indah Blok B5 No. 3, Jakarta Barat',
        memberType: 'REGULAR',
        points: 85,
        totalSpend: 850000,
        totalOrders: 5,
        createdAt: '2026-03-10',
        isDeleted: false
      },
      {
        id: 'cust-3',
        name: 'Siti Nurhaliza',
        phone: '0813-1122-3344',
        address: 'Jl. Mangga Dua No. 44, Jakarta Pusat',
        memberType: 'REGULAR',
        points: 30,
        totalSpend: 300000,
        totalOrders: 2,
        createdAt: '2026-06-01',
        isDeleted: false
      }
    ];
  });

  const [orderType, setOrderType] = useState<OrderType>('TAKE_AWAY');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fruitkasir_txs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'tx-101',
        receiptNumber: 'FK-20260731-001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        cashierName: 'Budi Santoso',
        items: [
          {
            id: 'c-1',
            product: INITIAL_FRUITS[0],
            quantity: 2.0,
            unit: 'kg',
            effectivePricePerUnit: 36000,
            totalPrice: 72000
          },
          {
            id: 'c-2',
            product: INITIAL_FRUITS[1],
            quantity: 5,
            unit: 'ons',
            effectivePricePerUnit: 3000,
            totalPrice: 15000
          }
        ],
        subtotal: 87000,
        discount: 0,
        tax: 0,
        totalAmount: 87000,
        paymentMethod: 'CASH',
        cashPaid: 100000,
        cashChange: 13000,
        customerName: 'Ibu Rahma Santoso',
        customerPhone: '0812-3456-7890',
        orderType: 'TAKE_AWAY',
        status: 'COMPLETED'
      }
    ];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po-001',
      poNumber: 'PO-202607-001',
      supplierId: 'sup-1',
      supplierName: 'PT Buah Impor Nusantara',
      branchId: 'b1',
      items: [
        { productId: 'f-1', productName: 'Apel Fuji Super', quantityKg: 100, costPerKg: 30000, totalPrice: 3000000 }
      ],
      totalCost: 3000000,
      status: 'APPROVED',
      createdAt: '2026-07-28'
    }
  ]);

  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>([
    {
      id: 'op-001',
      date: '2026-07-30',
      productId: 'f-1',
      productName: 'Apel Fuji Super',
      systemQtyKg: 45.5,
      actualQtyKg: 44.0,
      differenceKg: -1.5,
      notes: 'Buah memar di dasar peti',
      adjustedBy: 'Budi Santoso'
    }
  ]);

  const [restockLogs, setRestockLogs] = useState<RestockLog[]>([]);

  const [shiftInfo, setShiftInfo] = useState<ShiftInfo>({
    isOpen: true,
    cashierName: userProfile.name,
    startTime: new Date().toISOString(),
    initialCash: 300000,
    totalCashSales: 87000,
    totalNonCashSales: 0,
    expectedCashInDrawer: 387000
  });

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [scaleModalProduct, setScaleModalProduct] = useState<FruitProduct | null>(null);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [cartTax, setCartTax] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [activeShiftReport, setActiveShiftReport] = useState<ShiftReportData | null>(null);
  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);
  // User Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('fruitkasir_logged_in') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Login Success Handler
  const handleLoginSuccess = (newProfile: UserProfile, role: UserRole, branchId: string) => {
    setUserProfile(newProfile);
    setUserRole(role);
    setCurrentBranchId(branchId);
    setShiftInfo(prev => ({
      ...prev,
      cashierName: newProfile.name
    }));
    setIsLoggedIn(true);
    localStorage.setItem('fruitkasir_logged_in', 'true');
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('fruitkasir_logged_in');
    setIsLoginModalOpen(true);
  };

  // Admin PIN Protection State
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [pinCallback, setPinCallback] = useState<(() => void) | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('fruitkasir_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fruitkasir_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('fruitkasir_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('fruitkasir_txs', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  // Cart Calculations
  const cartSubtotal = cartItems.reduce((acc, i) => acc + i.totalPrice, 0);

  // Handlers for Cart
  const handleAddToCart = (product: FruitProduct, quantity: number, unit: WeightUnit, notes?: string) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.unit === unit);
      
      const effectivePrice = calculateItemPrice(product, 1, unit);
      
      if (existingIdx >= 0) {
        const copy = [...prev];
        const newQty = copy[existingIdx].quantity + quantity;
        const newTotal = calculateItemPrice(product, newQty, unit);
        
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: newQty,
          totalPrice: newTotal,
          notes: notes || copy[existingIdx].notes
        };
        return copy;
      } else {
        const itemTotal = calculateItemPrice(product, quantity, unit);
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          quantity,
          unit,
          effectivePricePerUnit: effectivePrice,
          totalPrice: itemTotal,
          notes
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateCartItemQty = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newTotal = calculateItemPrice(item.product, newQty, item.unit);
        return {
          ...item,
          quantity: newQty,
          totalPrice: newTotal
        };
      }
      return item;
    }));
  };

  const handleUpdateCartItemUnit = (cartItemId: string, newUnit: WeightUnit) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        let newQty = item.quantity;
        if (item.unit === 'kg' && newUnit === 'ons') newQty = item.quantity * 10;
        else if (item.unit === 'ons' && newUnit === 'kg') newQty = item.quantity / 10;
        else if (newUnit === 'g') newQty = convertToKg(item.quantity, item.unit) * 1000;

        const effectivePrice = calculateItemPrice(item.product, 1, newUnit);
        const newTotal = calculateItemPrice(item.product, newQty, newUnit);

        return {
          ...item,
          unit: newUnit,
          quantity: newQty,
          effectivePricePerUnit: effectivePrice,
          totalPrice: newTotal
        };
      }
      return item;
    }));
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Payment Processing
  const handleCompletePayment = (
    method: PaymentMethod,
    cashPaid?: number,
    cashChange?: number,
    customerName?: string,
    notes?: string
  ) => {
    const txId = `tx-${Date.now()}`;
    const receiptNum = `FK-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`;

    const finalCustomerName = selectedCustomer ? selectedCustomer.name : customerName;
    const finalCustomerPhone = selectedCustomer ? selectedCustomer.phone : undefined;
    const finalCustomerAddress = selectedCustomer ? selectedCustomer.address : undefined;

    const finalTotal = cartSubtotal - cartDiscount + cartTax;

    // Calculate member reward points (1 Point for every Rp 10.000 spent)
    const pointsEarned = Math.floor(finalTotal / 10000);

    let updatedPoints = pointsEarned;
    let targetCustId = selectedCustomer?.id;

    if (selectedCustomer) {
      const currentPts = selectedCustomer.points || 0;
      updatedPoints = currentPts + pointsEarned;

      setCustomers(prev => prev.map(c => {
        if (c.id === selectedCustomer.id) {
          return {
            ...c,
            points: updatedPoints,
            totalSpend: (c.totalSpend || 0) + finalTotal,
            totalOrders: (c.totalOrders || 0) + 1
          };
        }
        return c;
      }));
    } else if (customerName) {
      const found = customers.find(c => c.name.toLowerCase().trim() === customerName.toLowerCase().trim());
      if (found) {
        targetCustId = found.id;
        const currentPts = found.points || 0;
        updatedPoints = currentPts + pointsEarned;
        setCustomers(prev => prev.map(c => {
          if (c.id === found.id) {
            return {
              ...c,
              points: updatedPoints,
              totalSpend: (c.totalSpend || 0) + finalTotal,
              totalOrders: (c.totalOrders || 0) + 1
            };
          }
          return c;
        }));
      }
    }

    const newTx: Transaction = {
      id: txId,
      receiptNumber: receiptNum,
      timestamp: new Date().toISOString(),
      cashierName: shiftInfo.cashierName,
      items: [...cartItems],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      tax: cartTax,
      totalAmount: finalTotal,
      paymentMethod: method,
      cashPaid,
      cashChange,
      orderType,
      customerId: targetCustId,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerAddress: finalCustomerAddress,
      pointsEarned: pointsEarned,
      totalCustomerPoints: updatedPoints,
      notes,
      status: 'COMPLETED'
    };

    setTransactions(prev => [newTx, ...prev]);

    // Real-Time Inventory Stock Deduction
    setProducts(prevProducts => prevProducts.map(prod => {
      const soldItems = cartItems.filter(ci => ci.product.id === prod.id);
      if (soldItems.length > 0) {
        let totalKgDeduction = 0;
        soldItems.forEach(item => {
          totalKgDeduction += convertToKg(item.quantity, item.unit);
        });
        const updatedStock = Math.max(0, Math.round((prod.stockKg - totalKgDeduction) * 100) / 100);
        return {
          ...prod,
          stockKg: updatedStock
        };
      }
      return prod;
    }));

    // Update Shift Totals
    setShiftInfo(prev => ({
      ...prev,
      totalCashSales: method === 'CASH' ? prev.totalCashSales + finalTotal : prev.totalCashSales,
      totalNonCashSales: method !== 'CASH' ? prev.totalNonCashSales + finalTotal : prev.totalNonCashSales,
      expectedCashInDrawer: method === 'CASH' ? prev.expectedCashInDrawer + finalTotal : prev.expectedCashInDrawer
    }));

    // Reset Cart & Show Receipt
    setCartItems([]);
    setCartDiscount(0);
    setCartTax(0);
    setSelectedCustomer(null);
    setOrderType('TAKE_AWAY');
    setIsPaymentModalOpen(false);
    setIsCartMobileOpen(false);
    setActiveReceiptTx(newTx);
  };

  // Product Handlers
  const handleAddProduct = (newProd: Omit<FruitProduct, 'id'>) => {
    const product: FruitProduct = {
      ...newProd,
      id: `fruit-${Date.now()}`,
      isDeleted: false
    };
    setProducts(prev => [product, ...prev]);
  };

  const handleUpdateProduct = (productId: string, updated: Partial<FruitProduct>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updated } : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isDeleted: true } : p));
  };

  const handleRestock = (productId: string, amountKg: number, costPerKg: number, supplier: string, notes?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockKg: p.stockKg + amountKg,
          costPriceKg: costPerKg
        };
      }
      return p;
    }));

    const found = products.find(p => p.id === productId);
    const newLog: RestockLog = {
      id: `restock-${Date.now()}`,
      productId,
      productName: found?.name || 'Buah',
      amountKg,
      costPerKg,
      totalCost: amountKg * costPerKg,
      supplier,
      timestamp: new Date().toISOString(),
      notes
    };
    setRestockLogs(prev => [newLog, ...prev]);
  };

  const handleRefundTransaction = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx || tx.status === 'REFUNDED') return;

    setProducts(prev => prev.map(p => {
      const refundedItems = tx.items.filter(item => item.product.id === p.id);
      if (refundedItems.length > 0) {
        let totalKgRestored = 0;
        refundedItems.forEach(item => {
          totalKgRestored += convertToKg(item.quantity, item.unit);
        });
        return {
          ...p,
          stockKg: Math.round((p.stockKg + totalKgRestored) * 100) / 100
        };
      }
      return p;
    }));

    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'REFUNDED' } : t));
  };

  // Admin PIN Protection Callback Helper
  const triggerAdminPinCheck = (actionCallback: () => void) => {
    setPinCallback(() => actionCallback);
    setIsAdminPinModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-200">
      
      {/* Header Bar */}
      <HeaderNavbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenAddProductModal={() => setIsAddProductModalOpen(true)}
        onOpenCartMobile={() => setIsCartMobileOpen(true)}
        cartItems={cartItems}
        cartTotal={cartSubtotal}
        shiftInfo={shiftInfo}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        userRole={userRole}
        branches={branches}
        currentBranchId={currentBranchId}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-4 pb-20 md:pb-3">
        
        {/* TAB 0: DASHBOARD / OVERVIEW OPERASIONAL */}
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            products={products}
            customers={customers}
            branches={branches}
            currentBranchId={currentBranchId}
            userRole={userRole}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenReceipt={(tx) => setActiveReceiptTx(tx)}
            onOpenShiftModal={() => setIsShiftModalOpen(true)}
          />
        )}

        {/* TAB 1: KASIR POS */}
        {activeTab === 'pos' && (
          <KasirView
            products={products.filter(p => !p.isDeleted)}
            cartItems={cartItems}
            customers={customers.filter(c => !c.isDeleted)}
            onAddCustomer={handleAddCustomer}
            orderType={orderType}
            onChangeOrderType={(t) => setOrderType(t)}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={(c) => setSelectedCustomer(c)}
            onAddToCart={handleAddToCart}
            onUpdateCartItemQty={handleUpdateCartItemQty}
            onUpdateCartItemUnit={handleUpdateCartItemUnit}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onOpenScaleModal={(fruit) => setScaleModalProduct(fruit)}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            isCartMobileOpen={isCartMobileOpen}
            onCloseCartMobile={() => setIsCartMobileOpen(false)}
            settings={settings}
          />
        )}

        {/* TAB 2: MASTER DATA (Produk, Kategori, Satuan) */}
        {activeTab === 'master' && (
          <MasterDataView
            products={products}
            setProducts={setProducts}
            categories={categories}
            setCategories={setCategories}
            units={units}
            setUnits={setUnits}
            userRole={userRole}
          />
        )}

        {/* TAB 3: DATA PELANGGAN & MEMBER */}
        {activeTab === 'customers' && (
          <CustomerManagementView
            customers={customers}
            setCustomers={setCustomers}
            userRole={userRole}
          />
        )}

        {/* TAB 4: INVENTORI & CABANG (Cabang, Gudang, Supplier, PO, Opname, Produksi) */}
        {activeTab === 'inventory' && (
          <InventoryModuleView
            branches={branches}
            setBranches={setBranches}
            warehouses={warehouses}
            setWarehouses={setWarehouses}
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            products={products}
            setProducts={setProducts}
            purchaseOrders={purchaseOrders}
            setPurchaseOrders={setPurchaseOrders}
            stockOpnames={stockOpnames}
            setStockOpnames={setStockOpnames}
            userRole={userRole}
          />
        )}

        {/* TAB 5: DATA KARYAWAN */}
        {activeTab === 'employees' && (
          <EmployeeManagementView
            employees={employees}
            setEmployees={setEmployees}
            branches={branches}
            userRole={userRole}
          />
        )}

        {/* TAB 6: LAPORAN KEUANGAN */}
        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            products={products}
            userRole={userRole}
            onOpenReceipt={(tx) => setActiveReceiptTx(tx)}
            onRefundTransaction={handleRefundTransaction}
            onOpenAdminPinModal={triggerAdminPinCheck}
          />
        )}

        {/* TAB 7: PENGATURAN SISTEM (Owner View) */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
            branches={branches}
            warehouses={warehouses}
            customers={customers}
          />
        )}

        {/* TAB 8: CETAK BARCODE */}
        {activeTab === 'barcodes' && (
          <BarcodeGeneratorView products={products.filter(p => !p.isDeleted)} />
        )}

        {/* TAB 9: USER PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            profile={userProfile}
            setProfile={setUserProfile}
            branches={branches}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

      </main>

      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        products={products}
        shiftInfo={shiftInfo}
        userRole={userRole}
        setUserRole={setUserRole}
        branches={branches}
        currentBranchId={currentBranchId}
        setCurrentBranchId={setCurrentBranchId}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'profile') {
            setActiveTab('profile');
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        products={products.filter(p => !p.isDeleted)}
      />

      {/* MODALS */}

      {/* Admin PIN Verification Modal for Kasir Actions */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => {
          setIsAdminPinModalOpen(false);
          setPinCallback(null);
        }}
        onSuccess={() => {
          if (pinCallback) pinCallback();
          setIsAdminPinModalOpen(false);
          setPinCallback(null);
        }}
        requiredRole="ADMIN / OWNER"
      />

      {/* Digital Weight Scale Modal */}
      <WeightScaleModal
        product={scaleModalProduct}
        isOpen={!!scaleModalProduct}
        onClose={() => setScaleModalProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        products={products.filter(p => !p.isDeleted)}
        onScanSuccess={(scannedFruit) => {
          sounds.playBarcodeBeep();
          handleAddToCart(scannedFruit, 1, scannedFruit.unitType === 'unit' ? 'pcs' : 'kg');
        }}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        products={products.filter(p => !p.isDeleted)}
        onAddToCart={handleAddToCart}
        onExecuteCommand={(cmd) => {
          if (cmd.targetTab) setActiveTab(cmd.targetTab);
          if (cmd.action === 'CLEAR_CART') handleClearCart();
          if (cmd.action === 'PAY') setIsPaymentModalOpen(true);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cartItems={cartItems}
        subtotal={cartSubtotal}
        discount={cartDiscount}
        tax={cartTax}
        totalAmount={Math.max(0, cartSubtotal - cartDiscount + cartTax)}
        onCompletePayment={handleCompletePayment}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        transaction={activeReceiptTx}
        isOpen={!!activeReceiptTx}
        onClose={() => setActiveReceiptTx(null)}
        onStartNewTransaction={() => {
          setActiveReceiptTx(null);
          setActiveTab('pos');
        }}
      />

      {/* Shift Closure Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        shiftInfo={shiftInfo}
        onCloseShift={(actualCash, cashierNotes) => {
          const closedAt = new Date().toISOString();
          setActiveShiftReport({
            shiftInfo: { ...shiftInfo, endTime: closedAt },
            actualCash,
            cashierNotes,
            closedAt,
            transactions
          });
          setShiftInfo(prev => ({ ...prev, isOpen: false, endTime: closedAt }));
        }}
      />

      {/* Shift Receipt Modal */}
      <ShiftReceiptModal
        reportData={activeShiftReport}
        isOpen={!!activeShiftReport}
        onClose={() => setActiveShiftReport(null)}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Multi-Level Login Authentication Modal */}
      <LoginModal
        isOpen={!isLoggedIn || isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        employees={employees}
        branches={branches}
        currentProfile={userProfile}
        onLoginSuccess={handleLoginSuccess}
        isInitialAuth={!isLoggedIn}
      />

    </div>
  );
}
