import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function usePermissions() {
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await apiClient.get('/permissions');
      return res.data;
    },
  });

  const updatePermission = useMutation({
    mutationFn: async ({ service, actionType, tier }: { service: string; actionType: string; tier: string }) => {
      await apiClient.put(`/permissions/${service}/${actionType}`, { tier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: async (configs: { service: string; actionType: string; tier: string }[]) => {
      await apiClient.put('/permissions', { configs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });

  return { permissions: permissions || [], isLoading, updatePermission, bulkUpdate };
}
