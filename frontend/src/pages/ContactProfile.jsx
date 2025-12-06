import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contactsAPI, tagsAPI, notesAPI, interactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ContactProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [contact, setContact] = useState(null);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
    try {
      await notesAPI.create(id, {
        content: noteContent,
        is_private: notePrivate,
      });
      setNoteContent('');
      setNotePrivate(true);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesAPI.delete(id, noteId);
      // Immediately update UI by filtering out deleted note
      setNotes(notes.filter(note => note.id !== noteId));
      // Then fetch fresh data from server
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    try {
      await interactionsAPI.create(id, {
        type: interactionType,
        subject: interactionSubject,
        description: interactionDescription,
        interaction_date: interactionDate,
        duration_minutes: interactionDuration ? parseInt(interactionDuration) : null,
      });
      setInteractionSubject('');
      setInteractionDescription('');
      setInteractionDuration('');
      setInteractionDate(new Date().toISOString().slice(0, 16));
      fetchInteractions();
    } catch (error) {
      console.error('Error adding interaction:', error);
      alert('Failed to add interaction');
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    if (!window.confirm('Delete this interaction?')) return;
    try {
      await interactionsAPI.delete(id, interactionId);
      fetchInteractions();
    } catch (error) {
      console.error('Error deleting interaction:', error);
      alert('Failed to delete interaction');
    }
  };

  const handleAttachTag = async (tagId) => {
    try {
      await contactsAPI.attachTag(id, tagId);
      fetchContact();
    } catch (error) {
      console.error('Error attaching tag:', error);
    }
  };

  const handleDetachTag = async (tagId) => {
    try {
      await contactsAPI.detachTag(id, tagId);
      fetchContact();
    } catch (error) {
      console.error('Error detaching tag:', error);
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      await contactsAPI.update(id, editForm);
      setIsEditing(false);
      fetchContact();
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contact) {
    return <div className="text-center py-12">Contact not found</div>;
  }

  const availableTags = tags.filter(
    (tag) => !contact.tags?.some((ct) => ct.id === tag.id)
  );

  return (
    <div>
      <div className="mb-6">
        <Link to="/contacts" className="text-blue-600 hover:text-blue-700 font-medium">
          &larr; Back to Contacts
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contact.full_name}</h1>
            <p className="text-gray-600">{contact.position} at {contact.company}</p>
          </div>
          {isAdmin() && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Contact
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateContact} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editForm.first_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editForm.last_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={editForm.company || ''}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  value={editForm.position || ''}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status || 'lead'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(contact);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-medium">Email:</span> {contact.email}
                </p>
                {contact.phone && (
                  <p className="text-gray-900">
                    <span className="font-medium">Phone:</span> {contact.phone}
                  </p>
                )}
                <p className="text-gray-900">
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{contact.status}</span>
                </p>
              </div>
            </div>

            {contact.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
                <div className="text-gray-900">
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
          <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
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
                    className="hover:opacity-70"
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
                className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Notes ({notes.length})
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'interactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {interactions.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {interactions.slice(0, 3).map((interaction) => (
                      <div key={interaction.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{interaction.subject}</p>
                            <p className="text-sm text-gray-600">{interaction.type}</p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(interaction.interaction_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activity</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Notes</h3>
                {notes.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {notes.slice(0, 3).map((note) => (
                      <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900">{note.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <span>{note.user.name}</span>
                          {note.is_private && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No notes yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <form onSubmit={handleAddNote} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Add Note</h3>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter your note..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                  rows="3"
                  required
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notePrivate}
                      onChange={(e) => setNotePrivate(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Private note (only visible to you{isAdmin() ? ' and admins' : ''})</span>
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Note
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{note.user.name}</span>
                        {note.is_private && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                            Private
                          </span>
                        )}
                      </div>
                      {(note.user_id === user.id || isAdmin()) && (
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-900">{note.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-6">
              <form onSubmit={handleAddInteraction} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Log Interaction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={interactionType}
                      onChange={(e) => setInteractionType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="note">Note</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={interactionDate}
                      onChange={(e) => setInteractionDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={interactionSubject}
                      onChange={(e) => setInteractionSubject(e.target.value)}
                      placeholder="Brief subject line"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={interactionDescription}
                      onChange={(e) => setInteractionDescription(e.target.value)}
                      placeholder="Detailed description (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={interactionDuration}
                      onChange={(e) => setInteractionDuration(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Log Interaction
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Timeline</h3>
                {interactions.map((interaction, index) => (
                  <div key={interaction.id} className="relative">
                    {index !== interactions.length - 1 && (
                      <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {interaction.type[0].toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{interaction.subject}</h4>
                            <p className="text-sm text-gray-600 capitalize">{interaction.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(interaction.interaction_date).toLocaleString()}
                            </p>
                            {(interaction.user_id === user.id || isAdmin()) && (
                              <button
                                onClick={() => handleDeleteInteraction(interaction.id)}
                                className="text-sm text-red-600 hover:text-red-700 mt-1"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        {interaction.description && (
                          <p className="text-gray-700 mb-2">{interaction.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactProfile;
