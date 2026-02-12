import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllRecords,
  getRecord,
  saveRecord,
  deleteRecord,
  getAllAgents,
  getAgent,
  saveAgent,
  deleteAgent,
  saveAttachment,
  getAttachment
} from '../storage/localDb';

export function useRecords() {
  return useQuery({
    queryKey: ['records'],
    queryFn: getAllRecords
  });
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: ['record', id],
    queryFn: () => getRecord(id),
    enabled: !!id
  });
}

export function useSaveRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    }
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    }
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: getAllAgents
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => getAgent(id),
    enabled: !!id
  });
}

export function useSaveAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });
}

export function useSaveAttachment() {
  return useMutation({
    mutationFn: ({ id, fileName, blob, recordId }: { id: string; fileName: string; blob: Blob; recordId: string }) =>
      saveAttachment(id, fileName, blob, recordId)
  });
}

export function useAttachment(id: string) {
  return useQuery({
    queryKey: ['attachment', id],
    queryFn: () => getAttachment(id),
    enabled: !!id
  });
}
