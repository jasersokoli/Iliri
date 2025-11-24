import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import type { Sale, SaleItem } from '../../types';
import Modal from '../Modal';
import AddArticle from '../Resources/AddArticle';
import AddClient from '../Resources/AddClient';
import './AddSale.css';

interface AddSaleProps {
  onClose: () => void;
  onBack: () => void;
}

export default function AddSale({ onClose, onBack }: AddSaleProps) {
  const { articles, clients, sales, addSale, updateArticle, refreshAnalytics } = useDataStore();
  const { user } = useAuthStore();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [clientReference, setClientReference] = useState<string>('');
  const [saleDate] = useState(new Date());
  const [items, setItems] = useState<SaleItem[]>([]);
  const [notPaid, setNotPaid] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        articleId: '',
        articleCode: '',
        articleName: '',
        priceType: 'Price 1',
        unitPrice: 0,
        quantity: 0,
        total: 0,
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'articleCode' || field === 'articleName') {
      const article = articles.find(
        (a) => a.code1 === value || a.name.toLowerCase() === value.toLowerCase()
      );
      if (article) {
        item.articleId = article.id;
        item.articleCode = article.code1;
        item.articleName = article.name;
        item.priceType = 'Price 1';
        item.unitPrice = article.price1;
      }
    } else if (field === 'priceType') {
      const article = articles.find((a) => a.id === item.articleId);
      if (article) {
        item.priceType = value;
        if (value === 'Price 1') {
          item.unitPrice = article.price1;
        } else if (value === 'Price 2') {
          item.unitPrice = article.price2 || article.price1;
        } else if (value === 'Price 3') {
          item.unitPrice = article.price3 || article.price1;
        } else {
          // Custom price - keep current unitPrice or use price1 as default
          item.priceType = 'Custom';
          if (!item.unitPrice || item.unitPrice === 0) {
            item.unitPrice = article.price1;
          }
        }
      }
    } else if (field === 'unitPrice') {
      const price = parseFloat(value) || 0;
      item.unitPrice = price;
      const article = articles.find((a) => a.id === item.articleId);
      if (article) {
        // If price matches one of the standard prices, update priceType accordingly
        if (price === article.price1) {
          item.priceType = 'Price 1';
        } else if (price === article.price2) {
          item.priceType = 'Price 2';
        } else if (price === article.price3) {
          item.priceType = 'Price 3';
        } else {
          item.priceType = 'Custom';
        }
      }
    } else {
      item[field] = value;
    }

    if (field === 'unitPrice' || field === 'quantity') {
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      item.total = unitPrice * quantity;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedClient) {
      newErrors.client = 'Customer is required';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    items.forEach((item, index) => {
      if (!item.articleId) {
        newErrors[`item-${index}`] = 'Article must be selected';
      }
      if (item.unitPrice <= 0) {
        newErrors[`price-${index}`] = 'Unit price must be positive';
      }
      if (item.quantity <= 0) {
        newErrors[`qty-${index}`] = 'Quantity must be positive';
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const total = items.reduce((sum, item) => sum + item.total, 0);
    const saleNumber = sales.length > 0 ? Math.max(...sales.map((s) => s.number)) + 1 : 1;

    // Determine price type and unit price from items (use first item's values)
    const priceType = items[0]?.priceType || 'Price 1';
    const unitPrice = items[0]?.unitPrice || 0;

    const paidAmt = typeof paidAmount === 'number' ? paidAmount : (paidAmount === '' ? 0 : parseFloat(String(paidAmount)) || 0);
    const isFullyPaid = !notPaid && (paidAmt >= total || paidAmt === 0);
    
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      number: saleNumber,
      clientId: selectedClient,
      clientName: clients.find((c) => c.id === selectedClient)?.name || '',
      clientReference: clientReference || undefined,
      username: user?.name || 'Unknown',
      date: saleDate,
      priceType,
      unitPrice,
      total,
      paid: isFullyPaid,
      paidAmount: paidAmt > 0 ? paidAmt : undefined,
      items: items.map((item) => ({ ...item })),
    };

    addSale(sale);

    // Update article stocks
    items.forEach((item) => {
      const article = articles.find((a) => a.id === item.articleId);
      if (article) {
        updateArticle(item.articleId, {
          currentStock: Math.max(0, article.currentStock - item.quantity),
        });
      }
    });

    refreshAnalytics();
    onClose();
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="Add New Sale">
        <div className="add-sale">
          <div className="add-sale-toolbar">
            <button onClick={() => {
              setSelectedClient('');
              setClientReference('');
              setItems([]);
              setErrors({});
              setNotPaid(false);
              setPaidAmount('');
            }}>
              Add New
            </button>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
            <div className="add-sale-client">
              <label>Customer *</label>
              <div className="client-select-container">
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    if (errors.client) {
                      setErrors((prev) => ({ ...prev, client: '' }));
                    }
                  }}
                  className={errors.client ? 'error' : ''}
                >
                  <option value="">Select customer</option>
                  {clients.filter((c) => c.active).map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowAddClient(true)}>
                  Add Customer
                </button>
              </div>
              {errors.client && <span className="error-text">{errors.client}</span>}
            </div>
            <div className="add-sale-reference">
              <label>Client Reference</label>
              <input
                type="text"
                value={clientReference}
                onChange={(e) => setClientReference(e.target.value)}
                placeholder="e.g., Jaser's house"
              />
            </div>
            <div className="add-sale-date">
              <label>Date</label>
              <div>{format(saleDate, 'dd/MM/yyyy')}</div>
            </div>
          </div>

          <div className="add-sale-items">
            <table className="add-sale-table">
              <thead>
                <tr>
                  <th>Article Code</th>
                  <th>Article Name</th>
                  <th>Price Type</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.articleCode}
                        onChange={(e) => handleItemChange(index, 'articleCode', e.target.value)}
                        placeholder="Code or name"
                      />
                      {errors[`item-${index}`] && (
                        <span className="error-text">{errors[`item-${index}`]}</span>
                      )}
                    </td>
                    <td>{item.articleName || '-'}</td>
                    <td>
                      <select
                        value={item.priceType}
                        onChange={(e) => handleItemChange(index, 'priceType', e.target.value)}
                      >
                        {(() => {
                          const article = articles.find((a) => a.id === item.articleId);
                          if (!article) return null;
                          return (
                            <>
                              <option value="Price 1">Price 1 ({article.price1})</option>
                              {article.price2 && <option value="Price 2">Price 2 ({article.price2})</option>}
                              {article.price3 && <option value="Price 3">Price 3 ({article.price3})</option>}
                              <option value="Custom">Custom</option>
                            </>
                          );
                        })()}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        disabled={item.articleId !== '' && item.priceType !== 'Custom'}
                      />
                      {errors[`price-${index}`] && (
                        <span className="error-text">{errors[`price-${index}`]}</span>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      />
                      {errors[`qty-${index}`] && (
                        <span className="error-text">{errors[`qty-${index}`]}</span>
                      )}
                    </td>
                    <td>{item.total.toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleRemoveItem(index)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="add-sale-actions">
              <button onClick={handleAddItem}>Add Article</button>
              <button onClick={() => setShowAddArticle(true)}>Add New Article</button>
            </div>
            {errors.items && <span className="error-text">{errors.items}</span>}
          </div>

          <div className="add-sale-payment">
            <label>
              <input
                type="checkbox"
                checked={notPaid}
                onChange={(e) => {
                  setNotPaid(e.target.checked);
                  if (!e.target.checked) {
                    setPaidAmount('');
                  }
                }}
              />
              Not Paid
            </label>
            {!notPaid && (
              <div className="add-sale-paid-amount">
                <label>Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  value={paidAmount}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                    setPaidAmount(value);
                  }}
                  placeholder="0.00"
                  max={grandTotal}
                />
                <span className="add-sale-remaining">
                  Remaining: {(grandTotal - (typeof paidAmount === 'number' ? paidAmount : (paidAmount === '' ? 0 : parseFloat(String(paidAmount)) || 0))).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="add-sale-summary">
            <div className="add-sale-total">
              <strong>Grand Total: {grandTotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </Modal>

      {showAddArticle && (
        <AddArticle
          articleId={null}
          onClose={() => setShowAddArticle(false)}
          onBack={() => setShowAddArticle(false)}
        />
      )}

      {showAddClient && (
        <AddClient
          clientId={null}
          onClose={() => setShowAddClient(false)}
          onBack={() => setShowAddClient(false)}
        />
      )}
    </>
  );
}

