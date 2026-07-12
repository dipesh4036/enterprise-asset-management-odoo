import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetService, CreateAssetInput, UpdateAssetInput, AssetStatus } from "../services/asset.service";

export function useAssets(params?: {
  search?: string;
  categoryId?: string;
  status?: AssetStatus;
  departmentId?: string;
  location?: string;
  isBookable?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["assets", params],
    queryFn: () => assetService.getAssets(params),
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: () => assetService.getAssetById(id),
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssetInput) => assetService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetInput }) =>
      assetService.updateAsset(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset", variables.id] });
    },
  });
}

export function useAssetAllocationHistory(id: string) {
  return useQuery({
    queryKey: ["asset-allocation-history", id],
    queryFn: () => assetService.getAllocationHistory(id),
    enabled: !!id,
  });
}

export function useAssetMaintenanceHistory(id: string) {
  return useQuery({
    queryKey: ["asset-maintenance-history", id],
    queryFn: () => assetService.getMaintenanceHistory(id),
    enabled: !!id,
  });
}
