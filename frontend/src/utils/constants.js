// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000,
};

// Timing Constants
export const TIMING = {
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
};

// Contact Status Options
export const CONTACT_STATUS = {
  LEAD: 'lead',
  CUSTOMER: 'customer',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const STATUS_OPTIONS = [
  { value: CONTACT_STATUS.LEAD, label: 'Lead' },
  { value: CONTACT_STATUS.CUSTOMER, label: 'Customer' },
  { value: CONTACT_STATUS.ACTIVE, label: 'Active' },
  { value: CONTACT_STATUS.INACTIVE, label: 'Inactive' },
];

// Interaction Types
export const INTERACTION_TYPE = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  NOTE: 'note',
  OTHER: 'other',
};

export const INTERACTION_TYPE_OPTIONS = [
  { value: INTERACTION_TYPE.CALL, label: 'Call' },
  { value: INTERACTION_TYPE.EMAIL, label: 'Email' },
  { value: INTERACTION_TYPE.MEETING, label: 'Meeting' },
  { value: INTERACTION_TYPE.NOTE, label: 'Note' },
  { value: INTERACTION_TYPE.OTHER, label: 'Other' },
];

// Color Presets for Tags
export const TAG_COLOR_PRESETS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
];

// Default Tag Color
export const DEFAULT_TAG_COLOR = '#3B82F6';

// Date Formats
export const DATE_FORMAT = {
  DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY h:mm A',
  DISPLAY_TIME: 'h:mm A',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Status Color Mapping
export const STATUS_COLORS = {
  [CONTACT_STATUS.CUSTOMER]: {
    bg: '#10B98120',
    text: '#10B981',
  },
  [CONTACT_STATUS.LEAD]: {
    bg: '#3B82F620',
    text: '#3B82F6',
  },
  [CONTACT_STATUS.ACTIVE]: {
    bg: '#10B98120',
    text: '#10B981',
  },
  [CONTACT_STATUS.INACTIVE]: {
    bg: '#6B728020',
    text: '#6B7280',
  },
};

// Query Keys for React Query
export const QUERY_KEYS = {
  CONTACTS: 'contacts',
  CONTACT: 'contact',
  TAGS: 'tags',
  TAG: 'tag',
  NOTES: 'notes',
  INTERACTIONS: 'interactions',
  USER: 'user',
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CONTACT_CREATED: 'Contact created successfully!',
  CONTACT_UPDATED: 'Contact updated successfully!',
  CONTACT_DELETED: 'Contact deleted successfully!',
  TAG_CREATED: 'Tag created successfully!',
  TAG_UPDATED: 'Tag updated successfully!',
  TAG_DELETED: 'Tag deleted successfully!',
  TAG_ATTACHED: 'Tag attached successfully!',
  TAG_DETACHED: 'Tag removed successfully!',
  NOTE_CREATED: 'Note added successfully!',
  NOTE_DELETED: 'Note deleted successfully!',
  INTERACTION_CREATED: 'Interaction logged successfully!',
  INTERACTION_DELETED: 'Interaction deleted successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
};

// Form Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 255,
  MAX_NOTE_LENGTH: 5000,
  MAX_DESCRIPTION_LENGTH: 1000,
};

// Keyboard Keys
export const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
};

// Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};
