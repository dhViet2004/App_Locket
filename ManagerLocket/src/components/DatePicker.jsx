import { useState } from 'react';

export default function DatePicker({ label, value, onChange, error, min, max }) {
  const [isFocused, setIsFocused] = useState(false);

  // Convert ISO string to local datetime-local format
  const toLocalInputValue = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tz.toISOString().slice(0, 16);
  };

  // Convert local datetime-local format to ISO string
  const fromLocalInputValue = (v) => {
    if (!v) return undefined;
    const d = new Date(v);
    return d.toISOString();
  };

  const handleChange = (e) => {
    const newValue = fromLocalInputValue(e.target.value);
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <input
          type="datetime-local"
          value={toLocalInputValue(value)}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min ? toLocalInputValue(min) : undefined}
          max={max ? toLocalInputValue(max) : undefined}
          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 ${
            isFocused
              ? 'border-indigo-500 ring-2 ring-indigo-200'
              : 'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          } ${error ? 'border-red-500' : ''}`}
        />
      </div>
      {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
    </div>
  );
}

