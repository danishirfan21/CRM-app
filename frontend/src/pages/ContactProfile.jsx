import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contactsAPI, tagsAPI, notesAPI, interactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { EmptyNotes, EmptyInteractions } from '../components/EmptyState';
import { ProfileSkeleton, ListSkeleton } from '../components/SkeletonLoader';

function ContactProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  
  const [contact, setContact] = useState(null);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [addingNote, setAddingNote] = useState(false);
  const [addingInteraction, setAddingInteraction] = useState(false);
  const [updatingContact, setUpdatingContact] = useState(false);

  const [noteContent, setNoteContent] = useState('');
  const [notePrivate, setNotePrivate] = useState(true);

  const [interactionType, setInteractionType] = useState('call');
  const [interactionSubject, setInteractionSubject] = useState('');
  const [interactionDescription, setInteractionDescription] = useState('');
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().slice(0, 16));
  const [interactionDuration, setInteractionDuration] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchContact();
    fetchTags();
    fetchNotes();
    fetchInteractions();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContact = async () => {
    try {
      const response = await contactsAPI.getOne(id);
      setContact(response.data);
      setEditForm(response.data);
    } catch (error) {
      console.error('Error fetching contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getAll(id);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchInteractions = async () => {
    try {
      const response = await interactionsAPI.getAll(id);
      setInteractions(response.data);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setAddingNote(true);
    try {
      const response = await notesAPI.create(id, {
        content: noteContent,
        is_private: notePrivate,
      });
      success(response.data.message || 'Note added successfully!');
      setNoteContent('');
      setNotePrivate(true);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      showError('Failed to add note. Please try again.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await notesAPI.delete(id, noteId);
      success(response.data.message || 'Note deleted successfully!');
      setNotes(notes.filter(note => note.id !== noteId));
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      showError('Failed to delete note. Please try again.');
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    setAddingInteraction(true);
    try {
      const response = await interactionsAPI.create(id, {
        type: interactionType,
        subject: interactionSubject,
        description: interactionDescription,
        interaction_date: interactionDate,
        duration_minutes: interactionDuration ? parseInt(interactionDuration) : null,
      });
      success(response.data.message || 'Interaction logged successfully!');
      setInteractionSubject('');
      setInteractionDescription('');
      setInteractionDuration('');
      setInteractionDate(new Date().toISOString().slice(0, 16));
      fetchInteractions();
    } catch (error) {
      console.error('Error adding interaction:', error);
      showError('Failed to add interaction. Please try again.');
    } finally {
      setAddingInteraction(false);
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    const confirmed = await confirm({
      title: 'Delete Interaction',
      message: 'Are you sure you want to delete this interaction? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await interactionsAPI.delete(id, interactionId);
      success(response.data.message || 'Interaction deleted successfully!');
      fetchInteractions();
    } catch (error) {
      console.error('Error deleting interaction:', error);
      showError('Failed to delete interaction. Please try again.');
    }
  };

  const handleAttachTag = async (tagId) => {
    try {
      const response = await contactsAPI.attachTag(id, tagId);
      success(response.data.message || 'Tag attached successfully!');
      fetchContact();
    } catch (error) {
      console.error('Error attaching tag:', error);
      showError('Failed to attach tag. Please try again.');
    }
  };

  const handleDetachTag = async (tagId) => {
    const confirmed = await confirm({
      title: 'Remove Tag',
      message: 'Are you sure you want to remove this tag from the contact?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'warning',
    });

    if (!confirmed) return;

    try {
      const response = await contactsAPI.detachTag(id, tagId);
      success(response.data.message || 'Tag removed successfully!');
      fetchContact();
    } catch (error) {
      console.error('Error detaching tag:', error);
      showError('Failed to remove tag. Please try again.');
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setUpdatingContact(true);
    try {
      const response = await contactsAPI.update(id, editForm);
      success(response.data.message || 'Contact updated successfully!');
      setIsEditing(false);
      fetchContact();
    } catch (error) {
      console.error('Error updating contact:', error);
      showError('Failed to update contact. Please try again.');
    } finally {
      setUpdatingContact(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!contact) {
    return (
      <div className="text-center py-12 dark:text-gray-300">
        Contact not found
      </div>
    );
  }

  const availableTags = tags.filter(
    (tag) => !contact.tags?.some((ct) => ct.id === tag.id)
  );

  return (
    <div>
      <div className="mb-6">
        <Link to="/contacts" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          &larr; Back to Contacts
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{contact.full_name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{contact.position} at {contact.company}</p>
          </div>
          {isAdmin() && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition min-h-[44px] min-w-[44px] touch-manipulation"
              aria-label="Edit contact details"
            >
              Edit Contact
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateContact} className="space-y-4" aria-label="Edit contact form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  value={editForm.first_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editForm.last_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="text"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                <input
                  type="text"
                  value={editForm.company || ''}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                <input
                  type="text"
                  value={editForm.position || ''}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={editForm.status || 'lead'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updatingContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
              >
                {updatingContact ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(contact);
                }}
                disabled={updatingContact}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Contact Information</h3>
              <div className="space-y-2">
                <p className="text-gray-900 dark:text-gray-100">
                  <span className="font-medium">Email:</span> {contact.email}
                </p>
                {contact.phone && (
                  <p className="text-gray-900 dark:text-gray-100">
                    <span className="font-medium">Phone:</span> {contact.phone}
                  </p>
                )}
                <p className="text-gray-900 dark:text-gray-100">
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{contact.status}</span>
                </p>
              </div>
            </div>

            {contact.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Address</h3>
                <div className="text-gray-900 dark:text-gray-100">
                  <p>{contact.address}</p>
                  <p>
                    {contact.city}, {contact.state} {contact.zip_code}
                  </p>
                  <p>{contact.country}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {contact.tags?.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                style={{
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                }}
              >
                {tag.name}
                {isAdmin() && (
                  <button
                    onClick={() => handleDetachTag(tag.id)}
                    className="hover:opacity-70 min-h-[24px] min-w-[24px] touch-manipulation"
                    aria-label={`Remove ${tag.name} tag`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {isAdmin() && availableTags.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAttachTag(parseInt(e.target.value));
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[44px] touch-manipulation"
                aria-label="Add tag to contact"
              >
                <option value="">+ Add Tag</option>
                {availableTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex" role="tablist" aria-label="Contact profile sections">
            <button
              onClick={() => setActiveTab('overview')}
              role="tab"
              aria-selected={activeTab === 'overview'}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition min-h-[44px] touch-manipulation ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              role="tab"
              aria-selected={activeTab === 'notes'}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition min-h-[44px] touch-manipulation ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Notes ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              role="tab"
              aria-selected={activeTab === 'interactions'}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition min-h-[44px] touch-manipulation ${
                activeTab === 'interactions'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Interactions ({interactions.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Recent Activity</h3>
                {interactions.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {interactions.slice(0, 3).map((interaction) => (
                      <div key={interaction.id} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{interaction.subject}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{interaction.type}</p>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(interaction.interaction_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Recent Notes</h3>
                {notes.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {notes.slice(0, 3).map((note) => (
                      <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-900 dark:text-gray-100">{note.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{note.user.name}</span>
                          {note.is_private && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No notes yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <form onSubmit={handleAddNote} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4" aria-label="Add note form">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Add Note</h3>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter your note..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                  rows="3"
                  required
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notePrivate}
                      onChange={(e) => setNotePrivate(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Private note (only visible to you{isAdmin() ? ' and admins' : ''})</span>
                  </label>
                  <button
                    type="submit"
                    disabled={addingNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                  >
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </form>

              {notes.length === 0 ? (
                <EmptyNotes />
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{note.user.name}</span>
                          {note.is_private && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                              Private
                            </span>
                          )}
                        </div>
                        {(note.user_id === user.id || isAdmin()) && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 min-h-[44px] min-w-[44px] touch-manipulation"
                            aria-label="Delete note"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-900 dark:text-gray-100">{note.content}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-6">
              <form onSubmit={handleAddInteraction} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4" aria-label="Log interaction form">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Log Interaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="note">Note</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={interactionDate}
                      onChange={(e) => setInteractionDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      value={interactionSubject}
                      onChange={(e) => setInteractionSubject(e.target.value)}
                      placeholder="Brief subject line"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      value={interactionDescription}
                      onChange={(e) => setInteractionDescription(e.target.value)}
                      placeholder="Detailed description (optional)"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={interactionDuration}
                      onChange={(e) => setInteractionDuration(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={addingInteraction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                  >
                    {addingInteraction ? 'Logging...' : 'Log Interaction'}
                  </button>
                </div>
              </form>

              {interactions.length === 0 ? (
                <EmptyInteractions />
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold dark:text-gray-100">Timeline</h3>
                  {interactions.map((interaction, index) => (
                    <div key={interaction.id} className="relative">
                      {index !== interactions.length - 1 && (
                        <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                      )}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {interaction.type[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">{interaction.subject}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{interaction.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(interaction.interaction_date).toLocaleString()}
                              </p>
                              {(interaction.user_id === user.id || isAdmin()) && (
                                <button
                                  onClick={() => handleDeleteInteraction(interaction.id)}
                                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-1 min-h-[44px] min-w-[44px] touch-manipulation"
                                  aria-label="Delete interaction"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                          {interaction.description && (
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{interaction.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>By {interaction.user.name}</span>
                            {interaction.duration_minutes && (
                              <span>{interaction.duration_minutes} minutes</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactProfile;
