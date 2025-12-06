import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatString - The format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a datetime string or Date object to a readable format
 * @param {string|Date} datetime - The datetime to format
 * @param {string} formatString - The format string (default: 'MMM dd, yyyy h:mm a')
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (
  datetime,
  formatString = 'MMM dd, yyyy h:mm a'
) => {
  if (!datetime) return '';

  try {
    const dateObj =
      typeof datetime === 'string' ? parseISO(datetime) : datetime;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

/**
 * Format a date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Get current date in datetime-local input format
 * @returns {string} Datetime string in YYYY-MM-DDTHH:mm format
 */
export const getCurrentDateTimeLocal = () => {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
};

/**
 * Format date for datetime-local input
 * @param {string|Date} date - The date to format
 * @returns {string} Datetime string in YYYY-MM-DDTHH:mm format
 */
export const formatDateTimeLocal = (date) => {
  if (!date) return getCurrentDateTimeLocal();

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return getCurrentDateTimeLocal();
    return format(dateObj, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error formatting datetime-local:', error);
    return getCurrentDateTimeLocal();
  }
};

/**
 * Check if a date is valid
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch {
    return false;
  }
};
