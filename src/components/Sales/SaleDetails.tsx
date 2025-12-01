import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { format } from 'date-fns';
import Modal from '../Modal';
import './SaleDetails.css';

interface SaleDetailsProps {
  saleId: string;
  onClose: () => void;
}

export default function SaleDetails({ saleId, onClose }: SaleDetailsProps) {
  const { sales, addPayment, getPaymentsBySaleId } = useDataStore();
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
    <Modal isOpen={true} onClose={onClose} size="medium" title="Sale Details">
      <div className="sale-details">
        <div className="sale-details-header">
          <div className="sale-details-actions">
            <button onClick={() => window.print()} className="sale-details-print-btn">
              Print
            </button>
            {!sale.paid && (
              <button
                onClick={() => setShowPaymentInput(!showPaymentInput)}
                className="sale-details-payment-btn"
              >
                Add Payment
              </button>
            )}
          </div>
          <div className="sale-details-info">
            <div><strong>Customer:</strong> {sale.clientName}</div>
            {sale.clientReference && (
              <div><strong>Client Reference:</strong> {sale.clientReference}</div>
            )}
            <div><strong>Date:</strong> {format(sale.date, 'dd/MM/yyyy')}</div>
            <div><strong>Created by:</strong> {sale.username}</div>
            <div><strong>Total:</strong> ${sale.total.toFixed(2)}</div>
            <div><strong>Paid:</strong> {(sale.paid || displayPaidAmount >= sale.total) ? 'Yes' : `$${displayPaidAmount.toFixed(2)} / $${sale.total.toFixed(2)}`}</div>
          </div>
        </div>

        {showPaymentInput && (
          <div className="sale-details-payment-input">
            <label>
              Payment Amount:
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
              <button onClick={handleAddPayment}>Save Payment</button>
              <button onClick={() => {
                setShowPaymentInput(false);
                setPaymentAmount('');
              }}>Cancel</button>
            </div>
          </div>
        )}

        {payments.length > 0 && (
          <div className="sale-details-payment-history">
            <h3>Payment History</h3>
            <table className="sale-details-payment-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>${payment.amount.toFixed(2)}</td>
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
                  <th>Article Code</th>
                  <th>Article Name</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.articleCode}</td>
                  <td>{item.articleName}</td>
                  <td>${item.unitPrice.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

