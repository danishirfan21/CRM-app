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
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 dark:text-gray-100">
          Tag Management
        </h1>
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold dark:text-gray-100">
          Tag Management
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Tag
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-100">
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tag Name */}
            <div>
              <label className="block mb-2 text-sm font-medium dark:text-gray-300">
                Tag Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block mb-2 text-sm font-medium dark:text-gray-300">
                Color *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-20 border"
                />
                <div className="flex gap-2">
                  {presets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium dark:text-gray-300">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {submitting
                  ? 'Saving...'
                  : editingTag
                  ? 'Update Tag'
                  : 'Create Tag'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tags.length === 0 && !showForm && (
        <EmptyTags onCreateTag={() => setShowForm(true)} />
      )}

      {tags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase hidden sm:table-cell">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Contacts
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y dark:divide-gray-700">
              {tags.map((tag) => (
                <tr
                  key={tag.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2"
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  </td>

                  <td className="px-6 py-4 hidden sm:table-cell text-sm">
                    {tag.description || '-'}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {tag.contacts_count || 0} contacts
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Tags;
