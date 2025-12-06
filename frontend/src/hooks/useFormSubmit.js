import { useState } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook for handling form submissions with loading, error states, and toast notifications
 * @param {Function} submitFn - The async function to call on submit
 * @param {Object} options - Configuration options
 * @returns {Object} - { handleSubmit, loading, error, resetError }
 */
export const useFormSubmit = (submitFn, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: showErrorToastFn } = useToast();

  const {
    successMessage = 'Operation successful!',
    errorMessage = 'Operation failed. Please try again.',
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const handleSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const response = await submitFn(data);

      if (showSuccessToast) {
        const message = response?.data?.message || successMessage;
        success(message);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return { success: true, data: response };
    } catch (err) {
      const errorMsg = err.response?.data?.message || errorMessage;
      setError(errorMsg);

      if (showErrorToast) {
        showErrorToastFn(errorMsg);
      }

      if (onError) {
        onError(err);
      }

      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError('');

  return { handleSubmit, loading, error, resetError };
};
