import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';

import {
  useTags,
  useCreateTag,
  useDeleteTag,
  useUpdateTag,
} from '../hooks/useQueries';
import { EmptyTags } from '../components/EmptyState';
import { TableSkeleton } from '../components/SkeletonLoader';

function Tags() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { success, error: showError } = useToast();
  const { confirm } = useConfirm();

  // React Query hooks
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
  });

  if (!isAdmin()) {
    navigate('/contacts');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const mutation = editingTag
      ? updateTag.mutateAsync({ id: editingTag.id, data: formData })
      : createTag.mutateAsync(formData);

    mutation
      .then((res) => {
        success(
          res?.data?.message ||
            `Tag ${editingTag ? 'updated' : 'created'} successfully!`
        );
        resetForm();
      })
      .catch((error) => {
        showError(error.response?.data?.message || 'Failed to save tag');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Tag',
      message: 'Are you sure? This will remove the tag from all contacts.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    deleteTag.mutate(id, {
      onSuccess: (res) =>
        success(res?.data?.message || 'Tag deleted successfully!'),
      onError: () => showError('Failed to delete tag'),
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTag(null);
    setFormData({ name: '', color: '#3B82F6', description: '' });
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || '',
    });
    setShowForm(true);
  };

  const presets = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#6B7280',
    '#14B8A6',
  ];

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Tag Management
        </h1>
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Tag Management
          </h1>
          {tags.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {tags.length} {tags.length === 1 ? 'tag' : 'tags'} total
            </p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium min-h-[44px] touch-manipulation"
            aria-label="Create new tag"
          >
            + Create Tag
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tag Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tag Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter tag name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                aria-label="Tag name"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color *
              </label>
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  aria-label="Select custom color"
                />
                <div className="flex flex-wrap gap-2">
                  {presets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className="w-10 h-10 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform min-h-[44px] min-w-[44px] touch-manipulation"
                      style={{ backgroundColor: color }}
                      title={`Select color ${color}`}
                      aria-label={`Select preset color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Current color: {formData.color}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter tag description (optional)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                aria-label="Tag description"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px] touch-manipulation transition"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>{editingTag ? 'Update Tag' : 'Create Tag'}</>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="inline-flex items-center justify-center px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px] touch-manipulation transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {tags.length === 0 && !showForm && (
        <EmptyTags onCreateTag={() => setShowForm(true)} />
      )}

      {/* Tags Table */}
      {tags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Contacts
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: tag.color + '20',
                          color: tag.color,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        ></span>
                        {tag.name}
                      </span>
                    </td>

                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {tag.description || '-'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {tag.contacts_count || 0}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        {tag.contacts_count === 1 ? 'contact' : 'contacts'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="inline-flex items-center justify-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium min-h-[44px] px-3 touch-manipulation transition"
                          aria-label={`Edit ${tag.name} tag`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          disabled={deleteTag.isLoading}
                          className="inline-flex items-center justify-center text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium min-h-[44px] px-3 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition"
                          aria-label={`Delete ${tag.name} tag`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tags;
