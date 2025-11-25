import { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { format } from 'date-fns';
import Modal from '../Modal';
import SaleDetails from './SaleDetails';
import './SalesList.css';

interface SalesListProps {
  onClose: () => void;
}

export default function SalesList({ onClose }: SalesListProps) {
  const { sales, clients, updateSale, refreshAnalytics } = useDataStore();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
          format(s.date, 'dd/MM/yyyy').includes(search)
      );
    }

    return filtered;
  }, [sales, search, selectedClient, showOnlyMine]);

  const handleTogglePaid = async (saleId: string, paid: boolean) => {
    updateSale(saleId, { paid });
    refreshAnalytics();
  };

  const clientOptions = ['All', ...clients.filter((c) => c.active).map((c) => c.name)];

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="List of Sales">
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
              placeholder="Search by customer, reference, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="sales-checkbox">
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
              />
              Only my sales
            </label>
            <button className="sales-refresh" onClick={() => refreshAnalytics()}>
              🔄
            </button>
            <button
              className="sales-print-btn"
              onClick={() => window.print()}
            >
              🖨️ Print
            </button>
          </div>

          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Reference</th>
                  <th>Username</th>
                  <th>Date</th>
                  <th>Price Type</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="sales-empty">
                      No sales found
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className={`${selectedSaleId === sale.id ? 'selected' : ''} ${!sale.paid ? 'unpaid' : ''}`}
                      onClick={() => setSelectedSaleId(sale.id)}
                      onDoubleClick={() => {
                        setSelectedSaleId(sale.id);
                        setShowDetails(true);
                      }}
                    >
                      <td>{sale.number}</td>
                      <td>{sale.clientName}</td>
                      <td>{sale.clientReference || '-'}</td>
                      <td>{sale.username}</td>
                      <td>{format(sale.date, 'dd/MM/yyyy')}</td>
                      <td>{sale.priceType}</td>
                      <td>${sale.unitPrice.toFixed(2)}</td>
                      <td>${sale.total.toFixed(2)}</td>
                      <td>
                        {sale.paid ? (
                          <span>✓ Paid</span>
                        ) : (
                          <span>
                            {sale.paidAmount ? `$${sale.paidAmount.toFixed(2)} / $${sale.total.toFixed(2)}` : 'Unpaid'}
                          </span>
                        )}
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

