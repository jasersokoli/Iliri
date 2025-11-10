import { useDataStore } from '../../store/dataStore';
import { format } from 'date-fns';
import Modal from '../Modal';
import './SaleDetails.css';

interface SaleDetailsProps {
  saleId: string;
  onClose: () => void;
}

export default function SaleDetails({ saleId, onClose }: SaleDetailsProps) {
  const { sales } = useDataStore();
  const sale = sales.find((s) => s.id === saleId);

  if (!sale) {
    return null;
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="medium" title="Sale Details">
      <div className="sale-details">
        <div className="sale-details-header">
          <div className="sale-details-info">
            <div><strong>Customer:</strong> {sale.clientName}</div>
            {sale.clientReference && (
              <div><strong>Client Reference:</strong> {sale.clientReference}</div>
            )}
            <div><strong>Date:</strong> {format(sale.date, 'dd/MM/yyyy')}</div>
            <div><strong>Created by:</strong> {sale.username}</div>
            <div><strong>Total:</strong> ${sale.total.toFixed(2)}</div>
          </div>
        </div>

        <div className="sale-details-table-container">
          <table className="sale-details-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Article Code</th>
                <th>Article Name</th>
                <th>Price Type</th>
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
                  <td>{item.priceType}</td>
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

