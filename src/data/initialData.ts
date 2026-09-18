import { 
  Branch, Warehouse, Supplier, UnitDefinition, MemberLevel, 
  Employee, AppSettings, PurchaseOrder, StockOpname, ProductionItem, MemberPriceRule
} from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'Cabang Utama - Jakarta Selatan',
    code: 'JKT-01',
    address: 'Jl. Raya Pasar Buah No. 88, Kebayoran Baru, Jakarta Selatan',
    phone: '0812-3456-7890',
    isMain: true
  },
  {
    id: 'b2',
    name: 'Cabang Bandung City',
    code: 'BDG-01',
    address: 'Jl. Riau No. 45, Cibeunying Kaler, Bandung',
    phone: '0821-9988-7766',
    isMain: false
  },
  {
    id: 'b3',
    name: 'Cabang Surabaya Barat',
    code: 'SUB-01',
    address: 'Jl. Mayjen Sungkono No. 102, Surabaya',
    phone: '0838-1122-3344',
    isMain: false
  }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'w1',
    name: 'Gudang Utama Cold-Storage Jakarta',
    branchId: 'b1',
    address: 'Kawasan Industri Pulogadung Blok C-4, Jakarta'
  },
  {
    id: 'w2',
    name: 'Gudang Transit Bandara Soetta',
    branchId: 'b1',
    address: 'Kargo Buah Impor Terminal 3, Tangerang'
  },
  {
    id: 'w3',
    name: 'Gudang Cabang Bandung Lembang',
    branchId: 'b2',
    address: 'Jl. Raya Lembang No. 12, Bandung Barat'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 's1',
    name: 'PT Agro Buah Malang',
    contactPerson: 'Budi Santoso',
    phone: '081299887766',
    address: 'Jl. Kebun Apel No. 12, Batu, Malang',
    email: 'budi@agrobuahmalang.com'
  },
  {
    id: 's2',
    name: 'CV Fresh Import Tropical',
    contactPerson: 'Hendra Wijaya',
    phone: '081122334455',
    address: 'Pergudangan Pluit Blok A-5, Jakarta Utara',
    email: 'sales@freshimport.co.id'
  },
  {
    id: 's3',
    name: 'Koperasi Petani Buah Lembang',
    contactPerson: 'Siti Rahma',
    phone: '085677889900',
    address: 'Jl. Maribaya No. 88, Lembang, Bandung',
    email: 'info@petanilembang.org'
  }
];

export const INITIAL_UNITS: UnitDefinition[] = [
  { id: 'u1', name: 'Kilogram', symbol: 'kg', description: 'Satuan standar berat kilo', baseMultiplier: 1.0 },
  { id: 'u2', name: 'Ons (100 gram)', symbol: 'ons', description: '10 ons = 1 kilogram', baseMultiplier: 0.1 },
  { id: 'u3', name: 'Gram', symbol: 'g', description: '1000 gram = 1 kg', baseMultiplier: 0.001 },
  { id: 'u4', name: 'Pcs / Buah', symbol: 'pcs', description: 'Satuan per butir / per biji buah', baseMultiplier: 1.0 },
  { id: 'u5', name: 'Pack / Mika', symbol: 'pack', description: 'Mika / Pack buah potong & jus', baseMultiplier: 1.0 },
  { id: 'u6', name: 'Box / Kotak', symbol: 'box', description: 'Kemasan box kado & hampers', baseMultiplier: 1.0 },
  { id: 'u7', name: 'Dus / Karton', symbol: 'dus', description: 'Karton besar pengiriman', baseMultiplier: 1.0 }
];

export const INITIAL_MEMBER_LEVELS: MemberLevel[] = [
  { id: 'ml1', name: 'Regular', minSpend: 0, discountPercent: 0, perks: 'Diskon standar non-member' },
  { id: 'ml2', name: 'Silver Member', minSpend: 500000, discountPercent: 3, perks: 'Diskon 3% setiap transaksi & poin promo' },
  { id: 'ml3', name: 'Gold Member', minSpend: 2000000, discountPercent: 5, perks: 'Diskon 5% + gratis ongkir delivery lokal' },
  { id: 'ml4', name: 'Platinum Member', minSpend: 5000000, discountPercent: 8, perks: 'Diskon 8% + promo harga khusus parcel' },
  { id: 'ml5', name: 'VIP Partner', minSpend: 10000000, discountPercent: 10, perks: 'Diskon 10% + prioritas pasokan buah impor' }
];

