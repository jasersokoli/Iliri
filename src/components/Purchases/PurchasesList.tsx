import { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import { format } from 'date-fns';
import Modal from '../Modal';
import PurchaseDetails from './PurchaseDetails';
import './PurchasesList.css';

interface PurchasesListProps {
  onClose: () => void;
}

export default function PurchasesList({ onClose }: PurchasesListProps) {
  const { purchases, suppliers } = useDataStore();
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredPurchases = useMemo(() => {
    let filtered = [...purchases].sort((a, b) => b.date.getTime() - a.date.getTime());

    if (selectedSupplier !== 'All') {
      filtered = filtered.filter((p) => p.supplierId === selectedSupplier);
    }

    if (showOnlyMine) {
      // TODO: Filter by current user
      // filtered = filtered.filter((p) => p.username === currentUser);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.supplierName.toLowerCase().includes(searchLower) ||
          format(p.date, 'dd/MM/yyyy').includes(search)
      );
    }

    return filtered;
  }, [purchases, search, selectedSupplier, showOnlyMine]);

  const supplierOptions = ['All', ...suppliers.filter((s) => s.active).map((s) => s.name)];

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="List of Purchases">
        <div className="purchases-list">
          <div className="purchases-list-header">
            <select
              className="purchases-filter"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              {supplierOptions.map((name) => (
                <option key={name} value={name === 'All' ? 'All' : suppliers.find((s) => s.name === name)?.id || ''}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="purchases-search"
              placeholder="Search by supplier or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="purchases-checkbox">
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
              />
              Only my purchases
            </label>
            <button className="purchases-refresh" onClick={() => window.location.reload()}>
              🔄
            </button>
          </div>

          <div className="purchases-table-container">
            <table className="purchases-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Supplier</th>
                  <th>Username</th>
                  <th>Date</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="purchases-empty">
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className={selectedPurchaseId === purchase.id ? 'selected' : ''}
                      onClick={() => setSelectedPurchaseId(purchase.id)}
                      onDoubleClick={() => {
                        setSelectedPurchaseId(purchase.id);
                        setShowDetails(true);
                      }}
                    >
                      <td>{purchase.number}</td>
                      <td>{purchase.supplierName}</td>
                      <td>{purchase.username}</td>
                      <td>{format(purchase.date, 'dd/MM/yyyy')}</td>
                      <td>${purchase.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {showDetails && selectedPurchaseId && (
        <PurchaseDetails
          purchaseId={selectedPurchaseId}
          onClose={() => {
            setShowDetails(false);
            setSelectedPurchaseId(null);
          }}
        />
      )}
    </>
  );
}

