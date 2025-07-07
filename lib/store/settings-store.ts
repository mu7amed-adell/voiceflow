import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  selectedProvider: string;
  selectedTranscriptionProvider: string;
  setSelectedProvider: (provider: string) => void;
  setSelectedTranscriptionProvider: (provider: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedProvider: 'openai', // Default AI provider
      selectedTranscriptionProvider: 'huggingface', // Default to Arabic Whisper for specialized use case
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),
      setSelectedTranscriptionProvider: (provider) => set({ selectedTranscriptionProvider: provider }),
    }),
    {
      name: 'voiceflow-settings-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);