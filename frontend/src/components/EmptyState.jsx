const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  actionLabel,
  helpText 
}) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
        {description}
      </p>
      {helpText && (
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 max-w-md mx-auto">
          💡 {helpText}
        </p>
      )}
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

// Preset empty states
export const EmptyContacts = ({ onAddContact, isAdmin }) => (
  <EmptyState
    icon={
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    }
    title="No contacts yet"
    description="Start building your network by adding your first contact. You can track interactions, add notes, and organize with tags."
    helpText="Contacts are the heart of your CRM. Add clients, leads, or partners to get started."
    action={isAdmin ? onAddContact : null}
    actionLabel="Add Your First Contact"
  />
);

export const EmptyTags = ({ onCreateTag }) => (
  <EmptyState
    icon={
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    }
    title="No tags created yet"
    description="Organize your contacts with tags. Create labels like 'VIP', 'Hot Lead', or 'Partner' to categorize and filter easily."
    helpText="Tags help you segment contacts and find them quickly."
    action={onCreateTag}
    actionLabel="Create Your First Tag"
  />
);

export const EmptyNotes = () => (
  <EmptyState
    icon={
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    }
    title="No notes yet"
    description="Add notes to keep track of important details, conversations, or reminders about this contact."
    helpText="Use private notes for internal information only visible to you and admins."
  />
);

export const EmptyInteractions = () => (
  <EmptyState
    icon={
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    }
    title="No interactions logged"
    description="Track all your communications with this contact. Log calls, emails, meetings, and more to maintain a complete history."
    helpText="Keeping an interaction timeline helps you stay organized and never miss a follow-up."
  />
);

export const EmptySearchResults = ({ onClearSearch }) => (
  <EmptyState
    icon={
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="No results found"
    description="We couldn't find any contacts matching your search criteria. Try adjusting your filters or search terms."
    action={onClearSearch}
    actionLabel="Clear Filters"
  />
);
