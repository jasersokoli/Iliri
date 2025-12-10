import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { format } from 'date-fns';
import Modal from '../Modal';
import './SaleDetails.css';
import React from 'react';

interface SaleDetailsProps {
  saleId: string;
  onClose: () => void;
}

export default function SaleDetails({ saleId, onClose }: SaleDetailsProps) {
  const { sales, addPayment, getPaymentsBySaleId, articles } = useDataStore();
  const sale = sales.find((s) => s.id === saleId);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showPaymentInput, setShowPaymentInput] = useState(false);

  const payments = sale ? getPaymentsBySaleId(sale.id) : [];
  // Use the sale's paidAmount (updated by addPayment) or calculate from payments
  const displayPaidAmount = sale?.paidAmount !== undefined ? sale.paidAmount : payments.reduce((sum, p) => sum + p.amount, 0);

  if (!sale) {
    return null;
  }

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    const remaining = sale.total - displayPaidAmount;
    if (amount > 0 && amount <= remaining) {
      addPayment({
        id: `payment-${Date.now()}`,
        saleId: sale.id,
        amount,
        timestamp: new Date(),
      });
      setPaymentAmount('');
      setShowPaymentInput(false);
      // Force a re-render by updating the sale (addPayment already updates it, but this ensures UI refresh)
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="medium" title="Detajet e Preventivit">
      <div className="sale-details">
        <div className="sale-details-header">
          <div className="sale-details-actions">
            <button onClick={() => window.print()} className="sale-details-print-btn">
              🖨️ Printo
            </button>
            {!sale.paid && (
              <button
                onClick={() => setShowPaymentInput(!showPaymentInput)}
                className="sale-details-payment-btn"
              >
                Shto Pagese
              </button>
            )}
          </div>
          <div className="sale-details-info">
            <div><strong>Klienti:</strong> {sale.clientName}</div>
            {sale.clientReference && (
              <div><strong>Referenca e Klientit:</strong> {sale.clientReference}</div>
            )}
            <div><strong>Data:</strong> {format(sale.date, 'dd/MM/yyyy')}</div>
            <div><strong>Ora:</strong> {format(sale.date, 'HH:mm:ss')}</div>
            <div><strong>Krijuar nga:</strong> {sale.username}</div>
            <div><strong>Totali:</strong> {sale.total.toFixed(2)}</div>
            <div><strong>Paguar:</strong> {(sale.paid || displayPaidAmount >= sale.total) ? 'Po' : `${displayPaidAmount.toFixed(2)} / ${sale.total.toFixed(2)}`}</div>
          </div>
        </div>

        {showPaymentInput && (
          <div className="sale-details-payment-input">
            <label>
              Sasia e paguar:
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={sale.total - displayPaidAmount}
                placeholder="0.00"
              />
            </label>
            <div className="sale-details-payment-actions">
              <button onClick={handleAddPayment}>Ruaj pagesen</button>
              <button onClick={() => {
                setShowPaymentInput(false);
                setPaymentAmount('');
              }}>Anullo</button>
            </div>
          </div>
        )}

        {payments.length > 0 && (
          <div className="sale-details-payment-history">
            <h3>Historia e pagesave</h3>
            <table className="sale-details-payment-table">
              <thead>
                <tr>
                  <th>Sasia</th>
                  <th>Data & Ora</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.amount.toFixed(2)}</td>
                    <td>{format(payment.timestamp, 'dd/MM/yyyy HH:mm:ss')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="sale-details-table-container">
          <table className="sale-details-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kodi i Artikullit</th>
                  <th>Emri i Artikullit</th>
                  <th className="hide-on-print">Kosto</th>
                  <th>Cmimi i njesise</th>
                  <th>Sasia</th>
                  <th>Totali</th>
                </tr>
              </thead>
            <tbody>
              {sale.items.map((item, index) => {
                const article = articles.find(a => a.id === item.articleId);
                const cost = article?.cost || 0;

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.articleCode}</td>
                    <td>{item.articleName}</td>
                    <td className="hide-on-print">{cost.toFixed(2)}</td>
                    <td>{item.unitPrice.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>{item.total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

