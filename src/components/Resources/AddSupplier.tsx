import { useState, useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';
import { generateUniqueCode } from '../../utils/helpers';
import type { Supplier } from '../../types';
import Modal from '../Modal';
import './AddSupplier.css';

interface AddSupplierProps {
  supplierId: string | null;
  onClose: () => void;
  onBack: () => void;
}

type Mode = 'view' | 'edit';

export default function AddSupplier({ supplierId, onClose, onBack }: AddSupplierProps) {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useDataStore();
  const [mode, setMode] = useState<Mode>('edit');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const existingSupplier = supplierId ? suppliers.find((s) => s.id === supplierId) : null;

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    code: '',
    telephone: '',
    active: true,
  });

  useEffect(() => {
    if (existingSupplier) {
      setFormData(existingSupplier);
      setMode('view');
    } else {
      setMode('edit');
    }
  }, [supplierId, existingSupplier]);

  const handleChange = (field: keyof Supplier, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleGenerateCode = () => {
    if (mode !== 'edit') return;
    const existingCodes = suppliers.map((s) => s.code).filter(Boolean);
    const newCode = generateUniqueCode(existingCodes);
    handleChange('code', newCode);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Name is required';
    }

    if (!formData.code || formData.code.trim().length === 0) {
      newErrors.code = 'Code is required';
    } else {
      const existing = suppliers.find((s) => s.code === formData.code && s.id !== supplierId);
      if (existing) {
        newErrors.code = 'Code must be unique';
      }
    }

    if (formData.telephone && !/^[\d\s+\-]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Telephone can only contain digits, +, spaces, or dashes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const supplierData: Supplier = {
      id: existingSupplier?.id || `supplier-${Date.now()}`,
      name: formData.name!,
      code: formData.code!,
      telephone: formData.telephone,
      active: formData.active ?? true,
    };

    if (existingSupplier) {
      updateSupplier(existingSupplier.id, supplierData);
    } else {
      addSupplier(supplierData);
    }

    setMode('view');
    onBack();
  };

  const handleCancel = () => {
    if (existingSupplier) {
      setFormData(existingSupplier);
    } else {
      setFormData({ name: '', code: '', telephone: '', active: true });
    }
    setErrors({});
    setMode('view');
  };

  const handleDelete = () => {
    if (!existingSupplier) return;
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(existingSupplier.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="medium" title={existingSupplier ? 'Supplier Details' : 'Add New Supplier'}>
      <div className="add-supplier">
        <div className="add-supplier-toolbar">
          <button onClick={() => setMode('edit')} disabled={mode === 'edit'}>
            {existingSupplier ? 'Edit' : 'Add New'}
          </button>
          <button onClick={handleSave} disabled={mode === 'view'}>
            Save
          </button>
          <button onClick={handleCancel} disabled={mode === 'view'}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={!existingSupplier || mode === 'edit'} className="danger">
            Delete
          </button>
        </div>

        <div className="add-supplier-form">
          <div className="add-supplier-field">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={mode === 'view'}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="add-supplier-field">
            <label>Code *</label>
            <div className="code-container">
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                disabled={mode === 'view'}
                className={errors.code ? 'error' : ''}
              />
              {mode === 'edit' && (
                <button type="button" onClick={handleGenerateCode}>
                  Generate
                </button>
              )}
            </div>
            {errors.code && <span className="error-text">{errors.code}</span>}
          </div>

          <div className="add-supplier-field">
            <label>Telephone</label>
            <input
              type="text"
              value={formData.telephone || ''}
              onChange={(e) => handleChange('telephone', e.target.value)}
              disabled={mode === 'view'}
              className={errors.telephone ? 'error' : ''}
            />
            {errors.telephone && <span className="error-text">{errors.telephone}</span>}
          </div>

          <div className="add-supplier-field">
            <label>
              <input
                type="checkbox"
                checked={formData.active ?? true}
                onChange={(e) => handleChange('active', e.target.checked)}
                disabled={mode === 'view'}
              />
              Active
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

