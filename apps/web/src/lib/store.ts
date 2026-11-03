import { create } from 'zustand';

export interface TransientFile {
  file: File;
  sourceToolId?: string;
  sourceTimestamp: number;
}

interface WorkspaceState {
  // In-memory chained file handoff
  handedOffFile: TransientFile | null;
  setHandedOffFile: (file: File | null, sourceToolId?: string) => void;
  clearHandedOffFile: () => void;

  // Active preview object URLs tracking for cleanup
  activeObjectUrls: string[];
  trackObjectUrl: (url: string) => string;
  revokeAllObjectUrls: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  handedOffFile: null,

  setHandedOffFile: (file, sourceToolId) => {
    if (!file) {
      set({ handedOffFile: null });
      return;
    }
    set({
      handedOffFile: {
        file,
        sourceToolId,
        sourceTimestamp: Date.now(),
      },
    });
  },

  clearHandedOffFile: () => {
    set({ handedOffFile: null });
  },

  activeObjectUrls: [],

  trackObjectUrl: (url: string) => {
    set((state) => ({
      activeObjectUrls: [...state.activeObjectUrls, url],
    }));
    return url;
  },

  revokeAllObjectUrls: () => {
    const urls = get().activeObjectUrls;
    for (const url of urls) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    }
    set({ activeObjectUrls: [] });
  },
}));

