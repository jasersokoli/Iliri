import { useState } from 'react';
import PurchasesList from '../components/Purchases/PurchasesList';
import AddPurchase from '../components/Purchases/AddPurchase';
import './Purchases.css';

type PurchaseView = 'menu' | 'list' | 'add';

export default function Purchases() {
  const [currentView, setCurrentView] = useState<PurchaseView>('menu');

  const handlePrint = () => {
    window.print();
  };

  if (currentView === 'menu') {
    return (
      <div className="purchases">
        <div className="purchases-header">
          <h1 className="purchases-title">Purchases</h1>
          <button className="purchases-print-btn" onClick={handlePrint}>
            🖨️ Print
          </button>
        </div>
        <div className="purchases-grid">
          <div
            className="purchases-card"
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
            <div className="purchases-card-icon">📋</div>
            <h3 className="purchases-card-title">List of Purchases</h3>
            <p className="purchases-card-desc">View all purchase records</p>
          </div>
          <div
            className="purchases-card"
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
            <div className="purchases-card-icon">➕</div>
            <h3 className="purchases-card-title">Add New Purchase</h3>
            <p className="purchases-card-desc">Register a new purchase</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="purchases">
      <div className="purchases-header">
        <button
          className="purchases-back-btn"
          onClick={() => setCurrentView('menu')}
        >
          ← Back
        </button>
        <h1 className="purchases-title">Purchases</h1>
        <button className="purchases-print-btn" onClick={handlePrint}>
          🖨️ Print
        </button>
      </div>

      {currentView === 'list' && (
        <PurchasesList
          onClose={() => setCurrentView('menu')}
        />
      )}

      {currentView === 'add' && (
        <AddPurchase
          onClose={() => setCurrentView('menu')}
          onBack={() => setCurrentView('list')}
        />
      )}
    </div>
  );
}

