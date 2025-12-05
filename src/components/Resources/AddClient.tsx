import { useState, useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';
import type { Client } from '../../types';
import Modal from '../Modal';
import './AddClient.css';
import React from 'react';

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
    telephone: '',
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


  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Name is required';
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
      code: `CLI-${Date.now()}`,
      telephone: formData.telephone,
      active: formData.active ?? true,
    };

    if (existingClient) {
      updateClient(existingClient.id, clientData);
      setMode('view');
      onBack();
    } else {
      addClient(clientData);
      // Stay in modal for new client, just reset form
      setFormData({
        name: '',
        telephone: '',
        active: true,
      });
      setMode('edit');
      setErrors({});
    }
  };

  const handleCancel = () => {
    if (existingClient) {
      setFormData(existingClient);
    } else {
      setFormData({ name: '', telephone: '', active: true });
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
    <Modal isOpen={true} onClose={onClose} size="medium" title={existingClient ? 'Client Details' : 'Shto Klient te ri'}>
      <div className="add-client">
        <div className="add-client-toolbar">
          <button onClick={() => setMode('edit')} disabled={mode === 'edit'}>
            {existingClient ? 'Edit' : 'Shto te Ri'}
          </button>
          <button onClick={handleSave} disabled={mode === 'view'}>
            Ruaj
          </button>
          <button onClick={handleCancel} disabled={mode === 'view'}>
            Anullo
          </button>
          <button onClick={handleDelete} disabled={!existingClient || mode === 'edit'} className="danger">
            Fshij
          </button>
        </div>

        <div className="add-client-form">
          <div className="add-client-field">
            <label>Emri *</label>
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
            <label>Telefoni</label>
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
            <label>
              <input
                type="checkbox"
                checked={formData.active ?? true}
                onChange={(e) => handleChange('active', e.target.checked)}
                disabled={mode === 'view'}
              />
              Aktive
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

