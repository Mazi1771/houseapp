import React, { useState, useRef, useEffect } from 'react';
export const Menu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {React.Children.map(children, child => {
        if (child.type === MenuTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
          });
        }
        if (child.type === MenuContent) {
          return isOpen ? child : null;
        }
        return child;
      })}
    </div>
  );
};
export const MenuTrigger = ({ children, onClick }) => {
  return React.cloneElement(children, { onClick });
};
export const MenuContent = ({ children }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};
export const MenuItem = ({ onClick, children, className = '' }) => {
  return (
    <button>
      className={w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${className}}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      {children}
    </button>
  );
};
