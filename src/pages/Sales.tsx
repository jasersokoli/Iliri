import { useState } from 'react';
import SalesList from '../components/Sales/SalesList';
import AddSale from '../components/Sales/AddSale';
import './Sales.css';
import React from 'react';

type SalesView = 'menu' | 'list' | 'add';

export default function Sales() {
  const [currentView, setCurrentView] = useState<SalesView>('menu');


  if (currentView === 'menu') {
    return (
      <div className="sales">
        <div className="sales-header">
          <h1 className="sales-title">Shitjet</h1>
        </div>
        <div className="sales-grid">
          <div
            className="sales-card"
            onClick={() => setCurrentView('list')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('list');
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="sales-card-icon">📋</div>
            <h3 className="sales-card-title">Lista e Shitjeve</h3>
            <p className="sales-card-desc">Shiko te gjitha te dhenat e Shitjeve</p>
          </div>
          <div
            className="sales-card"
            onClick={() => setCurrentView('add')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('add');
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="sales-card-icon">➕</div>
            <h3 className="sales-card-title">Shto nje Shitje te re</h3>
            <p className="sales-card-desc">Sheno nje transaksion Shitjet te re</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sales">
      <div className="sales-header">
        <button
          className="sales-back-btn"
          onClick={() => setCurrentView('menu')}
        >
          ← Back
        </button>
        <h1 className="sales-title">Shitjet</h1>
      </div>

      {currentView === 'list' && (
        <SalesList
          onClose={() => setCurrentView('menu')}
        />
      )}

      {currentView === 'add' && (
        <AddSale
          onClose={() => setCurrentView('menu')}
          onBack={() => setCurrentView('list')}
        />
      )}
    </div>
  );
}

