import { useState, useMemo, useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';
import { format } from 'date-fns';
import Modal from '../Modal';
import SaleDetails from './SaleDetails';
import './SalesList.css';
import React from 'react';

interface SalesListProps {
  onClose: () => void;
}

export default function SalesList({ onClose }: SalesListProps) {
  const { sales, clients, updateSale, refreshAnalytics, deleteSale, getPaymentsBySaleId } = useDataStore();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());

  // Auto-refresh when modal opens
  useEffect(() => {
    refreshAnalytics();
  }, []);

  const filteredSales = useMemo(() => {
    let filtered = [...sales].sort((a, b) => b.date.getTime() - a.date.getTime());

    if (selectedClient !== 'All') {
      filtered = filtered.filter((s) => s.clientId === selectedClient);
    }

    if (showOnlyMine) {
      // TODO: Filter by current user
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.clientName.toLowerCase().includes(searchLower) ||
          (s.clientReference && s.clientReference.toLowerCase().includes(searchLower)) ||
          format(s.date, 'dd/MM/yyyy').includes(search) ||
          String(s.number).includes(searchLower)
      );
    }

    return filtered;
  }, [sales, search, selectedClient, showOnlyMine]);

  const handleTogglePaid = async (saleId: string, paid: boolean) => {
    updateSale(saleId, { paid });
    refreshAnalytics();
  };

  const clientOptions = ['Te gjithe', ...clients.filter((c) => c.active).map((c) => c.name)];

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="Lista e Shitjeve">
        <div className="sales-list">
          <div className="sales-list-header">
            <select
              className="sales-filter"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {clientOptions.map((name) => (
                <option key={name} value={name === 'All' ? 'All' : clients.find((c) => c.name === name)?.id || ''}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="sales-search"
              placeholder="Kerko permes klientit, references ose dates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="sales-checkbox">
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
              />
              Vetem Shitjet e mija
            </label>
            {selectedSales.size > 0 && (
              <button
                className="sales-delete-selected"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedSales.size} sale(s)?`)) {
                    selectedSales.forEach((id) => deleteSale(id));
                    setSelectedSales(new Set());
                    refreshAnalytics();
                  }
                }}
              >
                Fshij te Perzgjedhurat ({selectedSales.size})
              </button>
            )}
            <button
              className="sales-print-btn"
              onClick={() => window.print()}
            >
              🖨️ Printo
            </button>
          </div>

          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedSales.size === filteredSales.length && filteredSales.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSales(new Set(filteredSales.map((s) => s.id)));
                        } else {
                          setSelectedSales(new Set());
                        }
                      }}
                    />
                  </th>
                  <th>Numri i fatures</th>
                  <th>Klienti</th>
                  <th>Referenca</th>
                  <th>Emri i Perdoruesit</th>
                  <th>Data</th>
                  <th>Ora</th>
                  <th>Cmimi i njesise</th>
                  <th>Totali</th>
                  <th>Paguar</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="sales-empty">
                      Nuk u gjeten Shitje
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className={`${selectedSaleId === sale.id ? 'selected' : ''} ${!sale.paid ? 'Papaguar' : ''}`}
                      onClick={() => setSelectedSaleId(sale.id)}
                      onDoubleClick={() => {
                        setSelectedSaleId(sale.id);
                        setShowDetails(true);
                      }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedSales.has(sale.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedSales);
                            if (e.target.checked) {
                              newSelected.add(sale.id);
                            } else {
                              newSelected.delete(sale.id);
                            }
                            setSelectedSales(newSelected);
                          }}
                        />
                      </td>
                      <td>{sale.number}</td>
                      <td>{sale.clientName}</td>
                      <td>{sale.clientReference || '-'}</td>
                      <td>{sale.username}</td>
                      <td>{format(sale.date, 'dd/MM/yyyy')}</td>
                      <td>{format(sale.date, 'HH:mm:ss')}</td>
                      <td>{sale.unitPrice.toFixed(2)}</td>
                      <td>{sale.total.toFixed(2)}</td>
                      <td>
                        {(() => {
                          const payments = getPaymentsBySaleId(sale.id);
                          const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                          // Use the most up-to-date paid amount from the sale object (updated by addPayment)
                          const displayPaid = sale.paidAmount !== undefined ? sale.paidAmount : totalPaid;
                          const isFullyPaid = sale.paid || (displayPaid >= sale.total);
                          
                          return isFullyPaid ? (
                            <span>✓ Paguar</span>
                          ) : (
                            <span>
                              {displayPaid > 0 ? `${displayPaid.toFixed(2)} / ${sale.total.toFixed(2)}` : 'Papaguar'}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {showDetails && selectedSaleId && (
        <SaleDetails
          saleId={selectedSaleId}
          onClose={() => {
            setShowDetails(false);
            setSelectedSaleId(null);
          }}
        />
      )}
    </>
  );
}

