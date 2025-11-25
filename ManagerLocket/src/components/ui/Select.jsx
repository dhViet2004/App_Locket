import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({ value, onValueChange, children, placeholder = 'Select...', className = '' }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedChild = React.Children.toArray(children).find(
    (child) => child.props.value === value
  );

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-gray-300"
      >
        <span className={value ? 'text-gray-900 dark:text-gray-50' : 'text-gray-500'}>
          {selectedChild ? selectedChild.props.children : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-800 dark:bg-gray-900">
          <div className="p-1">
            {React.Children.map(children, (child) => (
              <div
                key={child.props.value}
                onClick={() => {
                  onValueChange(child.props.value);
                  setOpen(false);
                }}
                className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  value === child.props.value ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                {child.props.children}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SelectItem({ value, children }) {
  return <div data-value={value}>{children}</div>;
}

