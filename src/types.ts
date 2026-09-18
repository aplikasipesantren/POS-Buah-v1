export type WeightUnit = 'kg' | 'ons' | 'g' | 'pcs';

export type FruitCategory = 'Lokal' | 'Impor' | 'Organik' | 'Potong & Jus' | 'Premium';

export type UserRole = 'OWNER' | 'ADMIN' | 'KASIR';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain?: boolean;
  isDeleted?: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  branchId: string;
  address: string;
  isDeleted?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  email?: string;
  isDeleted?: boolean;
}

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  description: string;
  baseMultiplier: number;
  isDeleted?: boolean;
}

export interface MemberLevel {
  id: string;
  name: string;
  minSpend: number;
  discountPercent: number;
  perks: string;
  isDeleted?: boolean;
}

export interface MemberPriceRule {
  id: string;
  productId: string;
  productName: string;
  memberLevelId: string;
  memberLevelName: string;
  customPriceKg: number;
  discountPercent: number;
  isDeleted?: boolean;
}

export interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string;
  pin: string;
  avatarUrl?: string;
  isDeleted?: boolean;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantityKg: number;
  costPriceKg: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  items: PurchaseOrderItem[];
  grandTotal: number;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  timestamp: string;
  notes?: string;
  isDeleted?: boolean;
}

export interface StockOpnameItem {
  productId: string;
  productName: string;
  systemQtyKg: number;
  physicalQtyKg: number;
  differenceKg: number;
  notes?: string;
}

export interface StockOpname {
  id: string;
  opnameNumber: string;
  branchId: string;
  warehouseId: string;
  items: StockOpnameItem[];
  date: string;
  inspectorName: string;
  status: 'SUBMITTED' | 'ADJUSTED';
  isDeleted?: boolean;
}

export interface StockCardItem {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE';
  qtyKg: number;
  unit: string;
  referenceNo: string;
  timestamp: string;
  branchId: string;
  notes?: string;
}

export interface ProductionItem {
  id: string;
  code: string;
  name: string;
  resultProductId: string;
  resultProductName: string;
  resultQty: number;
  resultUnit: WeightUnit;
  ingredients: {
    productId: string;
    productName: string;
    qtyKg: number;
  }[];
  productionCost: number;
  date: string;
  status: 'COMPLETED' | 'DRAFT';
  isDeleted?: boolean;
}

export interface FruitProduct {
  id: string;
  name: string;
  category: FruitCategory;
  barcode: string;
  imageUrl: string;
  costPriceKg: number;      // Harga Modal per kg
  sellingPriceKg: number;   // Harga Jual per kg
  sellingPriceOns: number;  // Harga Jual per ons (1 kg = 10 ons)
  stockKg: number;          // Total Stok tersedia dalam kg
  minStockKg: number;       // Batas Minimum Stok untuk peringatan
  unitType: 'weight' | 'unit'; // 'weight' (kg/ons) or 'unit' (pcs/pack)
  sellingPriceUnit?: number; // Harga per pcs/pack if unitType === 'unit'
  description?: string;
  origin?: string;           // e.g. "Malang, Indonesia", "Washington, USA"
  branchId?: string;
  isDeleted?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id
  product: FruitProduct;
  quantity: number; // e.g. 1.5 for 1.5 kg, or 5 for 5 ons, or 2 for 2 pcs
  unit: WeightUnit; // 'kg' | 'ons' | 'g' | 'pcs'
  effectivePricePerUnit: number; // price for 1 unit of this item
  totalPrice: number;
  notes?: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER';

export type OrderType = 'TAKE_AWAY' | 'DELIVERY';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  memberType?: string; // 'Regular', 'Silver', 'Gold', 'Platinum', 'VIP'
  memberLevelId?: string;
  points?: number; // Total point reward keanggotaan member
  totalSpend?: number; // Total akumulasi belanja
  totalOrders?: number;
  notes?: string;
  branchId?: string;
  createdAt?: string;
  isDeleted?: boolean;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  timestamp: string; // ISO date string
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  orderType?: OrderType;
  cashPaid?: number;
  cashChange?: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  pointsEarned?: number; // Poin reward yang didapat dari transaksi ini
  totalCustomerPoints?: number; // Total poin member setelah transaksi
  notes?: string;
  status: 'COMPLETED' | 'REFUNDED';
  branchId?: string;
  isDeleted?: boolean;
}

export interface RestockLog {
  id: string;
  productId: string;
  productName: string;
  amountKg: number;
  costPerKg: number;
  totalCost: number;
  supplier: string;
  timestamp: string;
  notes?: string;
  isDeleted?: boolean;
}

export interface ShiftInfo {
  isOpen: boolean;
  cashierName: string;
  startTime: string;
  endTime?: string;
  initialCash: number;
  totalCashSales: number;
  totalNonCashSales: number;
  expectedCashInDrawer: number;
  branchId?: string;
}

export interface AppSettings {
  identity: {
    appName: string;
    tagline: string;
    ownerName: string;
    whatsapp: string;
    address: string;
    logoUrl: string;
    faviconUrl: string;
    defaultCustomerId: string;
    defaultWarehouseId: string;
  };
  paymentGateways: {
    duitku: {
      enabled: boolean;
      isSandbox: boolean;
      merchantCode: string;
      apiKey: string;
    };
    manualTransfer: {
      enabled: boolean;
      banks: {
        id: string;
        bankName: string;
        bankIcon: string;
        accountNumber: string;
        accountHolder: string;
        enabled: boolean;
      }[];
    };
    qrisStatis: {
      enabled: boolean;
      qrImageUrl: string;
    };
  };
  aiGemini: {
    enabled: boolean;
    model: string;
    apiKey: string;
    assistantName: string;
    icon: string;
    systemPrompt: string;
  };
  waGateway: {
    enabled: boolean;
    serverUrl: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'SCANNING';
    lastSync: string;
    phoneConnected?: string;
  };
  thermalPrinter: {
    paperWidth: '58mm' | '80mm';
    headerText: string;
    footerText: string;
    showLogo: boolean;
    autoPrint: boolean;
  };
  transactionRules: {
    enableDiscount: boolean;
    enableVoucher: boolean;
    enableTax: boolean;
    taxPercent: number;
    defaultDiscountPercent?: number;
  };
}

export interface UserProfile {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string;
  pin: string;
  avatarUrl: string;
}

export interface VoiceRecognizedCommand {
  action: 'ADD_CART' | 'SEARCH' | 'CLEAR_CART' | 'GO_TAB' | 'PAY' | 'UNKNOWN';
  productName?: string;
  quantity?: number;
  unit?: WeightUnit;
  targetTab?: string;
  rawText: string;
  confidence: number;
}

