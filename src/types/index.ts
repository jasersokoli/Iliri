export interface User {
  id: string;
  name: string;
  email: string;
  theme: 'light' | 'dark';
}

export interface Article {
  id: string;
  name: string;
  code1: string;
  code2?: string;
  cost: number;
  currentStock: number;
  minimumStock?: number;
  price1: number;
  price2?: number;
  price3?: number;
  supplierId?: string;
  unit: string;
  active: boolean;
  deleted?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  telephone?: string;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  telephone?: string;
  email?: string;
  address?: string;
  active: boolean;
}

export interface Purchase {
  id: string;
  number: number;
  supplierId: string;
  supplierName: string;
  username: string;
  date: Date;
  total: number;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  articleId: string;
  articleCode: string;
  articleName: string;
  unitCost: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: string;
  number: number;
  clientId: string;
  clientName: string;
  clientReference?: string;
  username: string;
  date: Date;
  priceType: 'Price 1' | 'Price 2' | 'Price 3' | 'Custom';
  unitPrice: number;
  total: number;
  paid: boolean;
  paidAmount?: number;
  items: SaleItem[];
}

export interface SaleItem {
  articleId: string;
  articleCode: string;
  articleName: string;
  priceType: 'Price 1' | 'Price 2' | 'Price 3' | 'Custom';
  unitPrice: number;
  quantity: number;
  total: number;
  cost: number;
}

export interface Notification {
  id: string;
  type: 'Low Stock' | 'System Alert' | 'Payment Due' | 'Other';
  description: string;
  read: boolean;
  createdAt: Date;
}

export interface DashboardAnalytics {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalDebt: number;
  inventoryValue: number;
}

export interface TopProduct {
  articleId: string;
  articleName: string;
  quantitySold: number;
}

export interface ActiveClient {
  clientId: string;
  clientName: string;
  totalPurchases: number;
}

export interface Payment {
  id: string;
  saleId: string;
  amount: number;
  timestamp: Date;
}

export interface ClientArticlePrice {
  id: string;
  clientId: string;
  articleId: string;
  lastPrice: number;
  priceType: 'Price 1' | 'Price 2' | 'Price 3' | 'Custom';
  lastUsedAt: Date;
}

