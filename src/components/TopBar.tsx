import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './TopBar.css';
import React from 'react';

export default function TopBar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleAccountInfo = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">Inventory Management</h2>
      </div>
      <div className="topbar-right">
        <div className="topbar-user" ref={dropdownRef}>
          <button
            className="topbar-profile-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setDropdownOpen(!dropdownOpen);
              }
            }}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <span className="topbar-avatar">
              {user?.name ? getInitials(user.name) : 'U'}
            </span>
            <span className="topbar-username">{user?.name || 'User'}</span>
          </button>
          {dropdownOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <div className="topbar-dropdown-name">{user?.name}</div>
                <div className="topbar-dropdown-email">{user?.email}</div>
              </div>
              <div className="topbar-dropdown-divider"></div>
              <button
                className="topbar-dropdown-item"
                onClick={handleAccountInfo}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAccountInfo();
                  }
                }}
              >
                Account Info
              </button>
              <button
                className="topbar-dropdown-item"
                onClick={handleSignOut}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSignOut();
                  }
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

