import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './Layout.css';
import React from 'react';

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <TopBar />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

