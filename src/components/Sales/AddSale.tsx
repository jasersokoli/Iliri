import { useState, useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import type { Sale, SaleItem, Article } from '../../types';
import Modal from '../Modal';
import AddArticle from '../Resources/AddArticle';
import AddClient from '../Resources/AddClient';
import ArticleSearchInput from '../ArticleSearchInput';
import './AddSale.css';
import React from 'react';

interface AddSaleProps {
  onClose: () => void;
  onBack: () => void;
}

export default function AddSale({ onClose, onBack }: AddSaleProps) {
  const { articles, clients, sales, addSale, updateArticle, refreshAnalytics, getLastUsedPrice, updateLastUsedPrice } = useDataStore();
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);

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

  const handleArticleSelectByCode = (index: number, article: Article) => {
    const newItems = [...items];
    const item = newItems[index];
    item.articleId = article.id;
    item.articleCode = article.code1;
    item.articleName = article.name;

    // Check for last used price for this client-article combination
    let priceToUse = article.price1;
    let priceTypeToUse: 'Price 1' | 'Price 2' | 'Price 3' | 'Custom' = 'Price 1';

    if (selectedClient) {
      const lastUsed = getLastUsedPrice(selectedClient, article.id);
      if (lastUsed) {
        priceToUse = lastUsed.lastPrice;
        priceTypeToUse = lastUsed.priceType;
      } else {
        // Use default price 1
        priceToUse = article.price1;
        priceTypeToUse = 'Price 1';
      }
    } else {
      priceToUse = article.price1;
      priceTypeToUse = 'Price 1';
    }

    item.priceType = priceTypeToUse;
    item.unitPrice = priceToUse;
    item.total = priceToUse * item.quantity;
    setItems(newItems);
  };

  const handleArticleSelectByName = (index: number, article: Article) => {
    const newItems = [...items];
    const item = newItems[index];
    item.articleId = article.id;
    item.articleCode = article.code1;
    item.articleName = article.name;

    // Check for last used price for this client-article combination
    let priceToUse = article.price1;
    let priceTypeToUse: 'Price 1' | 'Price 2' | 'Price 3' | 'Custom' = 'Price 1';

    if (selectedClient) {
      const lastUsed = getLastUsedPrice(selectedClient, article.id);
      if (lastUsed) {
        priceToUse = lastUsed.lastPrice;
        priceTypeToUse = lastUsed.priceType;
      } else {
        priceToUse = article.price1;
        priceTypeToUse = 'Price 1';
      }
    } else {
      priceToUse = article.price1;
      priceTypeToUse = 'Price 1';
    }

    item.priceType = priceTypeToUse;
    item.unitPrice = priceToUse;
    item.total = priceToUse * item.quantity;
    setItems(newItems);
  };

  const handleArticleCodeChange = (index: number, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    item.articleCode = value;
    const article = articles.find((a) => a.code1 === value || a.code2 === value);
    if (article) {
      handleArticleSelectByCode(index, article);
    } else {
      if (!value) {
        item.articleId = '';
        item.articleName = '';
      }
    }
    setItems(newItems);
  };

  const handleArticleNameChange = (index: number, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    item.articleName = value;
    const article = articles.find((a) => a.name.toLowerCase() === value.toLowerCase());
    if (article) {
      handleArticleSelectByName(index, article);
    } else {
      if (!value) {
        item.articleId = '';
        item.articleCode = '';
      }
    }
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'priceType') {
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
        // Recalculate total when price type changes
        item.total = item.unitPrice * item.quantity;
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
      // Recalculate total when price changes
      item.total = item.unitPrice * item.quantity;
    } else if (field === 'quantity') {
      item.quantity = parseFloat(value) || 0;
      // Recalculate total when quantity changes
      item.total = item.unitPrice * item.quantity;
    } else {
      item[field] = value;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  // Update prices when client changes
  useEffect(() => {
    if (selectedClient && items.length > 0) {
      const newItems = items.map((item) => {
        if (item.articleId) {
          const lastUsed = getLastUsedPrice(selectedClient, item.articleId);
          if (lastUsed) {
            return {
              ...item,
              priceType: lastUsed.priceType,
              unitPrice: lastUsed.lastPrice,
              total: lastUsed.lastPrice * item.quantity,
            };
          }
        }
        return item;
      });
      setItems(newItems);
    }
  }, [selectedClient]);

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);

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
    if (Object.keys(newErrors).length > 0) {
      setIsSaving(false);
      return;
    }

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

    // DISABLE THE SAVE BUTTON AFTER FIRST SUCCESSFUL SAVE
    setHasSavedOnce(true);
    addSale(sale);

    // Update article stocks
    items.forEach((item) => {
      const article = articles.find((a) => a.id === item.articleId);
      if (article) {
        updateArticle(item.articleId, {
          currentStock: Math.max(0, article.currentStock - item.quantity),
        });
      }
      if (selectedClient) {
        updateLastUsedPrice(selectedClient, item.articleId, item.unitPrice, item.priceType);
      }
    });

    refreshAnalytics();
    
    // Don't close modal or clear fields - user wants to print invoice
    // Just clear errors
    setErrors({});
    setIsSaving(false);
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="Add New Sale">
        <div className="add-sale">
          <div className="add-sale-toolbar">
            <button 
              className="print-hide add-new-btn"
              onClick={() => {
              setSelectedClient('');
              setClientReference('');
              setItems([]);
              setErrors({});
              setNotPaid(false);
              setPaidAmount('');
              setHasSavedOnce(false);
            }}>
              Add New
            </button>
            <button
              className="print-hide save-btn"
              onClick={handleSave}
              disabled={isSaving || hasSavedOnce}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button className="print-hide print-btn" onClick={() => window.print()}>Print</button>
            <button className="print-hide cancel-btn" onClick={onClose}>Cancel</button>
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
                <button
                    type="button"
                    className="purchase-action-btn print-hide"
                    onClick={() => setShowAddClient(true)}
                >
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
            <div className="add-sale-date">
              <label>Time</label>
              <div>{format(saleDate, 'HH:mm:ss')}</div>
            </div>
          </div>

          <div className="add-sale-items">
            <table className="add-sale-table">
              <thead>
                <tr>
                  <th>Article Name</th>
                  <th>Article Code</th>
                  <th id="add-sale-price-type-header">Price Type</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const article = articles.find((a) => a.id === item.articleId);
                  return (
                    <tr key={index}>
                      <td>
                        <ArticleSearchInput
                          articles={articles}
                          value={item.articleName}
                          onChange={(value) => handleArticleNameChange(index, value)}
                          onSelect={(article) => handleArticleSelectByName(index, article)}
                          placeholder="Enter name"
                          searchBy="name"
                        />
                      </td>
                      <td>
                        <ArticleSearchInput
                          articles={articles}
                          value={item.articleCode}
                          onChange={(value) => handleArticleCodeChange(index, value)}
                          onSelect={(article) => handleArticleSelectByCode(index, article)}
                          placeholder="Enter code"
                          searchBy="code"
                        />
                        {errors[`item-${index}`] && (
                          <span className="error-text">{errors[`item-${index}`]}</span>
                        )}
                      </td>
                      <td>
                        <select
                          id={`price-type-${index}`}
                          value={item.priceType}
                          onChange={(e) => handleItemChange(index, 'priceType', e.target.value)}
                          disabled={!item.articleId}
                        >
                          {(() => {
                            if (!article) {
                              return <option value="Price 1">Select article first</option>;
                            }
                            return (
                              <>
                                <option value="Price 1">{article.price1}</option>
                                <option value="Price 2">{article.price2}</option>
                                <option value="Price 3">{article.price3}</option>
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
                          disabled={!item.articleId || item.priceType !== 'Custom'}
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
                      <button className="print-hide remove-btn" onClick={() => handleRemoveItem(index)}>Remove</button>
                    </td>
                  </tr>
                  );
                })}
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

