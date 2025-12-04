import { useState, useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import type { Purchase, PurchaseItem, Article } from '../../types';
import Modal from '../Modal';
import AddArticle from '../Resources/AddArticle';
import AddSupplier from '../Resources/AddSupplier';
import ArticleSearchInput from '../ArticleSearchInput';
import './AddPurchase.css';
import React from 'react';

interface AddPurchaseProps {
  onClose: () => void;
  onBack: () => void;
}

export default function AddPurchase({ onClose, onBack }: AddPurchaseProps) {
  const { articles, suppliers, purchases, addPurchase, updateArticle, refreshAnalytics } = useDataStore();
  const { user } = useAuthStore();
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [purchaseDate] = useState(new Date());
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        articleId: '',
        articleCode: '',
        articleName: '',
        unitCost: 0,
        quantity: 0,
        total: 0,
      },
    ]);
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'unitCost' || field === 'quantity') {
      const unitCost = field === 'unitCost' ? parseFloat(value) || 0 : newItems[index].unitCost;
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
      newItems[index].total = unitCost * quantity;
    }

    setItems(newItems);
  };

  const handleArticleSelectByCode = (index: number, article: Article) => {
    const newItems = [...items];
    newItems[index].articleId = article.id;
    newItems[index].articleCode = article.code1;
    newItems[index].articleName = article.name;
    newItems[index].unitCost = article.cost;
    newItems[index].total = article.cost * newItems[index].quantity;
    setItems(newItems);
  };

  const handleArticleSelectByName = (index: number, article: Article) => {
    const newItems = [...items];
    newItems[index].articleId = article.id;
    newItems[index].articleCode = article.code1;
    newItems[index].articleName = article.name;
    newItems[index].unitCost = article.cost;
    newItems[index].total = article.cost * newItems[index].quantity;
    setItems(newItems);
  };

  const handleArticleCodeChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].articleCode = value;
    // Try to find article by code
    const article = articles.find((a) => a.code1 === value || a.code2 === value);
    if (article) {
      newItems[index].articleId = article.id;
      newItems[index].articleCode = article.code1;
      newItems[index].articleName = article.name;
      newItems[index].unitCost = article.cost;
      newItems[index].total = article.cost * newItems[index].quantity;
    } else {
      // Clear if no match
      if (!value) {
        newItems[index].articleId = '';
        newItems[index].articleName = '';
      }
    }
    setItems(newItems);
  };

  const handleArticleNameChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].articleName = value;
    // Try to find article by name
    const article = articles.find((a) => a.name.toLowerCase() === value.toLowerCase());
    if (article) {
      newItems[index].articleId = article.id;
      newItems[index].articleCode = article.code1;
      newItems[index].articleName = article.name;
      newItems[index].unitCost = article.cost;
      newItems[index].total = article.cost * newItems[index].quantity;
    } else {
      // Clear if no match
      if (!value) {
        newItems[index].articleId = '';
        newItems[index].articleCode = '';
      }
    }
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedSupplier) {
      newErrors.supplier = 'Supplier is required';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    items.forEach((item, index) => {
      if (!item.articleId) {
        newErrors[`item-${index}`] = 'Article must be selected';
      }
      if (item.unitCost <= 0) {
        newErrors[`cost-${index}`] = 'Unit cost must be positive';
      }
      if (item.quantity <= 0) {
        newErrors[`qty-${index}`] = 'Quantity must be positive';
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const total = items.reduce((sum, item) => sum + item.total, 0);
    const purchaseNumber = purchases.length > 0 ? Math.max(...purchases.map((p) => p.number)) + 1 : 1;

    const purchase: Purchase = {
      id: `purchase-${Date.now()}`,
      number: purchaseNumber,
      supplierId: selectedSupplier,
      supplierName: suppliers.find((s) => s.id === selectedSupplier)?.name || '',
      username: user?.name || 'Unknown',
      date: purchaseDate,
      total,
      items: items.map((item) => ({ ...item })),
    };

    addPurchase(purchase);

    // Update article stocks and costs
    items.forEach((item) => {
      const article = articles.find((a) => a.id === item.articleId);
      if (article) {
        updateArticle(item.articleId, {
          currentStock: article.currentStock + item.quantity,
          cost: item.unitCost, // Update cost to the new purchase cost
        });
      }
    });

    refreshAnalytics();
    onClose();
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="Add New Purchase">
        <div className="add-purchase">
          <div className="add-purchase-toolbar">
            <button onClick={() => {
              setSelectedSupplier('');
              setItems([]);
              setErrors({});
            }}>
              Add New
            </button>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
            <div className="add-purchase-supplier">
              <label>Supplier *</label>
              <div className="supplier-select-container">
                <select
                  value={selectedSupplier}
                  onChange={(e) => {
                    setSelectedSupplier(e.target.value);
                    if (errors.supplier) {
                      setErrors((prev) => ({ ...prev, supplier: '' }));
                    }
                  }}
                  className={errors.supplier ? 'error' : ''}
                >
                  <option value="">Select supplier</option>
                  {suppliers.filter((s) => s.active).map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                <button
                    type="button"
                    className="purchase-action-btn"
                    onClick={() => setShowAddSupplier(true)}
                >
                    Add Supplier
                </button>
              </div>
              {errors.supplier && <span className="error-text">{errors.supplier}</span>}
            </div>
            <div className="add-purchase-date">
              <label>Date</label>
              <div>{format(purchaseDate, 'dd/MM/yyyy')}</div>
            </div>
          </div>

          <div className="add-purchase-items">
            <table className="add-purchase-table">
              <thead>
                <tr>
                  <th>Article Name</th>
                  <th>Article Code</th>
                  <th>Unit Cost</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
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
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitCost || ''}
                        onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                      />
                      {errors[`cost-${index}`] && (
                        <span className="error-text">{errors[`cost-${index}`]}</span>
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
            <div className="add-purchase-actions">
              <button onClick={handleAddItem}>Add Article</button>
              <button onClick={() => setShowAddArticle(true)}>Add New Article</button>
            </div>
            {errors.items && <span className="error-text">{errors.items}</span>}
          </div>

          <div className="add-purchase-summary">
            <div className="add-purchase-total">
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

      {showAddSupplier && (
        <AddSupplier
          supplierId={null}
          onClose={() => setShowAddSupplier(false)}
          onBack={() => setShowAddSupplier(false)}
        />
      )}
    </>
  );
}

