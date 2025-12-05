import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';
import React from 'react';

const menuItems = [
  { path: '/dashboard', label: 'Kryefaqja', icon: '📊' },
  { path: '/resources', label: 'Resurset', icon: '📦' },
  { path: '/purchases', label: 'Blerjet', icon: '🛒' },
  { path: '/sales', label: 'Shitjet', icon: '💳' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Iliri</h1>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

