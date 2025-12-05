import { useState } from 'react';
import PurchasesList from '../components/Purchases/PurchasesList';
import AddPurchase from '../components/Purchases/AddPurchase';
import './Purchases.css';
import React from 'react';

type PurchaseView = 'menu' | 'list' | 'add';

export default function Purchases() {
  const [currentView, setCurrentView] = useState<PurchaseView>('menu');


  if (currentView === 'menu') {
    return (
      <div className="purchases">
        <div className="purchases-header">
          <h1 className="purchases-title">Blerjet</h1>
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
            <h3 className="purchases-card-title">Lista e Blerjeve</h3>
            <p className="purchases-card-desc">Shiko te gjitha te dhenat e Blerjeve</p>
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
            <h3 className="purchases-card-title">Shto Blerje te reja</h3>
            <p className="purchases-card-desc">Rregjitro nje Blerje te re</p>
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
        <h1 className="purchases-title">Blerjet</h1>
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

