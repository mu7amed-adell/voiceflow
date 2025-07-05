import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedProvider: 'openai', // Default provider
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),
    }),
    {
      name: 'voiceflow-settings-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);