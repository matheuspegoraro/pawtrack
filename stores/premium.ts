import { create } from 'zustand';

interface PremiumState {
  isPremium: boolean;
  checkPremium: () => Promise<void>;
  setPremium: (value: boolean) => void;
}

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,

  // In production this would check RevenueCat subscription status.
  // For now it simply reads the local flag.
  checkPremium: async () => {
    // TODO: Replace with RevenueCat entitlement check
    // const customerInfo = await Purchases.getCustomerInfo();
    // const isPremium = customerInfo.entitlements.active['pro'] !== undefined;
    // set({ isPremium });
  },

  setPremium: (value: boolean) => set({ isPremium: value }),
}));
