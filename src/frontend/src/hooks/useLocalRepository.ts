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
  getAttachment,
  saveAttachment,
  deleteAttachment,
  getAllReminders,
  getReminder,
  saveReminder,
  deleteReminder,
  getAllDeals,
  saveDeal,
  deleteDeal
} from '../storage/localDb';

// Records
export function useRecords() {
  return useQuery({
    queryKey: ['records'],
    queryFn: getAllRecords,
  });
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: ['record', id],
    queryFn: () => getRecord(id),
  });
}

export function useSaveRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['record'] });
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['record'] });
    },
  });
}

// Agents
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: getAllAgents,
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => getAgent(id),
  });
}

export function useSaveAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
    },
  });
}

// Attachments
export function useAttachment(id: string) {
  return useQuery({
    queryKey: ['attachment', id],
    queryFn: () => getAttachment(id),
    enabled: !!id,
  });
}

export function useSaveAttachment() {
  return useMutation({
    mutationFn: ({ id, fileName, blob, recordId }: { id: string; fileName: string; blob: Blob; recordId: string }) =>
      saveAttachment(id, fileName, blob, recordId),
  });
}

export function useDeleteAttachment() {
  return useMutation({
    mutationFn: deleteAttachment,
  });
}

// Reminders
export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: getAllReminders,
  });
}

export function useReminder(id: string) {
  return useQuery({
    queryKey: ['reminder', id],
    queryFn: () => getReminder(id),
  });
}

export function useSaveReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminder'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminder'] });
    },
  });
}

// Deals
export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: getAllDeals,
  });
}

export function useSaveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal'] });
    },
  });
}
