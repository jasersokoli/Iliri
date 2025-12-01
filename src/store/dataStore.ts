import { create } from 'zustand';
import type {
  Article,
  Supplier,
  Client,
  Purchase,
  Sale,
  Notification,
  DashboardAnalytics,
  TopProduct,
  ActiveClient,
  Payment,
  ClientArticlePrice,
} from '../types';

interface DataState {
  // Articles
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Clients
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Purchases
  purchases: Purchase[];
  setPurchases: (purchases: Purchase[]) => void;
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;

  // Sales
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
  addSale: (sale: Sale) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Analytics
  analytics: DashboardAnalytics | null;
  setAnalytics: (analytics: DashboardAnalytics) => void;
  topProducts: TopProduct[];
  setTopProducts: (products: TopProduct[]) => void;
  activeClients: ActiveClient[];
  setActiveClients: (clients: ActiveClient[]) => void;

  // Refresh analytics
  refreshAnalytics: () => void;

  // Payments
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  getPaymentsBySaleId: (saleId: string) => Payment[];

  // Client-Article Prices (last used prices)
  clientArticlePrices: ClientArticlePrice[];
  setClientArticlePrices: (prices: ClientArticlePrice[]) => void;
  getLastUsedPrice: (clientId: string, articleId: string) => ClientArticlePrice | null;
  updateLastUsedPrice: (clientId: string, articleId: string, price: number, priceType: 'Price 1' | 'Price 2' | 'Price 3' | 'Custom') => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  // Articles
  articles: [],
  setArticles: (articles) => set({ articles }),
  addArticle: (article) => set((state) => ({ articles: [...state.articles, article] })),
  updateArticle: (id, updates) =>
    set((state) => ({
      articles: state.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  deleteArticle: (id) =>
    set((state) => ({
      articles: state.articles.filter((a) => a.id !== id),
    })),

  // Suppliers
  suppliers: [],
  setSuppliers: (suppliers) => set({ suppliers }),
  addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, supplier] })),
  updateSupplier: (id, updates) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  deleteSupplier: (id) =>
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    })),

  // Clients
  clients: [],
  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    })),

  // Purchases
  purchases: [],
  setPurchases: (purchases) => set({ purchases }),
  addPurchase: (purchase) => set((state) => ({ purchases: [...state.purchases, purchase] })),
  updatePurchase: (id, updates) =>
    set((state) => ({
      purchases: state.purchases.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deletePurchase: (id) =>
    set((state) => ({
      purchases: state.purchases.filter((p) => p.id !== id),
    })),

  // Sales
  sales: [],
  setSales: (sales) => set({ sales }),
  addSale: (sale) => set((state) => ({ sales: [...state.sales, sale] })),
  updateSale: (id, updates) =>
    set((state) => ({
      sales: state.sales.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  deleteSale: (id) => {
    const state = get();
    const sale = state.sales.find((s) => s.id === id);
    if (sale) {
      // Restore stock for all items in the sale
      const updatedArticles = [...state.articles];
      sale.items.forEach((item) => {
        const articleIndex = updatedArticles.findIndex((a) => a.id === item.articleId);
        if (articleIndex >= 0) {
          updatedArticles[articleIndex] = {
            ...updatedArticles[articleIndex],
            currentStock: updatedArticles[articleIndex].currentStock + item.quantity,
          };
        }
      });
      set({
        articles: updatedArticles,
        sales: state.sales.filter((s) => s.id !== id),
      });
      get().refreshAnalytics();
    } else {
      set((state) => ({
        sales: state.sales.filter((s) => s.id !== id),
      }));
    }
  },

  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  // Analytics
  analytics: null,
  setAnalytics: (analytics) => set({ analytics }),
  topProducts: [],
  setTopProducts: (topProducts) => set({ topProducts }),
  activeClients: [],
  setActiveClients: (activeClients) => set({ activeClients }),

  // Refresh analytics
  refreshAnalytics: () => {
    const state = get();
    // Calculate analytics from current data
    const totalSales = state.sales.filter((s) => s.paid).length;
    const totalRevenue = state.sales.reduce((sum, s) => {
      if (s.paid) {
        return sum + s.total;
      }
      return sum + (s.paidAmount || 0);
    }, 0);
    const totalDebt = state.sales.reduce((sum, s) => {
      if (s.paid) {
        return sum;
      }
      return sum + (s.total - (s.paidAmount || 0));
    }, 0);

    // Calculate profit (revenue - cost of goods sold)
    const costOfGoodsSold = state.sales
      .filter((s) => s.paid)
      .reduce((sum, sale) => {
        return sum + sale.items.reduce((itemSum, item) => {
          const article = state.articles.find((a) => a.id === item.articleId);
          return itemSum + (article?.cost || 0) * item.quantity;
        }, 0);
      }, 0);
    const totalProfit = totalRevenue - costOfGoodsSold;

    // Calculate inventory value
    const inventoryValue = state.articles.reduce(
      (sum, a) => sum + a.cost * a.currentStock,
      0
    );

    set({
      analytics: {
        totalSales,
        totalRevenue,
        totalProfit,
        totalDebt,
        inventoryValue,
      },
    });

    // Calculate top products
    const productSales = new Map<string, { name: string; quantity: number }>();
    state.sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productSales.get(item.articleId) || {
          name: item.articleName,
          quantity: 0,
        };
        existing.quantity += item.quantity;
        productSales.set(item.articleId, existing);
      });
    });
    const topProducts = Array.from(productSales.entries())
      .map(([articleId, data]) => ({
        articleId,
        articleName: data.name,
        quantitySold: data.quantity,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    set({ topProducts });

    // Calculate active clients
    const clientPurchases = new Map<string, { name: string; count: number }>();
    state.sales.forEach((sale) => {
      const existing = clientPurchases.get(sale.clientId) || {
        name: sale.clientName,
        count: 0,
      };
      existing.count += 1;
      clientPurchases.set(sale.clientId, existing);
    });
    const activeClients = Array.from(clientPurchases.entries())
      .map(([clientId, data]) => ({
        clientId,
        clientName: data.name,
        totalPurchases: data.count,
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 10);

    set({ activeClients });
  },

  // Payments
  payments: [],
  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  getPaymentsBySaleId: (saleId) => {
    const state = get();
    return state.payments.filter((p) => p.saleId === saleId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  // Client-Article Prices
  clientArticlePrices: [],
  setClientArticlePrices: (prices) => set({ clientArticlePrices: prices }),
  getLastUsedPrice: (clientId, articleId) => {
    const state = get();
    return state.clientArticlePrices.find(
      (p) => p.clientId === clientId && p.articleId === articleId
    ) || null;
  },
  updateLastUsedPrice: (clientId, articleId, price, priceType) => {
    const state = get();
    const existing = state.clientArticlePrices.find(
      (p) => p.clientId === clientId && p.articleId === articleId
    );
    if (existing) {
      set({
        clientArticlePrices: state.clientArticlePrices.map((p) =>
          p.id === existing.id
            ? { ...p, lastPrice: price, priceType, lastUsedAt: new Date() }
            : p
        ),
      });
    } else {
      set({
        clientArticlePrices: [
          ...state.clientArticlePrices,
          {
            id: `cap-${Date.now()}`,
            clientId,
            articleId,
            lastPrice: price,
            priceType,
            lastUsedAt: new Date(),
          },
        ],
      });
    }
  },
}));

