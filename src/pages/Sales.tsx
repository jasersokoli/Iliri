import { useState } from 'react';
import SalesList from '../components/Sales/SalesList';
import AddSale from '../components/Sales/AddSale';
import './Sales.css';

type SalesView = 'menu' | 'list' | 'add';

export default function Sales() {
  const [currentView, setCurrentView] = useState<SalesView>('menu');


  if (currentView === 'menu') {
    return (
      <div className="sales">
        <div className="sales-header">
          <h1 className="sales-title">Sales</h1>
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
            <h3 className="sales-card-title">List of Sales</h3>
            <p className="sales-card-desc">View all sales records</p>
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
            <h3 className="sales-card-title">Add New Sale</h3>
            <p className="sales-card-desc">Record a new sale transaction</p>
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
        <h1 className="sales-title">Sales</h1>
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

