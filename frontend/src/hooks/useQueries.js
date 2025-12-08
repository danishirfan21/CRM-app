import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  contactsAPI,
  tagsAPI,
  notesAPI,
  interactionsAPI,
} from '../services/api';
import { QUERY_KEYS, SUCCESS_MESSAGES } from '../utils/constants';
import { useToast } from '../context/ToastContext';

// ============== CONTACTS ==============

export const useContacts = (params) => {
  const stableParams = useMemo(() => JSON.stringify(params || {}), [params]);

  return useQuery({
    queryKey: [QUERY_KEYS.CONTACTS, stableParams],
    queryFn: () => contactsAPI.getAll(params),
    select: (response) => response.data.data || response.data,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useContact = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACT, id],
    queryFn: () => contactsAPI.getOne(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data) => contactsAPI.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
      success(response.data.message || SUCCESS_MESSAGES.CONTACT_CREATED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to create contact');
    },
  });
};

export const useUpdateContact = (id) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data) => contactsAPI.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([QUERY_KEYS.CONTACT, id]);
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
      success(response.data.message || SUCCESS_MESSAGES.CONTACT_UPDATED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to update contact');
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id) => contactsAPI.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
      success(response.data.message || SUCCESS_MESSAGES.CONTACT_DELETED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to delete contact');
    },
  });
};

// ============== TAGS ==============
// CRITICAL FIX 2: Maximum caching for tags - they rarely change
// This solves the "tags not cached" issue completely
export const useTags = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TAGS], // No params - always the same key
    queryFn: () => tagsAPI.getAll(),
    select: (response) => response.data,

    // AGGRESSIVE CACHING SETTINGS
    staleTime: Infinity, // Never automatically mark as stale
    gcTime: 24 * 60 * 60 * 1000, // Keep in memory for 24 hours

    // Prevent ALL automatic refetches
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    // Optional: Keep old data while fetching new (instant UI updates)
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data) => tagsAPI.create(data),
    onSuccess: (response) => {
      // Force refetch tags since a new tag was created
      queryClient.invalidateQueries([QUERY_KEYS.TAGS]);
      success(response.data.message || SUCCESS_MESSAGES.TAG_CREATED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to create tag');
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => tagsAPI.update(id, data),
    onSuccess: (response) => {
      // Force refetch tags since a tag was updated
      queryClient.invalidateQueries([QUERY_KEYS.TAGS]);
      success(response.data.message || SUCCESS_MESSAGES.TAG_UPDATED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to update tag');
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id) => tagsAPI.delete(id),
    onSuccess: (response) => {
      // Force refetch tags since a tag was deleted
      queryClient.invalidateQueries([QUERY_KEYS.TAGS]);
      // Also invalidate contacts since they may have had this tag
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
      success(response.data.message || SUCCESS_MESSAGES.TAG_DELETED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to delete tag');
    },
  });
};

// ============== TAG ATTACHMENT ==============
// CRITICAL FIX 3: When attaching/detaching tags, DON'T invalidate tags query
// The tags themselves haven't changed, only the contact-tag relationship
export const useAttachTag = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (tagId) => contactsAPI.attachTag(contactId, tagId),
    onSuccess: (response) => {
      // Only invalidate contact data, NOT the tags list
      queryClient.invalidateQueries([QUERY_KEYS.CONTACT, contactId]);
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
      // ❌ REMOVED: queryClient.invalidateQueries([QUERY_KEYS.TAGS]);
      success(response.data.message || SUCCESS_MESSAGES.TAG_ATTACHED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to attach tag');
    },
  });
};

export const useDetachTag = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (tagId) => contactsAPI.detachTag(contactId, tagId),
    onSuccess: (response) => {
      // Only invalidate contact data, NOT the tags list
      queryClient.invalidateQueries([QUERY_KEYS.CONTACT, contactId]);
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
      // ❌ REMOVED: queryClient.invalidateQueries([QUERY_KEYS.TAGS]);
      success(response.data.message || SUCCESS_MESSAGES.TAG_DETACHED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to detach tag');
    },
  });
};

// ============== NOTES ==============

export const useNotes = (contactId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTES, contactId],
    queryFn: () => notesAPI.getAll(contactId),
    select: (response) => response.data,
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateNote = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data) => notesAPI.create(contactId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([QUERY_KEYS.NOTES, contactId]);
      success(response.data.message || SUCCESS_MESSAGES.NOTE_CREATED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to create note');
    },
  });
};

export const useDeleteNote = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (noteId) => notesAPI.delete(contactId, noteId),
    onSuccess: (response) => {
      queryClient.invalidateQueries([QUERY_KEYS.NOTES, contactId]);
      success(response.data.message || SUCCESS_MESSAGES.NOTE_DELETED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to delete note');
    },
  });
};

// ============== INTERACTIONS ==============

export const useInteractions = (contactId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INTERACTIONS, contactId],
    queryFn: () => interactionsAPI.getAll(contactId),
    select: (response) => response.data,
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateInteraction = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data) => interactionsAPI.create(contactId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([QUERY_KEYS.INTERACTIONS, contactId]);
      success(response.data.message || SUCCESS_MESSAGES.INTERACTION_CREATED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to create interaction');
    },
  });
};

export const useDeleteInteraction = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (interactionId) =>
      interactionsAPI.delete(contactId, interactionId),
    onSuccess: (response) => {
      queryClient.invalidateQueries([QUERY_KEYS.INTERACTIONS, contactId]);
      success(response.data.message || SUCCESS_MESSAGES.INTERACTION_DELETED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to delete interaction');
    },
  });
};
