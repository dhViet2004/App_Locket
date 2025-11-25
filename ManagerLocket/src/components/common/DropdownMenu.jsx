import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function DropdownMenu({ children, trigger }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {trigger || <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {typeof children === 'function' 
              ? children(() => setOpen(false))
              : React.Children.map(children, (child) => {
                  if (React.isValidElement(child) && child.type === DropdownMenuItem) {
                    return React.cloneElement(child, { onClose: () => setOpen(false) });
                  }
                  return child;
                })
            }
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = '', danger = false, onClose }) {
  return (
    <button
      onClick={() => {
        onClick?.();
        onClose?.();
      }}
      className={`block w-full text-left px-4 py-2 text-sm ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      } ${className}`}
      role="menuitem"
    >
      {children}
    </button>
  );
}

