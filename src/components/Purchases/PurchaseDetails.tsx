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
    <Modal isOpen={true} onClose={onClose} size="medium" title="Detajet e blerjes">
      <div className="purchase-details">
        <div className="purchase-details-header">
          <button
              className="purchase-details-print-btn"
              onClick={() => window.print()}
          >
              🖨️ Printo
          </button>
          <div className="purchase-details-info">
            <div><strong>Furnitori:</strong> {purchase.supplierName}</div>
            <div><strong>Data:</strong> {format(purchase.date, 'dd/MM/yyyy')}</div>
            <div><strong>Krijuar nga:</strong> {purchase.username}</div>
            <div><strong>Totali:</strong> {purchase.total.toFixed(2)}</div>
          </div>
        </div>

        <div className="purchase-details-table-container">
          <table className="purchase-details-table">
            <thead>
              <tr>
                <th>Kodi Artikullit</th>
                <th>Emri i Artikullit</th>
                <th>Kostoja e njesis</th>
                <th>Sasia</th>
                <th>Totali</th>
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

