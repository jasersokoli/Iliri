import { useDataStore } from '../../store/dataStore';
import { format } from 'date-fns';
import Modal from '../Modal';
import './PurchaseDetails.css';
import React from 'react';

interface PurchaseDetailsProps {
  purchaseId: string;
  onClose: () => void;
}

export default function PurchaseDetails({ purchaseId, onClose }: PurchaseDetailsProps) {
  const { purchases } = useDataStore();
  const purchase = purchases.find((p) => p.id === purchaseId);

  if (!purchase) {
    return null;
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="medium" title="Purchase Details">
      <div className="purchase-details">
        <div className="purchase-details-header">
          <div className="purchase-details-info">
            <div><strong>Supplier:</strong> {purchase.supplierName}</div>
            <div><strong>Date:</strong> {format(purchase.date, 'dd/MM/yyyy')}</div>
            <div><strong>Created by:</strong> {purchase.username}</div>
            <div><strong>Total:</strong> {purchase.total.toFixed(2)}</div>
          </div>
        </div>

        <div className="purchase-details-table-container">
          <table className="purchase-details-table">
            <thead>
              <tr>
                <th>Article Code</th>
                <th>Article Name</th>
                <th>Unit Cost</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.articleCode}</td>
                  <td>{item.articleName}</td>
                  <td>{item.unitCost.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

