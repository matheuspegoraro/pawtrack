import { create } from 'zustand';
import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '';
const ENTITLEMENT_ID = 'pro';

interface PremiumState {
  isPremium: boolean;
  packages: PurchasesPackage[];
  initialized: boolean;
  loading: boolean;
  initialize: (userId?: string) => Promise<void>;
  checkPremium: () => Promise<void>;
  fetchPackages: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

function hasPro(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

export const usePremiumStore = create<PremiumState>((set, get) => ({
  isPremium: false,
  packages: [],
  initialized: false,
  loading: false,

  initialize: async (userId?: string) => {
    if (get().initialized || !API_KEY) return;
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      Purchases.configure({ apiKey: API_KEY, appUserID: userId });
      const info = await Purchases.getCustomerInfo();
      set({ isPremium: hasPro(info), initialized: true });
    } catch (err) {
      console.warn('RevenueCat init failed:', err);
      set({ initialized: true });
    }
  },

  checkPremium: async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      set({ isPremium: hasPro(info) });
    } catch {
      // Silently fail
    }
  },

  fetchPackages: async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (current) {
        set({ packages: current.availablePackages });
      }
    } catch (err) {
      console.warn('Failed to fetch packages:', err);
    }
  },

  purchase: async (pkg: PurchasesPackage) => {
    set({ loading: true });
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const premium = hasPro(customerInfo);
      set({ isPremium: premium, loading: false });
      return premium;
    } catch (err: any) {
      set({ loading: false });
      if (err.userCancelled) return false;
      throw err;
    }
  },

  restore: async () => {
    set({ loading: true });
    try {
      const info = await Purchases.restorePurchases();
      const premium = hasPro(info);
      set({ isPremium: premium, loading: false });
      return premium;
    } catch {
      set({ loading: false });
      return false;
    }
  },
}));
