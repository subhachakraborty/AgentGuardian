import { create } from 'zustand';
import type { AuditLogEntry, PendingActionEntry } from '@agent-guardian/shared';

interface ActivityState {
  // Live activity feed
  activities: AuditLogEntry[];
  addActivity: (activity: AuditLogEntry) => void;
  setActivities: (activities: AuditLogEntry[]) => void;

  // Pending nudge/step-up actions
  pendingActions: PendingActionEntry[];
  addPendingAction: (action: PendingActionEntry) => void;
  removePendingAction: (jobId: string) => void;
  setPendingActions: (actions: PendingActionEntry[]) => void;

  // Step-up modal state
  stepUpModal: { visible: boolean; jobId: string; challengeUrl: string } | null;
  showStepUpModal: (jobId: string, challengeUrl: string) => void;
  hideStepUpModal: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 100), // Keep last 100
    })),
  setActivities: (activities) => set({ activities }),

  pendingActions: [],
  addPendingAction: (action) =>
    set((state) => ({
      pendingActions: [action, ...state.pendingActions],
    })),
  removePendingAction: (jobId) =>
    set((state) => ({
      pendingActions: state.pendingActions.filter((a) => a.id !== jobId),
    })),
  setPendingActions: (pendingActions) => set({ pendingActions }),

  stepUpModal: null,
  showStepUpModal: (jobId, challengeUrl) =>
    set({ stepUpModal: { visible: true, jobId, challengeUrl } }),
  hideStepUpModal: () => set({ stepUpModal: null }),
}));
