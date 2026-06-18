import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WholesaleTier {
  minQty: number;
  maxQty?: number | null;
  price: number;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  
  storeId: string;
  storeName: string;
  storeSlug: string;
  
  retailPrice: number;
  minOrder: number;
  unit: string;
  quantity: number;
  
  isWholesaleAvailable: boolean;
  wholesalePriceTiers: WholesaleTier[];
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  clearStoreCart: (storeId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === newItem.productId);
          if (existingItem) {
            return {
              items: state.items.map(item => 
                item.productId === newItem.productId 
                  ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
                  : item
              )
            };
          } else {
            return {
              items: [...state.items, { ...newItem, quantity: newItem.quantity || newItem.minOrder }]
            };
          }
        });
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map(item => 
            item.productId === productId 
              ? { ...item, quantity }
              : item
          )
        }));
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      clearStoreCart: (storeId) => {
        set((state) => ({
          items: state.items.filter(item => item.storeId !== storeId)
        }));
      }
    }),
    {
      name: 'geraibumdes-cart',
    }
  )
);

// Helper function to calculate active price based on quantity and wholesale tiers
export const calculateActivePrice = (item: CartItem): { price: number, type: "RETAIL" | "WHOLESALE" } => {
  if (!item.isWholesaleAvailable || !item.wholesalePriceTiers || item.wholesalePriceTiers.length === 0) {
    return { price: item.retailPrice, type: "RETAIL" };
  }

  // Sort tiers by minQty descending so we can easily find the highest applicable tier
  const sortedTiers = [...item.wholesalePriceTiers].sort((a, b) => b.minQty - a.minQty);
  
  for (const tier of sortedTiers) {
    if (item.quantity >= tier.minQty) {
      // Check if maxQty is defined and if quantity exceeds it (though normally highest tier has no maxQty)
      if (tier.maxQty && item.quantity > tier.maxQty) {
        continue;
      }
      return { price: tier.price, type: "WHOLESALE" };
    }
  }

  return { price: item.retailPrice, type: "RETAIL" };
};
