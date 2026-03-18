import { create } from "zustand";

interface UIStoreState {
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
}));
