import { useState } from 'react';
import Modal from '../components/Modal';
import ArticlesList from '../components/Resources/ArticlesList';
import AddArticle from '../components/Resources/AddArticle';
import SuppliersList from '../components/Resources/SuppliersList';
import AddSupplier from '../components/Resources/AddSupplier';
import ClientsList from '../components/Resources/ClientsList';
import AddClient from '../components/Resources/AddClient';
import './Resources.css';

type ResourceView = 'menu' | 'articles-list' | 'add-article' | 'suppliers-list' | 'add-supplier' | 'clients-list' | 'add-client';

export default function Resources() {
  const [currentView, setCurrentView] = useState<ResourceView>('menu');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  if (currentView === 'menu') {
    return (
      <div className="resources">
        <div className="resources-header">
          <h1 className="resources-title">Resources</h1>
          <button className="resources-print-btn" onClick={handlePrint}>
            🖨️ Print
          </button>
        </div>
        <div className="resources-grid">
          <div
            className="resources-card"
            onClick={() => setCurrentView('articles-list')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('articles-list');
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="resources-card-icon">📦</div>
            <h3 className="resources-card-title">List Articles</h3>
            <p className="resources-card-desc">View and manage all articles in stock</p>
          </div>
          <div
            className="resources-card"
            onClick={() => setCurrentView('add-article')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('add-article');
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="resources-card-icon">➕</div>
            <h3 className="resources-card-title">Add New Article</h3>
            <p className="resources-card-desc">Create a new article record</p>
          </div>
          <div
            className="resources-card"
            onClick={() => setCurrentView('suppliers-list')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('suppliers-list');
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="resources-card-icon">🏢</div>
            <h3 className="resources-card-title">List Suppliers</h3>
            <p className="resources-card-desc">View and manage all suppliers</p>
          </div>
          <div
            className="resources-card"
            onClick={() => setCurrentView('add-supplier')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('add-supplier');
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="resources-card-icon">➕</div>
            <h3 className="resources-card-title">Add New Supplier</h3>
            <p className="resources-card-desc">Create a new supplier record</p>
          </div>
          <div
            className="resources-card"
            onClick={() => setCurrentView('clients-list')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('clients-list');
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="resources-card-icon">👥</div>
            <h3 className="resources-card-title">List Clients</h3>
            <p className="resources-card-desc">View and manage all clients</p>
          </div>
          <div
            className="resources-card"
            onClick={() => setCurrentView('add-client')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('add-client');
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="resources-card-icon">➕</div>
            <h3 className="resources-card-title">Add New Client</h3>
            <p className="resources-card-desc">Create a new client record</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resources">
      <div className="resources-header">
        <button
          className="resources-back-btn"
          onClick={() => setCurrentView('menu')}
        >
          ← Back
        </button>
        <h1 className="resources-title">Resources</h1>
        <button className="resources-print-btn" onClick={handlePrint}>
          🖨️ Print
        </button>
      </div>

      {currentView === 'articles-list' && (
        <ArticlesList
          onClose={() => setCurrentView('menu')}
          onSelectArticle={(id) => {
            setSelectedArticleId(id);
            setCurrentView('add-article');
          }}
        />
      )}

      {currentView === 'add-article' && (
        <AddArticle
          articleId={selectedArticleId}
          onClose={() => {
            setSelectedArticleId(null);
            setCurrentView('menu');
          }}
          onBack={() => {
            setSelectedArticleId(null);
            setCurrentView('articles-list');
          }}
        />
      )}

      {currentView === 'suppliers-list' && (
        <SuppliersList
          onClose={() => setCurrentView('menu')}
          onSelectSupplier={(id) => {
            setSelectedSupplierId(id);
            setCurrentView('add-supplier');
          }}
        />
      )}

      {currentView === 'add-supplier' && (
        <AddSupplier
          supplierId={selectedSupplierId}
          onClose={() => {
            setSelectedSupplierId(null);
            setCurrentView('menu');
          }}
          onBack={() => {
            setSelectedSupplierId(null);
            setCurrentView('suppliers-list');
          }}
        />
      )}

      {currentView === 'clients-list' && (
        <ClientsList
          onClose={() => setCurrentView('menu')}
          onSelectClient={(id) => {
            setSelectedClientId(id);
            setCurrentView('add-client');
          }}
        />
      )}

      {currentView === 'add-client' && (
        <AddClient
          clientId={selectedClientId}
          onClose={() => {
            setSelectedClientId(null);
            setCurrentView('menu');
          }}
          onBack={() => {
            setSelectedClientId(null);
            setCurrentView('clients-list');
          }}
        />
      )}
    </div>
  );
}

