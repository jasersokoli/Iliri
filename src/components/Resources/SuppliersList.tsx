import { useState, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import Modal from '../Modal';
import AddSupplier from './AddSupplier';
import './SuppliersList.css';

interface SuppliersListProps {
  onClose: () => void;
  onSelectSupplier: (id: string) => void;
}

export default function SuppliersList({ onClose, onSelectSupplier }: SuppliersListProps) {
  const { suppliers } = useDataStore();
  const [search, setSearch] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedSupplierName, setSelectedSupplierName] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers;

    if (selectedSupplierName !== 'All') {
      filtered = filtered.filter((s) => s.name === selectedSupplierName);
    }

    if (!showActive) {
      filtered = filtered.filter((s) => !s.active);
    } else {
      filtered = filtered.filter((s) => s.active);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          (s.code && s.code.toLowerCase().includes(searchLower)) ||
          (s.telephone && s.telephone.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [suppliers, search, showActive, selectedSupplierName]);

  const supplierNames = ['All', ...Array.from(new Set(suppliers.map((s) => s.name)))];

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="List of Suppliers">
        <div className="suppliers-list">
          <div className="suppliers-list-header">
            <select
              className="suppliers-dropdown"
              value={selectedSupplierName}
              onChange={(e) => setSelectedSupplierName(e.target.value)}
            >
              {supplierNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <label className="suppliers-checkbox">
              <input
                type="checkbox"
                checked={showActive}
                onChange={(e) => setShowActive(e.target.checked)}
              />
              Active
            </label>
            <input
              type="text"
              className="suppliers-search"
              placeholder="Search by name, code, or telephone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="suppliers-add-btn" onClick={() => setShowAddModal(true)}>
              Add New Supplier
            </button>
            <button
              className="suppliers-print-btn"
              onClick={() => window.print()}
            >
              🖨️ Print
            </button>
          </div>

          <div className="suppliers-table-container">
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Telephone</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="suppliers-empty">
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className={selectedSupplier === supplier.id ? 'selected' : ''}
                      onClick={() => setSelectedSupplier(supplier.id)}
                      onDoubleClick={() => {
                        setSelectedSupplier(supplier.id);
                        onSelectSupplier(supplier.id);
                      }}
                    >
                      <td>{supplier.name}</td>
                      <td>{supplier.telephone || '-'}</td>
                      <td>{supplier.active ? '✓' : '✗'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {showAddModal && (
        <AddSupplier
          supplierId={null}
          onClose={() => setShowAddModal(false)}
          onBack={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

