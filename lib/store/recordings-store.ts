import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recording } from '@/lib/types/recording';

interface RecordingsStore {
  recordings: Recording[];
  _hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRecordings: () => Promise<void>;
  addRecording: (audioBlob: Blob, title: string, duration: number) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  updateRecordingStatus: (id: string, status: Recording['status']) => void;
  pollRecordingStatus: (id: string) => Promise<void>;
  clearRecordings: () => void;
  setHasHydrated: (state: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRecordingsStore = create<RecordingsStore>()(
  persist(
    (set, get) => ({
      recordings: [],
      _hasHydrated: false,
      isLoading: false,
      error: null,

      fetchRecordings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/recordings');
          
          if (!response.ok) {
            throw new Error('Failed to fetch recordings');
          }
          
          const data = await response.json();
          
          set({ 
            recordings: data.recordings.map((r: any) => ({
              ...r,
              createdAt: new Date(r.createdAt)
            })),
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching recordings:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch recordings',
            isLoading: false 
          });
        }
      },
      
      addRecording: async (audioBlob: Blob, title: string, duration: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('title', title);
          formData.append('duration', duration.toString());

          const response = await fetch('/api/upload-recording', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload recording');
          }

          const data = await response.json();
          
          const newRecording: Recording = {
            id: data.recording.id,
            title: data.recording.title,
            duration: data.recording.duration,
            createdAt: new Date(data.recording.createdAt),
            audioUrl: data.recording.audioUrl,
            size: data.recording.size,
            status: data.recording.status,
            transcription: null,
            summary: null,
            report: null
          };

          set((state) => ({
            recordings: [newRecording, ...state.recordings],
            isLoading: false
          }));

          // Start polling for status updates
          get().pollRecordingStatus(newRecording.id);

        } catch (error) {
          console.error('Error uploading recording:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to upload recording',
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteRecording: async (id: string) => {
        try {
          const response = await fetch(`/api/recordings/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete recording');
          }

          set((state) => ({
            recordings: state.recordings.filter(r => r.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting recording:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete recording'
          });
          throw error;
        }
      },
      
      updateRecordingStatus: (id: string, status: Recording['status']) => {
        set((state) => ({
          recordings: state.recordings.map(r => 
            r.id === id ? { ...r, status } : r
          )
        }));
      },

      pollRecordingStatus: async (id: string) => {
        const maxAttempts = 30; // 5 minutes with 10-second intervals
        let attempts = 0;

        const poll = async () => {
          try {
            const response = await fetch(`/api/recordings/${id}`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch recording status');
            }
            
            const data = await response.json();
            const updatedRecording = {
              ...data.recording,
              createdAt: new Date(data.recording.createdAt)
            };

            set((state) => ({
              recordings: state.recordings.map(r => 
                r.id === id ? updatedRecording : r
              )
            }));

            // Continue polling if still processing
            if (updatedRecording.status === 'processing' && attempts < maxAttempts) {
              attempts++;
              setTimeout(poll, 10000); // Poll every 10 seconds
            }
          } catch (error) {
            console.error('Error polling recording status:', error);
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(poll, 10000);
            }
          }
        };

        // Start polling after a short delay
        setTimeout(poll, 5000);
      },
      
      clearRecordings: () => {
        set({ recordings: [], error: null });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      setError: (error) => {
        set({ error });
      }
    }),
    {
      name: 'recordings-storage',
      partialize: (state) => ({
        recordings: [] // Don't persist recordings, fetch from server instead
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Fetch recordings from server after hydration
        state?.fetchRecordings();
      }
    }
  )
);