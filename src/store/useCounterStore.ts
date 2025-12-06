import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type CounterStore = {
  count: number;
  increment: () => void;
};

export const useCounterStore = create<CounterStore>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
