import { useState, useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';
import type { Article } from '../../types';
import Modal from '../Modal';
import './AddArticle.css';
import React from 'react';

interface AddArticleProps {
  articleId: string | null;
  onClose: () => void;
  onBack: () => void;
}

type Mode = 'view' | 'edit';

export default function AddArticle({ articleId, onClose, onBack }: AddArticleProps) {
  const { articles, suppliers, addArticle, updateArticle, deleteArticle, addNotification, refreshAnalytics } = useDataStore();
  const [mode, setMode] = useState<Mode>('edit');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const existingArticle = articleId ? articles.find((a) => a.id === articleId) : null;

  const [formData, setFormData] = useState<Partial<Article>>({
    name: '',
    code1: '',
    cost: 0,
    currentStock: 0,
    minimumStock: undefined,
    price1: 0,
    price2: undefined,
    price3: undefined,
    supplierId: '',
    unit: 'pcs',
    active: true,
  });

  useEffect(() => {
    if (existingArticle) {
      setFormData(existingArticle);
      setMode('view');
    } else {
      // Reset all fields when adding new article
      setFormData({
        name: '',
        code1: '',
        cost: 0,
        currentStock: 0,
        minimumStock: undefined,
        price1: 0,
        price2: undefined,
        price3: undefined,
        supplierId: '',
        unit: 'pcs',
        active: true,
      });
      setMode('edit');
      setIsDirty(false);
      setErrors({});
    }
  }, [articleId, existingArticle]);

  const handleChange = (field: keyof Article, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };


  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code1 || formData.code1.trim().length === 0) {
      newErrors.code1 = 'Article Code is required';
    }

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Name is required';
    }

    if (formData.cost < 0) {
      newErrors.cost = 'Cost must be non-negative';
    }

    if (formData.currentStock < 0) {
      newErrors.currentStock = 'Current stock must be non-negative';
    }

    if (formData.price1 < 0) {
      newErrors.price1 = 'Price 1 must be non-negative';
    }

    if (formData.minimumStock !== undefined && formData.minimumStock < 0) {
      newErrors.minimumStock = 'Minimum stock must be non-negative';
    }

    if (formData.minimumStock !== undefined && formData.minimumStock > formData.currentStock!) {
      newErrors.minimumStock = 'Minimum stock cannot exceed current stock';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const articleData: Article = {
      id: existingArticle?.id || `article-${Date.now()}`,
      name: formData.name!,
      code1: formData.code1!,
      cost: formData.cost || 0,
      currentStock: formData.currentStock || 0,
      minimumStock: formData.minimumStock,
      price1: formData.price1 || 0,
      price2: formData.price2,
      price3: formData.price3,
      supplierId: formData.supplierId,
      unit: formData.unit || 'pcs',
      active: formData.active ?? true,
      deleted: false,
    };

    if (existingArticle) {
      updateArticle(existingArticle.id, articleData);
    } else {
      addArticle(articleData);
    }

    // Check for low stock notification
    if (articleData.minimumStock !== undefined && articleData.currentStock <= articleData.minimumStock) {
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'Low Stock',
        description: `Article ${articleData.name} has reached minimum stock level`,
        read: false,
        createdAt: new Date(),
      });
    }

    refreshAnalytics();
    setIsDirty(false);
    setMode('view');
  };

  const handleCancel = () => {
    if (existingArticle) {
      setFormData(existingArticle);
    } else {
      setFormData({
        name: '',
        code1: '',
        cost: 0,
        currentStock: 0,
        minimumStock: undefined,
        price1: 0,
        price2: undefined,
        price3: undefined,
        supplierId: '',
        unit: 'pcs',
        active: true,
      });
    }
    setErrors({});
    setIsDirty(false);
    setMode('view');
  };

  const handleDelete = () => {
    if (!existingArticle) return;
    if (window.confirm('Are you sure you want to delete this article?')) {
      deleteArticle(existingArticle.id);
      refreshAnalytics();
      onClose();
    }
  };

  const handleClose = () => {
    if (isDirty && mode === 'edit') {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const units = ['pcs', 'kg', 'g', 'L', 'mL', 'm', 'cm', 'box', 'pack'];

  return (
    <Modal isOpen={true} onClose={handleClose} size="large" title={existingArticle ? 'Article Details' : 'Shto Artikull te Ri'}>
      <div className="add-article">
        <div className="add-article-toolbar">
          <button
            className="add-article-btn"
            onClick={() => {
              if (existingArticle) {
                // Modify existing article
                setMode('edit');
                setIsDirty(true);
              } else {
                // Reset all fields for new article
                setFormData({
                  name: '',
                  code1: '',
                  cost: 0,
                  currentStock: 0,
                  minimumStock: undefined,
                  price1: 0,
                  price2: undefined,
                  price3: undefined,
                  supplierId: '',
                  unit: 'pcs',
                  active: true,
                });
                setMode('edit');
                setIsDirty(false);
                setErrors({});
              }
            }}
            disabled={mode === 'edit' && !existingArticle}
          >
            {existingArticle ? 'Modify' : 'Add New'}
          </button>
          <button
            className="add-article-btn"
            onClick={handleSave}
            disabled={mode === 'view'}
          >
            Ruaj
          </button>
          <button
            className="add-article-btn"
            onClick={handleCancel}
            disabled={mode === 'view'}
          >
            Anullo
          </button>
          <button
            className="add-article-btn add-article-btn-danger"
            onClick={handleDelete}
            disabled={!existingArticle || mode === 'edit'}
          >
            Fshije
          </button>
        </div>

        <div className="add-article-form">
          <div className="add-article-row">
            <div className="add-article-field">
              <label className="add-article-label">Emri i Artikullit *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={mode === 'view'}
                className={`add-article-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="add-article-error">{errors.name}</span>}
            </div>

            <div className="add-article-field">
              <label className="add-article-label">Kodi i Artikullit *</label>
              <input
                type="text"
                value={formData.code1 || ''}
                onChange={(e) => handleChange('code1', e.target.value)}
                disabled={mode === 'view'}
                className={`add-article-input ${errors.code1 ? 'error' : ''}`}
              />
              {errors.code1 && <span className="add-article-error">{errors.code1}</span>}
            </div>
          </div>

          <div className="add-article-row">
            <div className="add-article-field">
              <label className="add-article-label">Kostoja *</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost || ''}
                onChange={(e) => handleChange('cost', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                disabled={mode === 'view'}
                className={`add-article-input ${errors.cost ? 'error' : ''}`}
              />
              {errors.cost && <span className="add-article-error">{errors.cost}</span>}
            </div>

            <div className="add-article-field">
              <label className="add-article-label">Stoku Aktual *</label>
              <input
                type="number"
                step="0.01"
                value={formData.currentStock || ''}
                onChange={(e) => handleChange('currentStock', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                disabled={mode === 'view'}
                className={`add-article-input ${errors.currentStock ? 'error' : ''}`}
              />
              {errors.currentStock && <span className="add-article-error">{errors.currentStock}</span>}
            </div>

            <div className="add-article-field">
              <label className="add-article-label">Stoku Minimal</label>
              <input
                type="number"
                step="0.01"
                value={formData.minimumStock ?? ''}
                onChange={(e) => handleChange('minimumStock', e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={mode === 'view'}
                className={`add-article-input ${errors.minimumStock ? 'error' : ''}`}
                placeholder="Optional"
              />
              {errors.minimumStock && <span className="add-article-error">{errors.minimumStock}</span>}
            </div>
          </div>

          <div className="add-article-row">
            <div className="add-article-field">
              <label className="add-article-label">Cmimi 1 *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price1 || ''}
                onChange={(e) => handleChange('price1', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                disabled={mode === 'view'}
                className={`add-article-input ${errors.price1 ? 'error' : ''}`}
              />
              {errors.price1 && <span className="add-article-error">{errors.price1}</span>}
            </div>

            <div className="add-article-field">
              <label className="add-article-label">Cmimi 2</label>
              <input
                type="number"
                step="0.01"
                value={formData.price2 ?? ''}
                onChange={(e) => handleChange('price2', e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={mode === 'view'}
                className="add-article-input"
              />
            </div>

            <div className="add-article-field">
              <label className="add-article-label">Cmimi 3</label>
              <input
                type="number"
                step="0.01"
                value={formData.price3 ?? ''}
                onChange={(e) => handleChange('price3', e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={mode === 'view'}
                className="add-article-input"
              />
            </div>
          </div>

          <div className="add-article-row">
            <div className="add-article-field">
              <label className="add-article-label">Furnitori</label>
              <select
                value={formData.supplierId || ''}
                onChange={(e) => handleChange('supplierId', e.target.value || undefined)}
                disabled={mode === 'view'}
                className="add-article-input"
              >
                <option value="">Zgjedh Furnitorin</option>
                {suppliers.filter((s) => s.active).map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="add-article-field">
              <label className="add-article-label">Njesia</label>
              <select
                value={formData.unit || 'pcs'}
                onChange={(e) => handleChange('unit', e.target.value)}
                disabled={mode === 'view'}
                className="add-article-input"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