export const INITIAL_MEMBER_PRICES: MemberPriceRule[] = [
  { id: 'mp1', productId: '1', productName: 'Apel Fuji Super Impor', memberLevelId: 'ml4', memberLevelName: 'Platinum Member', customPriceKg: 38000, discountPercent: 9 },
  { id: 'mp2', productId: '2', productName: 'Alpukat Mentega Super Malang', memberLevelId: 'ml3', memberLevelName: 'Gold Member', customPriceKg: 28000, discountPercent: 6 }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-owner',
    nip: 'OWNER-001',
    name: 'H. Ahmad Fauzi',
    email: 'owner@fruitkasir.id',
    phone: '0812-3456-7890',
    role: 'OWNER',
    branchId: 'b1',
    pin: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-admin',
    nip: 'ADM-001',
    name: 'Rina Wijaya',
    email: 'admin@fruitkasir.id',
    phone: '0813-8877-6655',
    role: 'ADMIN',
    branchId: 'b1',
    pin: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-kasir1',
    nip: 'KSR-001',
    name: 'Dewi Sartika',
    email: 'dewi.kasir@fruitkasir.id',
    phone: '0819-0011-2233',
    role: 'KASIR',
    branchId: 'b1',
    pin: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-kasir2',
    nip: 'KSR-002',
    name: 'Budi Pratama',
    email: 'budi.bdg@fruitkasir.id',
    phone: '0821-4455-6677',
    role: 'KASIR',
    branchId: 'b2',
    pin: '1234',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  identity: {
    appName: 'FruitKasir POS',
    tagline: 'Sistem Kasir Timbangan Buah Multi-Cabang',
    ownerName: 'H. Ahmad Fauzi',
    whatsapp: '0812-3456-7890',
    address: 'Jl. Raya Pasar Buah No. 88, Kebayoran Baru, Jakarta Selatan',
    logoUrl: '🍎',
    faviconUrl: '🍊',
    defaultCustomerId: 'cust-1',
    defaultWarehouseId: 'w1'
  },
  paymentGateways: {
    duitku: {
      enabled: true,
      isSandbox: true,
      merchantCode: 'DS18923',
      apiKey: '839a9c02d1e56a7b8801f92a40b93a8d'
    },
    manualTransfer: {
      enabled: true,
      banks: [
        {
          id: 'bca',
          bankName: 'Bank BCA',
          bankIcon: '🏦',
          accountNumber: '8830-192-888',
          accountHolder: 'PT BUAH SEGAR NUSANTARA',
          enabled: true
        },
        {
          id: 'mandiri',
          bankName: 'Bank Mandiri',
          bankIcon: '🏛️',
          accountNumber: '137-00-112233-4',
          accountHolder: 'PT BUAH SEGAR NUSANTARA',
          enabled: true
        },
        {
          id: 'bri',
          bankName: 'Bank BRI',
          bankIcon: '🏬',
          accountNumber: '0012-01-002233-445',
          accountHolder: 'PT BUAH SEGAR NUSANTARA',
          enabled: true
        }
      ]
    },
    qrisStatis: {
      enabled: true,
      qrImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'
    }
  },
  aiGemini: {
    enabled: true,
    model: 'gemini-2.5-flash',
    apiKey: '',
    assistantName: 'FruitAI Assistant',
    icon: '✨',
    systemPrompt: 'Anda adalah asisten cerdas kasir buah segar. Bantu kasir menghitung timbangan, merekomendasikan stok buah, dan menganalisis omzet.'
  },
  waGateway: {
    enabled: true,
    serverUrl: 'https://wa-api.fruitkasir.id',
    status: 'CONNECTED',
    lastSync: '2026-07-31 22:00',
    phoneConnected: '6281234567890'
  },
  thermalPrinter: {
    paperWidth: '58mm',
    headerText: 'TOKO BUAH SEGAR NUSANTARA\nJl. Raya Pasar Buah No. 88, Jakarta\nTelp: 0812-3456-7890',
    footerText: 'Terima Kasih Atas Kunjungan Anda!\nBarang Yang Sudah Dibeli Tidak Dapat Ditukar.',
    showLogo: true,
    autoPrint: false
  },
  transactionRules: {
    enableDiscount: true,
    enableVoucher: true,
    enableTax: true,
    taxPercent: 11,
    defaultDiscountPercent: 0
  }
};

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-01',
    poNumber: 'PO-202607-001',
    supplierId: 's1',
    supplierName: 'PT Agro Buah Malang',
    branchId: 'b1',
    items: [
      { productId: '2', productName: 'Alpukat Mentega Super Malang', quantityKg: 50, costPriceKg: 18000, totalPrice: 900000 },
      { productId: '4', productName: 'Jeruk Pontianak Manis', quantityKg: 40, costPriceKg: 14000, totalPrice: 560000 }
    ],
    grandTotal: 1460000,
    status: 'RECEIVED',
    timestamp: '2026-07-28T10:30:00.000Z',
    notes: 'Kirim via truk pendingin cold-chain'
  }
];

export const INITIAL_STOCK_OPNAMES: StockOpname[] = [
  {
    id: 'so-01',
    opnameNumber: 'SO-202607-01',
    branchId: 'b1',
    warehouseId: 'w1',
    items: [
      { productId: '1', productName: 'Apel Fuji Super Impor', systemQtyKg: 45, physicalQtyKg: 44.5, differenceKg: -0.5, notes: 'Penyusutan busuk 0.5kg' }
    ],
    date: '2026-07-30',
    inspectorName: 'Rina Wijaya',
    status: 'ADJUSTED'
  }
];

export const INITIAL_PRODUCTION_ITEMS: ProductionItem[] = [
  {
    id: 'prod-01',
    code: 'PRD-001',
    name: 'Parcel Buah Premium Eksklusif',
    resultProductId: '99',
    resultProductName: 'Parcel Buah Impor Kado',
    resultQty: 1,
    resultUnit: 'pcs',
    ingredients: [
      { productId: '1', productName: 'Apel Fuji Super Impor', qtyKg: 1.5 },
      { productId: '3', productName: 'Anggur Merah Import', qtyKg: 1.0 }
    ],
    productionCost: 150000,
    date: '2026-07-31',
    status: 'COMPLETED'
  }
];
