import { useEffect, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import React from 'react';

export default function Dashboard() {
  const {
    analytics,
    notifications,
    topProducts,
    activeClients,
    refreshAnalytics,
    markNotificationRead,
    markAllNotificationsRead,
  } = useDataStore();

  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    refreshAnalytics();
    // Load notes from localStorage
    const savedNotes = localStorage.getItem('dashboard-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [refreshAnalytics]);

  useEffect(() => {
    // Save notes to localStorage
    localStorage.setItem('dashboard-notes', notes);
  }, [notes]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mock time series data for graphs
  const salesData = [
    { name: 'Jan', value: analytics?.totalSales || 0 },
    { name: 'Feb', value: (analytics?.totalSales || 0) * 1.1 },
    { name: 'Mar', value: (analytics?.totalSales || 0) * 1.2 },
    { name: 'Apr', value: (analytics?.totalSales || 0) * 1.15 },
    { name: 'May', value: (analytics?.totalSales || 0) * 1.3 },
    { name: 'Jun', value: (analytics?.totalSales || 0) * 1.4 },
  ];


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Kryefaqja</h1>
      </div>

      <div className="dashboard-grid">
        {/* Analytics Graphs */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Shitjet Totale</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Te Ardhurat Totale</h3>
          <div className="dashboard-metric">
            {analytics?.totalRevenue.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Fitimi Total</h3>
          <div className="dashboard-metric">
            {analytics?.totalProfit.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Borxhet Total</h3>
          <div className="dashboard-metric dashboard-metric-danger">
            {analytics?.totalDebt.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Vlera e Inventarit</h3>
          <div className="dashboard-metric">
            {analytics?.inventoryValue.toFixed(2) || '0.00'}
          </div>
        </div>

        {/* Notes Section */}
        <div className="dashboard-card dashboard-notes">
          <h3 className="dashboard-card-title">Shenime</h3>
          <textarea
            className="dashboard-notes-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal reminders..."
          />
        </div>

        {/* Notifications */}
        <div className="dashboard-card dashboard-notifications">
          <div className="dashboard-notifications-header">
            <h3 className="dashboard-card-title">
              Lajmerime
              {unreadCount > 0 && (
                <span className="dashboard-notification-badge">{unreadCount}</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                className="dashboard-mark-read"
                onClick={markAllNotificationsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="dashboard-notifications-list">
            {notifications.length === 0 ? (
              <div className="dashboard-empty">Nuk ka lajmerime</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`dashboard-notification-item ${
                    !notification.read ? 'unread' : ''
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                  title={notification.description}
                >
                  <span className="dashboard-notification-type">
                    {notification.type}
                  </span>
                  <span className="dashboard-notification-desc">
                    {notification.description}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Produketet me te shitura</h3>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Produktet</th>
                  <th>Sasia e shitur</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="dashboard-empty">
                      Nuk ka te dhena
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product) => (
                    <tr key={product.articleId}>
                      <td>{product.articleName}</td>
                      <td>{product.quantitySold}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Clients */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">Klientet me aktiv</h3>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Klient</th>
                  <th>Blerjet Totale</th>
                </tr>
              </thead>
              <tbody>
                {activeClients.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="dashboard-empty">
                      Nuk ka te dhena
                    </td>
                  </tr>
                ) : (
                  activeClients.map((client) => (
                    <tr key={client.clientId}>
                      <td>{client.clientName}</td>
                      <td>{client.totalPurchases}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

