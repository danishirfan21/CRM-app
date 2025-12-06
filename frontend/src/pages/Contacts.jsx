import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../components/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';
import { useContacts, useDeleteContact } from '../hooks/useQueries';
import { EmptyContacts, EmptySearchResults } from '../components/EmptyState';
import { ContactGridSkeleton } from '../components/SkeletonLoader';
import { useTags } from '../hooks/useQueries';

function Contacts() {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { isAdmin } = useAuth();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(search, 500);

  // Use React Query hooks
  const params = useMemo(
    () => ({
      search: debouncedSearch,
      tags: selectedTags,
      status: selectedStatus,
    }),
    [debouncedSearch, selectedTags, selectedStatus]
  );

  const { data: contacts = [], isLoading, isRefetching } = useContacts(params);
  const { data: tags = [], isLoading: tagsLoading } = useTags();
  const deleteContactMutation = useDeleteContact();

  const handleTagFilter = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleDeleteContact = async (id, contactName) => {
    const confirmed = await confirm({
      title: 'Delete Contact',
      message: `Are you sure you want to delete ${contactName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    deleteContactMutation.mutate(id);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTags([]);
    setSelectedStatus('');
  };

  const hasFilters = search || selectedTags.length > 0 || selectedStatus;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Contacts
          </h1>
          {!isLoading && contacts.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Showing {contacts.length}{' '}
              {contacts.length === 1 ? 'contact' : 'contacts'}
              {hasFilters && ' (filtered)'}
            </p>
          )}
        </div>
        {isAdmin() && (
          <Link
            to="/contacts/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium min-h-[44px] touch-manipulation"
            aria-label="Add new contact"
          >
            + Add Contact
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, phone, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading && !isRefetching}
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Search contacts"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                disabled={isLoading && !isRefetching}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Clear search"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={isLoading && !isRefetching}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tagsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                    />
                  ))
                ) : tags.length > 0 ? (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagFilter(tag.id)}
                      disabled={isLoading && !isRefetching}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] touch-manipulation ${
                        selectedTags.includes(tag.id)
                          ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                      }}
                      aria-pressed={selectedTags.includes(tag.id)}
                      aria-label={`Filter by ${tag.name} tag`}
                    >
                      {tag.name}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tags available
                  </p>
                )}
              </div>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              disabled={isLoading && !isRefetching}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Contacts Grid */}
      <div
        className={
          isRefetching && !isLoading ? 'opacity-50 pointer-events-none' : ''
        }
      >
        {isLoading && !isRefetching ? (
          <ContactGridSkeleton count={6} />
        ) : contacts.length === 0 ? (
          hasFilters ? (
            <EmptySearchResults onClearSearch={clearFilters} />
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {contact.position}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                      {contact.company}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ml-2 capitalize"
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
                      <span className="font-medium">Phone:</span>{' '}
                      {contact.phone}
                    </p>
                  )}
                </div>

                {contact.tags && contact.tags.length > 0 && (
                  <div
                    className="flex flex-wrap gap-2 mb-4"
                    role="list"
                    aria-label="Contact tags"
                  >
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
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium min-h-[44px] flex items-center touch-manipulation"
                    aria-label={`View details for ${contact.full_name}`}
                  >
                    View Details
                  </Link>
                  {isAdmin() && (
                    <button
                      onClick={() =>
                        handleDeleteContact(contact.id, contact.full_name)
                      }
                      disabled={deleteContactMutation.isLoading}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
    </div>
  );
}

export default Contacts;
