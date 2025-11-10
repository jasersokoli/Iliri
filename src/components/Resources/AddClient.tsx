import { useState, useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';
import { generateUniqueCode } from '../../utils/helpers';
import type { Client } from '../../types';
import Modal from '../Modal';
import './AddClient.css';

interface AddClientProps {
  clientId: string | null;
  onClose: () => void;
  onBack: () => void;
}

type Mode = 'view' | 'edit';

export default function AddClient({ clientId, onClose, onBack }: AddClientProps) {
  const { clients, addClient, updateClient, deleteClient } = useDataStore();
  const [mode, setMode] = useState<Mode>('edit');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const existingClient = clientId ? clients.find((c) => c.id === clientId) : null;

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    code: '',
    telephone: '',
    email: '',
    address: '',
    active: true,
  });

  useEffect(() => {
    if (existingClient) {
      setFormData(existingClient);
      setMode('view');
    } else {
      setMode('edit');
    }
  }, [clientId, existingClient]);

  const handleChange = (field: keyof Client, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleGenerateCode = () => {
    if (mode !== 'edit') return;
    if (!formData.code) {
      const existingCodes = clients.map((c) => c.code).filter(Boolean);
      const newCode = generateUniqueCode(existingCodes);
      handleChange('code', newCode);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && !existingClient && !formData.code) {
      handleGenerateCode();
    }
  }, [mode, existingClient]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Name is required';
    }

    if (!formData.code || formData.code.trim().length === 0) {
      newErrors.code = 'Code is required';
    } else {
      const existing = clients.find((c) => c.code === formData.code && c.id !== clientId);
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

    const clientData: Client = {
      id: existingClient?.id || `client-${Date.now()}`,
      name: formData.name!,
      code: formData.code!,
      telephone: formData.telephone,
      email: formData.email,
      address: formData.address,
      active: formData.active ?? true,
    };

    if (existingClient) {
      updateClient(existingClient.id, clientData);
    } else {
      addClient(clientData);
    }

    setMode('view');
    onBack();
  };

  const handleCancel = () => {
    if (existingClient) {
      setFormData(existingClient);
    } else {
      setFormData({ name: '', code: '', telephone: '', email: '', address: '', active: true });
    }
    setErrors({});
    setMode('view');
  };

  const handleDelete = () => {
    if (!existingClient) return;
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient(existingClient.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="medium" title={existingClient ? 'Client Details' : 'Add New Client'}>
      <div className="add-client">
        <div className="add-client-toolbar">
          <button onClick={() => setMode('edit')} disabled={mode === 'edit'}>
            {existingClient ? 'Edit' : 'Add New'}
          </button>
          <button onClick={handleSave} disabled={mode === 'view'}>
            Save
          </button>
          <button onClick={handleCancel} disabled={mode === 'view'}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={!existingClient || mode === 'edit'} className="danger">
            Delete
          </button>
        </div>

        <div className="add-client-form">
          <div className="add-client-field">
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

          <div className="add-client-field">
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

          <div className="add-client-field">
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

          <div className="add-client-field">
            <label>Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={mode === 'view'}
            />
          </div>

          <div className="add-client-field">
            <label>Address</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={mode === 'view'}
              rows={3}
            />
          </div>

          <div className="add-client-field">
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

