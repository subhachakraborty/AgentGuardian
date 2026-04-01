import { useCallback } from 'react';
import { useActivityStore } from '../stores/activityStore';
import { apiClient } from '../api/client';

export function useNudges() {
  const { pendingActions, removePendingAction } = useActivityStore();

  const approveAction = useCallback(async (jobId: string) => {
    try {
      await apiClient.post(`/agent/action/${jobId}/approve`);
      removePendingAction(jobId);
    } catch (err) {
      console.error('Failed to approve action:', err);
      throw err;
    }
  }, [removePendingAction]);

  const denyAction = useCallback(async (jobId: string) => {
    try {
      await apiClient.post(`/agent/action/${jobId}/deny`);
      removePendingAction(jobId);
    } catch (err) {
      console.error('Failed to deny action:', err);
      throw err;
    }
  }, [removePendingAction]);

  return { pendingActions, approveAction, denyAction };
}
