import { useQuery, useMutation, useQueryClient } from '@tantml/react-query';
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
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACTS, params],
    queryFn: () => contactsAPI.getAll(params),
    select: (response) => response.data.data || response.data,
  });
};

export const useContact = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CONTACT, id],
    queryFn: () => contactsAPI.getOne(id),
    select: (response) => response.data,
    enabled: !!id,
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

export const useTags = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TAGS],
    queryFn: () => tagsAPI.getAll(),
    select: (response) => response.data,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data) => tagsAPI.create(data),
    onSuccess: (response) => {
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
      queryClient.invalidateQueries([QUERY_KEYS.TAGS]);
      queryClient.invalidateQueries([QUERY_KEYS.CONTACTS]);
      success(response.data.message || SUCCESS_MESSAGES.TAG_DELETED);
    },
    onError: (err) => {
      error(err.response?.data?.message || 'Failed to delete tag');
    },
  });
};

// ============== TAG ATTACHMENT ==============

export const useAttachTag = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (tagId) => contactsAPI.attachTag(contactId, tagId),
    onMutate: async (tagId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries([QUERY_KEYS.CONTACT, contactId]);

      // Snapshot previous value
      const previousContact = queryClient.getQueryData([
        QUERY_KEYS.CONTACT,
        contactId,
      ]);

      // Optimistically update
      queryClient.setQueryData([QUERY_KEYS.CONTACT, contactId], (old) => {
        const tags = queryClient.getQueryData([QUERY_KEYS.TAGS]);
        const tag = tags?.find((t) => t.id === tagId);

        return {
          ...old,
          tags: [...(old?.tags || []), tag],
        };
      });

      return { previousContact };
    },
    onSuccess: (response) => {
      success(response.data.message || SUCCESS_MESSAGES.TAG_ATTACHED);
    },
    onError: (err, tagId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        [QUERY_KEYS.CONTACT, contactId],
        context.previousContact
      );
      error(err.response?.data?.message || 'Failed to attach tag');
    },
    onSettled: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CONTACT, contactId]);
    },
  });
};

export const useDetachTag = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (tagId) => contactsAPI.detachTag(contactId, tagId),
    onMutate: async (tagId) => {
      await queryClient.cancelQueries([QUERY_KEYS.CONTACT, contactId]);
      const previousContact = queryClient.getQueryData([
        QUERY_KEYS.CONTACT,
        contactId,
      ]);

      queryClient.setQueryData([QUERY_KEYS.CONTACT, contactId], (old) => ({
        ...old,
        tags: old?.tags?.filter((t) => t.id !== tagId) || [],
      }));

      return { previousContact };
    },
    onSuccess: (response) => {
      success(response.data.message || SUCCESS_MESSAGES.TAG_DETACHED);
    },
    onError: (err, tagId, context) => {
      queryClient.setQueryData(
        [QUERY_KEYS.CONTACT, contactId],
        context.previousContact
      );
      error(err.response?.data?.message || 'Failed to detach tag');
    },
    onSettled: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CONTACT, contactId]);
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
  });
};

export const useCreateNote = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data) => notesAPI.create(contactId, data),
    onMutate: async (newNote) => {
      await queryClient.cancelQueries([QUERY_KEYS.NOTES, contactId]);
      const previousNotes = queryClient.getQueryData([
        QUERY_KEYS.NOTES,
        contactId,
      ]);

      const optimisticNote = {
        id: `temp-${Date.now()}`,
        content: newNote.content,
        is_private: newNote.is_private,
        user: queryClient.getQueryData([QUERY_KEYS.USER]),
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData([QUERY_KEYS.NOTES, contactId], (old) => [
        optimisticNote,
        ...(old || []),
      ]);

      return { previousNotes, optimisticNote };
    },
    onSuccess: (response, variables, context) => {
      queryClient.setQueryData([QUERY_KEYS.NOTES, contactId], (old) =>
        old.map((note) =>
          note.id === context.optimisticNote.id
            ? response.data.note || response.data
            : note
        )
      );
      success(response.data.message || SUCCESS_MESSAGES.NOTE_CREATED);
    },
    onError: (err, newNote, context) => {
      queryClient.setQueryData(
        [QUERY_KEYS.NOTES, contactId],
        context.previousNotes
      );
      error(err.response?.data?.message || 'Failed to create note');
    },
  });
};

export const useDeleteNote = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (noteId) => notesAPI.delete(contactId, noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries([QUERY_KEYS.NOTES, contactId]);
      const previousNotes = queryClient.getQueryData([
        QUERY_KEYS.NOTES,
        contactId,
      ]);

      queryClient.setQueryData(
        [QUERY_KEYS.NOTES, contactId],
        (old) => old?.filter((note) => note.id !== noteId) || []
      );

      return { previousNotes };
    },
    onSuccess: (response) => {
      success(response.data.message || SUCCESS_MESSAGES.NOTE_DELETED);
    },
    onError: (err, noteId, context) => {
      queryClient.setQueryData(
        [QUERY_KEYS.NOTES, contactId],
        context.previousNotes
      );
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
  });
};

export const useCreateInteraction = (contactId) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (data) => interactionsAPI.create(contactId, data),
    onMutate: async (newInteraction) => {
      await queryClient.cancelQueries([QUERY_KEYS.INTERACTIONS, contactId]);
      const previousInteractions = queryClient.getQueryData([
        QUERY_KEYS.INTERACTIONS,
        contactId,
      ]);

      const optimisticInteraction = {
        id: `temp-${Date.now()}`,
        ...newInteraction,
        user: queryClient.getQueryData([QUERY_KEYS.USER]),
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData([QUERY_KEYS.INTERACTIONS, contactId], (old) => [
        optimisticInteraction,
        ...(old || []),
      ]);

      return { previousInteractions, optimisticInteraction };
    },
    onSuccess: (response, variables, context) => {
      queryClient.setQueryData([QUERY_KEYS.INTERACTIONS, contactId], (old) =>
        old.map((interaction) =>
          interaction.id === context.optimisticInteraction.id
            ? response.data.interaction || response.data
            : interaction
        )
      );
      success(response.data.message || SUCCESS_MESSAGES.INTERACTION_CREATED);
    },
    onError: (err, newInteraction, context) => {
      queryClient.setQueryData(
        [QUERY_KEYS.INTERACTIONS, contactId],
        context.previousInteractions
      );
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
    onMutate: async (interactionId) => {
      await queryClient.cancelQueries([QUERY_KEYS.INTERACTIONS, contactId]);
      const previousInteractions = queryClient.getQueryData([
        QUERY_KEYS.INTERACTIONS,
        contactId,
      ]);

      queryClient.setQueryData(
        [QUERY_KEYS.INTERACTIONS, contactId],
        (old) =>
          old?.filter((interaction) => interaction.id !== interactionId) || []
      );

      return { previousInteractions };
    },
    onSuccess: (response) => {
      success(response.data.message || SUCCESS_MESSAGES.INTERACTION_DELETED);
    },
    onError: (err, interactionId, context) => {
      queryClient.setQueryData(
        [QUERY_KEYS.INTERACTIONS, contactId],
        context.previousInteractions
      );
      error(err.response?.data?.message || 'Failed to delete interaction');
    },
  });
};
