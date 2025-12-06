import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contactsAPI, tagsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';
import { EmptyContacts, EmptySearchResults } from '../components/EmptyState';
import { ContactGridSkeleton } from '../components/SkeletonLoader';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { isAdmin } = useAuth();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [debouncedSearch, selectedTags, selectedStatus]);

  const fetchTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch,
        tags: selectedTags,
        status: selectedStatus,
      };
      const response = await contactsAPI.getAll(params);
      setContacts(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagFilter = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleDeleteContact = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Contact',
      message: 'Are you sure you want to delete this contact? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await contactsAPI.delete(id);
      success(response.data.message || 'Contact deleted successfully!');
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      showError('Failed to delete contact. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Contacts</h1>
          {!loading && contacts.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Showing {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
              {(search || selectedTags.length > 0 || selectedStatus) && ' (filtered)'}
            </p>
          )}
        </div>
        {isAdmin() && (
          <Link
            to="/contacts/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium touch-manipulation"
            aria-label="Add new contact"
          >
            + Add Contact
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, phone, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagFilter(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      selectedTags.includes(tag.id)
                        ? 'ring-2 ring-offset-2 ring-blue-500'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(search || selectedTags.length > 0 || selectedStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedTags([]);
                setSelectedStatus('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <ContactGridSkeleton count={6} />
      ) : contacts.length === 0 ? (
        (search || selectedTags.length > 0 || selectedStatus) ? (
          <EmptySearchResults 
            onClearSearch={() => {
              setSearch('');
              setSelectedTags([]);
              setSelectedStatus('');
            }}
          />
        ) : (
          <EmptyContacts 
            onAddContact={() => navigate('/contacts/new')}
            isAdmin={isAdmin()}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-lg transition p-4 sm:p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/contacts/${contact.id}`}
                    className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                  >
                    {contact.full_name}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{contact.position}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 truncate">{contact.company}</p>
                </div>
                <span
                  className="px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ml-2"
                  style={{
                    backgroundColor:
                      contact.status === 'customer'
                        ? '#10B98120'
                        : contact.status === 'lead'
                        ? '#3B82F620'
                        : '#6B728020',
                    color:
                      contact.status === 'customer'
                        ? '#10B981'
                        : contact.status === 'lead'
                        ? '#3B82F6'
                        : '#6B7280',
                  }}
                >
                  {contact.status}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="text-gray-600 dark:text-gray-400 truncate">
                  <span className="font-medium">Email:</span> {contact.email}
                </p>
                {contact.phone && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Phone:</span> {contact.phone}
                  </p>
                )}
              </div>

              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Contact tags">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag.id}
                      role="listitem"
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to={`/contacts/${contact.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium touch-manipulation"
                  aria-label={`View details for ${contact.full_name}`}
                >
                  View Details
                </Link>
                {isAdmin() && (
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                    aria-label={`Delete ${contact.full_name}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Contacts;
