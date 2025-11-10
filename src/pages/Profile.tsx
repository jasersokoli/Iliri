import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import './Profile.css';

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'password' | 'email'>('account');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const handleThemeToggle = () => {
    const newTheme = user?.theme === 'dark' ? 'light' : 'dark';
    updateUser({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handlePasswordChange = async () => {
    setErrors({});
    setMessage('');

    if (!currentPassword) {
      setErrors({ currentPassword: 'Current password is required' });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrors({ newPassword: 'New password must be at least 8 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    // TODO: Replace with actual API call
    // Mock password change
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Revoke all sessions and force re-login
      logout();
      setMessage('Password changed successfully. Please sign in again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setErrors({ general: 'Failed to change password. Please try again.' });
    }
  };

  const handleEmailChange = async () => {
    setErrors({});
    setMessage('');

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setErrors({ newEmail: 'Please enter a valid email address' });
      return;
    }

    // TODO: Replace with actual API call
    // Mock email change - requires verification
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMessage('Verification link has been sent to the admin email. Please check your email to complete the update.');
      setNewEmail('');
    } catch (error) {
      setErrors({ general: 'Failed to send verification email. Please try again.' });
    }
  };

  return (
    <div className="profile">
      <h1 className="profile-title">Account Info</h1>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account Info
        </button>
        <button
          className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button
          className={`profile-tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          Change Email
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'account' && (
          <div className="profile-section">
            <h2 className="profile-section-title">Account Information</h2>
            <div className="profile-field">
              <label className="profile-label">Name</label>
              <div className="profile-value">{user?.name}</div>
            </div>
            <div className="profile-field">
              <label className="profile-label">Email</label>
              <div className="profile-value">{user?.email}</div>
            </div>
            <div className="profile-field">
              <label className="profile-label">Theme Preference</label>
              <div className="profile-theme-toggle">
                <span>Light Mode</span>
                <button
                  className={`profile-toggle ${user?.theme === 'dark' ? 'dark' : ''}`}
                  onClick={handleThemeToggle}
                  aria-label="Toggle theme"
                >
                  <span className="profile-toggle-slider"></span>
                </button>
                <span>Dark Mode</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="profile-section">
            <h2 className="profile-section-title">Change Password</h2>
            {errors.general && (
              <div className="profile-error">{errors.general}</div>
            )}
            {message && (
              <div className="profile-success">{message}</div>
            )}
            <div className="profile-field">
              <label className="profile-label" htmlFor="current-password">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword) {
                    setErrors((prev) => ({ ...prev, currentPassword: '' }));
                  }
                }}
                className={`profile-input ${errors.currentPassword ? 'error' : ''}`}
              />
              {errors.currentPassword && (
                <span className="profile-field-error">{errors.currentPassword}</span>
              )}
            </div>
            <div className="profile-field">
              <label className="profile-label" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }
                }}
                className={`profile-input ${errors.newPassword ? 'error' : ''}`}
              />
              {errors.newPassword && (
                <span className="profile-field-error">{errors.newPassword}</span>
              )}
            </div>
            <div className="profile-field">
              <label className="profile-label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                className={`profile-input ${errors.confirmPassword ? 'error' : ''}`}
              />
              {errors.confirmPassword && (
                <span className="profile-field-error">{errors.confirmPassword}</span>
              )}
            </div>
            <button className="profile-button" onClick={handlePasswordChange}>
              Change Password
            </button>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="profile-section">
            <h2 className="profile-section-title">Change Email</h2>
            {errors.general && (
              <div className="profile-error">{errors.general}</div>
            )}
            {message && (
              <div className="profile-success">{message}</div>
            )}
            <div className="profile-field">
              <label className="profile-label">Current Email</label>
              <div className="profile-value">{user?.email}</div>
            </div>
            <div className="profile-field">
              <label className="profile-label" htmlFor="new-email">
                New Email
              </label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (errors.newEmail) {
                    setErrors((prev) => ({ ...prev, newEmail: '' }));
                  }
                }}
                className={`profile-input ${errors.newEmail ? 'error' : ''}`}
                placeholder="Enter new email address"
              />
              {errors.newEmail && (
                <span className="profile-field-error">{errors.newEmail}</span>
              )}
            </div>
            <p className="profile-hint">
              A verification link will be sent to the admin email. Your email will be updated after verification.
            </p>
            <button className="profile-button" onClick={handleEmailChange}>
              Send Verification Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

