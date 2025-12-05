import { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import Modal from '../Modal';
import AddClient from './AddClient';
import './ClientsList.css';
import React from 'react';

interface ClientsListProps {
  onClose: () => void;
  onSelectClient: (id: string) => void;
}

export default function ClientsList({ onClose, onSelectClient }: ClientsListProps) {
  const { clients, sales } = useDataStore();
  const [search, setSearch] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const clientsWithUnpaid = useMemo(() => {
    const unpaidSales = sales.filter((s) => !s.paid);
    return new Set(unpaidSales.map((s) => s.clientId));
  }, [sales]);

  const filteredClients = useMemo(() => {
    let filtered = clients;

    if (selectedClientName !== 'All') {
      filtered = filtered.filter((c) => c.name === selectedClientName);
    }

    if (showUnpaid) {
      filtered = filtered.filter((c) => clientsWithUnpaid.has(c.id));
    }

    if (!showActive) {
      filtered = filtered.filter((c) => !c.active);
    } else {
      filtered = filtered.filter((c) => c.active);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          (c.code && c.code.toLowerCase().includes(searchLower)) ||
          (c.telephone && c.telephone.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [clients, search, showActive, showUnpaid, selectedClientName, clientsWithUnpaid]);

  const clientNames = ['All', ...Array.from(new Set(clients.map((c) => c.name)))];

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="List e Klientave">
        <div className="clients-list">
          <div className="clients-list-header">
            <select
              className="clients-dropdown"
              value={selectedClientName}
              onChange={(e) => setSelectedClientName(e.target.value)}
            >
              {clientNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <label className="clients-checkbox">
              <input
                type="checkbox"
                checked={showActive}
                onChange={(e) => setShowActive(e.target.checked)}
              />
              Aktive
            </label>
            <button
              className={`clients-filter-btn ${showUnpaid ? 'active' : ''}`}
              onClick={() => setShowUnpaid(!showUnpaid)}
            >
              Shfaq Klientat e Papaguar
            </button>
            <input
              type="text"
              className="clients-search"
              placeholder="Kerko permes emrit, kodit ose telefonit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="clients-add-btn" onClick={() => setShowAddModal(true)}>
              Shto nje Klient te ri
            </button>
            <button
              className="clients-print-btn"
              onClick={() => window.print()}
            >
              🖨️ Printo
            </button>
          </div>

          <div className="clients-table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Emri</th>
                  <th>Telefoni</th>
                  <th>Aktive</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="clients-empty">
                      Nuk ka Kliente
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className={`${selectedClient === client.id ? 'selected' : ''} ${clientsWithUnpaid.has(client.id) ? 'unpaid' : ''}`}
                      onClick={() => setSelectedClient(client.id)}
                      onDoubleClick={() => {
                        setSelectedClient(client.id);
                        onSelectClient(client.id);
                      }}
                    >
                      <td>{client.name}</td>
                      <td>{client.telephone || '-'}</td>
                      <td>{client.active ? '✓' : '✗'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {showAddModal && (
        <AddClient
          clientId={null}
          onClose={() => setShowAddModal(false)}
          onBack={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

