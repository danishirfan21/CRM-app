import { useState } from 'react';

export const TextInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  maxLength,
  placeholder,
  error,
  helpText,
  type = 'text',
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;
  const charCount = maxLength && value ? value.length : 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
          showError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      <div className="flex justify-between items-start mt-1">
        <div className="flex-1">
          {showError && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {!showError && helpText && (
            <p className="text-sm text-gray-500">{helpText}</p>
          )}
        </div>
        {maxLength && (
          <p className={`text-sm ml-2 ${charCount > maxLength * 0.9 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export const EmailInput = ({ label = 'Email', error: propError, ...props }) => {
  const [localError, setLocalError] = useState('');

  const validateEmail = (email) => {
    if (!email) return '';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) ? '' : 'Please enter a valid email address';
  };

  const handleBlur = (e) => {
    const error = validateEmail(e.target.value);
    setLocalError(error);
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <TextInput
      label={label}
      type="email"
      error={propError || localError}
      onBlur={handleBlur}
      {...props}
    />
  );
};

export const PhoneInput = ({ label = 'Phone', ...props }) => {
  const formatPhone = (value) => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    const formatted = formatPhone(e.target.value);
    e.target.value = formatted;
    if (props.onChange) props.onChange(e);
  };

  return (
    <TextInput
      label={label}
      type="tel"
      placeholder="(123) 456-7890"
      onChange={handleChange}
      maxLength={14}
      {...props}
    />
  );
};

export const TextAreaInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  maxLength,
  placeholder,
  error,
  helpText,
  rows = 3,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;
  const charCount = maxLength && value ? value.length : 0;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none ${
          showError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      <div className="flex justify-between items-start mt-1">
        <div className="flex-1">
          {showError && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {!showError && helpText && (
            <p className="text-sm text-gray-500">{helpText}</p>
          )}
        </div>
        {maxLength && (
          <p className={`text-sm ml-2 ${charCount > maxLength * 0.9 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export const PasswordInput = ({ label = 'Password', showStrength = false, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

  const calculateStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-600'];
    
    return { score, label: labels[score], color: colors[score] };
  };

  const handleChange = (e) => {
    if (showStrength) {
      setStrength(calculateStrength(e.target.value));
    }
    if (props.onChange) props.onChange(e);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          onChange={handleChange}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {showStrength && strength.score > 0 && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded ${level <= strength.score ? strength.color : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">Strength: {strength.label}</p>
        </div>
      )}
    </div>
  );
};
